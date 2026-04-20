#!/usr/bin/env bash
#
# CUBRID Web Manager — 서버 초기 배포 (Linux: Debian/Ubuntu, RHEL 계열)
#
# 순서: Node → nginx → TLS(자체서명) → dist zip 배치 → /etc/cubrid-webmanager.env → systemd API → nginx
#
#   sudo ./scripts/deploy-cubrid-webmanager.sh
#   sudo CWM_ARTIFACT_ZIP=~/dist.zip CWM_SEED=s CWM_SALT=t CWM_ALLOWED_ORIGINS='https://h:443' ./scripts/deploy-cubrid-webmanager.sh
#

set -euo pipefail

CWM_INSTALL_ROOT="${CWM_INSTALL_ROOT:-/opt/cubrid-webmanager}"
CWM_SSL_DIR="${CWM_SSL_DIR:-/etc/ssl/cubrid-webmanager}"
CWM_ENV_FILE="${CWM_ENV_FILE:-/etc/cubrid-webmanager.env}"
CWM_NODE_MAJOR="${CWM_NODE_MAJOR:-20}"
CWM_API_PORT="${CWM_API_PORT:-8080}"
CWM_NGINX_SSL_PORT="${CWM_NGINX_SSL_PORT:-443}"

die() { echo "오류: $*" >&2; exit 1; }

need_root() {
  [[ "${EUID:-$(id -u)}" -eq 0 ]] || die "root 또는 sudo 로 실행하세요."
}

detect_pkg() {
  if command -v apt-get >/dev/null 2>&1; then
    echo debian
  elif command -v dnf >/dev/null 2>&1; then
    echo rhel_dnf
  elif command -v yum >/dev/null 2>&1; then
    echo rhel_yum
  else
    die "지원 패키지 매니저를 찾지 못했습니다 (apt/dnf/yum)."
  fi
}

step_install_node() {
  echo "=== [1] Node.js ${CWM_NODE_MAJOR}.x 설치 ==="
  if command -v node >/dev/null 2>&1; then
    node -v
    return
  fi
  local pm
  pm=$(detect_pkg)
  case "$pm" in
    debian)
      apt-get update -y
      apt-get install -y ca-certificates curl gnupg
      mkdir -p /etc/apt/keyrings
      curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
      echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${CWM_NODE_MAJOR}.x nodistro main" \
        > /etc/apt/sources.list.d/nodesource.list
      apt-get update -y
      apt-get install -y nodejs
      ;;
    rhel_dnf)
      curl -fsSL "https://rpm.nodesource.com/setup_${CWM_NODE_MAJOR}.x" | bash -
      dnf install -y nodejs
      ;;
    rhel_yum)
      curl -fsSL "https://rpm.nodesource.com/setup_${CWM_NODE_MAJOR}.x" | bash -
      yum install -y nodejs
      ;;
  esac
  node -v
}

step_install_nginx() {
  echo "=== [2] nginx 설치 ==="
  if command -v nginx >/dev/null 2>&1; then
    nginx -v
    return
  fi
  local pm
  pm=$(detect_pkg)
  case "$pm" in
    debian) apt-get install -y nginx ;;
    rhel_dnf) dnf install -y nginx ;;
    rhel_yum) yum install -y nginx ;;
  esac
}

step_tls() {
  echo "=== [3] TLS 자체서명 인증서 (${CWM_SSL_DIR}) ==="
  mkdir -p "$CWM_SSL_DIR"
  local cert key cn
  cert="${CWM_SSL_DIR}/cert.pem"
  key="${CWM_SSL_DIR}/key.pem"
  if [[ -f "$cert" && -f "$key" ]]; then
    echo "기존 인증서 유지."
    return
  fi
  cn="${CWM_PUBLIC_IP:-localhost}"
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "$key" \
    -out "$cert" \
    -days 825 \
    -subj "/CN=${cn}/O=CUBRID Web Manager"
  chmod 640 "$key"
  chmod 644 "$cert"
}

resolve_artifact() {
  local z="${CWM_ARTIFACT_ZIP:-}"
  if [[ -n "$z" && -f "$z" ]]; then
    echo "$z"
    return
  fi
  if [[ -n "${GITHUB_RUN_ID:-}" ]] && command -v gh >/dev/null 2>&1 && [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
    local tmp
    tmp=$(mktemp -d)
    if gh run download "${GITHUB_RUN_ID}" -n cubrid-webmanager-dist -R "${GITHUB_REPOSITORY}" -D "$tmp" 2>/dev/null; then
      shopt -s nullglob
      local found=( "${tmp}"/*.zip )
      shopt -u nullglob
      [[ ${#found[@]} -gt 0 ]] || die "gh 다운로드에 zip 이 없습니다."
      echo "${found[0]}"
      return
    fi
  fi
  local reply
  read -r -p "dist 아티팩트 zip 경로 (GitHub Actions cubrid-webmanager-dist): " reply
  [[ -f "$reply" ]] || die "파일이 없습니다: $reply"
  echo "$reply"
}

step_unpack() {
  echo "=== [4][5] 빌드 산출물 → ${CWM_INSTALL_ROOT} ==="
  local zip
  zip=$(resolve_artifact)
  mkdir -p "$CWM_INSTALL_ROOT"
  if ! command -v unzip >/dev/null 2>&1; then
    local pm
    pm=$(detect_pkg)
    case "$pm" in
      debian) apt-get install -y unzip ;;
      rhel_dnf) dnf install -y unzip ;;
      rhel_yum) yum install -y unzip ;;
    esac
  fi
  unzip -o -q "$zip" -d "$CWM_INSTALL_ROOT"
  [[ -f "${CWM_INSTALL_ROOT}/dist/apps/api-server/main.js" ]] \
    || die "main.js 없음. zip 최상위에 dist/ 가 있어야 합니다."
}

read_env_inputs() {
  echo "=== [6][7][8][9] SEED / SALT / API PORT / ALLOWED_ORIGINS ==="
  local seed salt port origins
  seed="${CWM_SEED:-}"
  salt="${CWM_SALT:-}"
  port="${CWM_API_PORT:-8080}"
  origins="${CWM_ALLOWED_ORIGINS:-}"

  if [[ -z "$seed" ]]; then
    if [[ -t 0 ]]; then
      read -r -s -p "SEED: " seed
      echo
    else
      die "비대화식이면 CWM_SEED 를 설정하세요."
    fi
  fi
  if [[ -z "$salt" ]]; then
    if [[ -t 0 ]]; then
      read -r -s -p "SALT: " salt
      echo
    else
      die "비대화식이면 CWM_SALT 를 설정하세요."
    fi
  fi
  if [[ "${CWM_API_PORT_SET:-}" != 1 && -t 0 ]]; then
    read -r -p "API가 listen 할 포트 (백엔드, 기본 ${port}): " r
    [[ -n "$r" ]] && port="$r"
  fi
  if [[ -z "$origins" && -t 0 ]]; then
    read -r -p "ALLOWED_ORIGINS (쉼표로 구분, 예: https://192.168.1.1:443): " origins
  fi

  [[ -n "$seed" ]] || die "SEED 가 비었습니다."
  [[ -n "$salt" ]] || die "SALT 가 비었습니다."

  CWM_SEED="$seed"
  CWM_SALT="$salt"
  CWM_API_PORT="$port"
  CWM_ALLOWED_ORIGINS="$origins"

  if [[ -t 0 ]] && [[ -z "${CWM_NGINX_SSL_PORT_FIXED:-}" ]]; then
    read -r -p "nginx HTTPS 포트 (기본 ${CWM_NGINX_SSL_PORT}): " rp
    [[ -n "$rp" ]] && CWM_NGINX_SSL_PORT="$rp"
  fi
}

step_write_env() {
  umask 077
  cat >"$CWM_ENV_FILE" <<EOF
ENVIRONMENT=production
SEED=${CWM_SEED}
SALT=${CWM_SALT}
PORT=${CWM_API_PORT}
ALLOWED_ORIGINS=${CWM_ALLOWED_ORIGINS}
SSL_CERT_PATH=${CWM_SSL_DIR}/cert.pem
SSL_KEY_PATH=${CWM_SSL_DIR}/key.pem
EOF
  chmod 600 "$CWM_ENV_FILE"
  echo "작성: $CWM_ENV_FILE"
}

web_root_guess() {
  local base="${CWM_INSTALL_ROOT}/dist/apps/web-manager"
  if [[ -f "${base}/index.html" ]]; then
    echo "$base"
    return
  fi
  local found
  found=$(find "${CWM_INSTALL_ROOT}/dist/apps/web-manager" -name index.html 2>/dev/null | head -1) || true
  if [[ -n "$found" ]]; then
    dirname "$found"
    return
  fi
  echo "$base"
}

step_systemd() {
  echo "=== [10] 백엔드 systemd (cubrid-webmanager-api) ==="
  local svc=/etc/systemd/system/cubrid-webmanager-api.service
  cat >"$svc" <<EOF
[Unit]
Description=CUBRID Web Manager API (Node)
After=network.target

[Service]
Type=simple
WorkingDirectory=${CWM_INSTALL_ROOT}
EnvironmentFile=${CWM_ENV_FILE}
ExecStart=/usr/bin/node ${CWM_INSTALL_ROOT}/dist/apps/api-server/main.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable cubrid-webmanager-api.service
  systemctl restart cubrid-webmanager-api.service
  systemctl --no-pager -l status cubrid-webmanager-api.service || true
}

step_nginx_site() {
  echo "=== [11] nginx (HTTPS + SPA + /api → 백엔드) ==="
  local web_root
  web_root=$(web_root_guess)
  if [[ ! -f "${web_root}/index.html" ]]; then
    echo "경고: 프론트 index.html 없음 → ${web_root} (웹 빌드 포함 여부 확인)"
  fi

  local conf
  if [[ -d /etc/nginx/sites-available ]]; then
    conf=/etc/nginx/sites-available/cubrid-webmanager.conf
    ln -sf "$conf" /etc/nginx/sites-enabled/cubrid-webmanager.conf
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  else
    conf=/etc/nginx/conf.d/cubrid-webmanager.conf
  fi

  cat >"$conf" <<NGX
# CUBRID Web Manager
server {
    listen ${CWM_NGINX_SSL_PORT} ssl;
    server_name _;
    ssl_certificate     ${CWM_SSL_DIR}/cert.pem;
    ssl_certificate_key ${CWM_SSL_DIR}/key.pem;
    root ${web_root};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass https://127.0.0.1:${CWM_API_PORT};
        proxy_ssl_verify off;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGX

  nginx -t
  systemctl enable nginx
  systemctl restart nginx
  echo "HTTPS: https://<이 서버>:${CWM_NGINX_SSL_PORT}/"
  echo "API 프록시: /api/ → 백엔드. 프론트 빌드 시 VITE_API_BASE_URL=https://<호스트>:${CWM_NGINX_SSL_PORT}/api 권장."
}

main() {
  need_root
  step_install_node
  step_install_nginx
  step_tls
  step_unpack
  read_env_inputs
  step_write_env
  step_systemd
  step_nginx_site
  echo "=== 배포 스크립트 완료 ==="
}

main "$@"
