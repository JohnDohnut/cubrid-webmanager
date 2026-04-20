#!/usr/bin/env bash
# 로컬에서 ENVIRONMENT=production 테스트용 자체서명 PEM 생성 → apps/api-server/ssl/
# 사용: ./scripts/generate-local-production-ssl.sh
# (선택) 추가 IP/SAN: SAN_IP=192.168.1.1 ./scripts/generate-local-production-ssl.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSL_DIR="${ROOT}/apps/api-server/ssl"
mkdir -p "$SSL_DIR"

CERT="${SSL_DIR}/cert.pem"
KEY="${SSL_DIR}/key.pem"

SAN_IP="${SAN_IP:-}"
ALT="DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1"
if [[ -n "$SAN_IP" ]]; then
  ALT="${ALT},IP:${SAN_IP}"
fi

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "$KEY" \
  -out "$CERT" \
  -days 825 \
  -subj "/CN=localhost/O=CUBRID Web Manager (local prod test)" \
  -addext "subjectAltName=${ALT}"

chmod 640 "$KEY"
chmod 644 "$CERT"

echo "생성됨:"
echo "  SSL_CERT_PATH=${CERT}"
echo "  SSL_KEY_PATH=${KEY}"
echo ""
echo "워크스페이스 루트 기준 .env 예:"
echo "  SSL_CERT_PATH=apps/api-server/ssl/cert.pem"
echo "  SSL_KEY_PATH=apps/api-server/ssl/key.pem"
