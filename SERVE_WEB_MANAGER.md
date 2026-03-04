# Web Manager 서빙 가이드

nginx 없이 Node.js만 사용해서 web-manager를 서빙하는 방법입니다.

## 방법 1: 제공된 스크립트 사용 (추천)

### 1단계: 프론트엔드 빌드

```bash
nx build web-manager
```

### 2단계: 서버 실행

```bash
# 기본 포트(4200)로 실행
npm run serve:web-manager

# 또는 직접 실행
node serve-web-manager.js

# 다른 포트로 실행
node serve-web-manager.js 8080
```

### 3단계: 접속

브라우저에서 `http://서버IP:4200` (또는 지정한 포트)로 접속하세요.

---

## 방법 2: npx serve 사용 (가장 간단)

### 1단계: 프론트엔드 빌드

```bash
nx build web-manager
```

### 2단계: 서버 실행

```bash
# 기본 포트(3000)로 실행
npx serve dist/apps/web-manager

# 특정 포트로 실행
npx serve dist/apps/web-manager -l 4200

# 모든 인터페이스에서 접속 가능하게 (0.0.0.0)
npx serve dist/apps/web-manager -l tcp://0.0.0.0:4200
```

### 3단계: 접속

브라우저에서 `http://서버IP:4200`로 접속하세요.

---

## 방법 3: npx http-server 사용

### 1단계: 프론트엔드 빌드

```bash
nx build web-manager
```

### 2단계: 서버 실행

```bash
# 기본 포트(8080)로 실행
npx http-server dist/apps/web-manager

# 특정 포트로 실행
npx http-server dist/apps/web-manager -p 4200

# 모든 인터페이스에서 접속 가능하게
npx http-server dist/apps/web-manager -p 4200 -a 0.0.0.0
```

### 3단계: 접속

브라우저에서 `http://서버IP:4200`로 접속하세요.

---

## 방법 4: Vite Preview 사용

### 1단계: 프론트엔드 빌드

```bash
nx build web-manager
```

### 2단계: Preview 서버 실행

```bash
# vite.config.mts의 preview 설정 사용 (기본 포트 4200)
npx vite preview --outDir dist/apps/web-manager

# 특정 포트로 실행
npx vite preview --outDir dist/apps/web-manager --port 4200

# 모든 인터페이스에서 접속 가능하게
npx vite preview --outDir dist/apps/web-manager --port 4200 --host 0.0.0.0
```

### 3단계: 접속

브라우저에서 `http://서버IP:4200`로 접속하세요.

---

## 리눅스 서버에서 백그라운드 실행

### 방법 1: nohup 사용

```bash
# 방법 1 (제공된 스크립트)
nohup node serve-web-manager.js 4200 > web-manager.log 2>&1 &

# 방법 2 (npx serve)
nohup npx serve dist/apps/web-manager -l tcp://0.0.0.0:4200 > web-manager.log 2>&1 &

# 방법 3 (npx http-server)
nohup npx http-server dist/apps/web-manager -p 4200 -a 0.0.0.0 > web-manager.log 2>&1 &
```

### 방법 2: screen 사용

```bash
# screen 세션 시작
screen -S web-manager

# 서버 실행
node serve-web-manager.js 4200

# Ctrl+A, D로 detach (백그라운드로 전환)
# 다시 접속하려면: screen -r web-manager
```

### 방법 3: tmux 사용

```bash
# tmux 세션 시작
tmux new -s web-manager

# 서버 실행
node serve-web-manager.js 4200

# Ctrl+B, D로 detach
# 다시 접속하려면: tmux attach -t web-manager
```

---

## systemd 서비스로 등록 (선택사항)

`/etc/systemd/system/web-manager.service` 파일 생성:

```ini
[Unit]
Description=Web Manager Frontend Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/cubrid-webmanager
ExecStart=/usr/bin/node /path/to/cubrid-webmanager/serve-web-manager.js 4200
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

서비스 시작:

```bash
sudo systemctl daemon-reload
sudo systemctl enable web-manager
sudo systemctl start web-manager
sudo systemctl status web-manager
```

---

## 방화벽 설정

리눅스 서버에서 포트를 열어야 할 수 있습니다:

```bash
# UFW 사용 시
sudo ufw allow 4200/tcp

# firewalld 사용 시
sudo firewall-cmd --permanent --add-port=4200/tcp
sudo firewall-cmd --reload

# iptables 사용 시
sudo iptables -A INPUT -p tcp --dport 4200 -j ACCEPT
```

---

## 주의사항

1. **프로덕션 환경**에서는 nginx나 Apache 같은 웹 서버 사용을 권장합니다.
2. **HTTPS**가 필요한 경우 nginx를 리버스 프록시로 사용하거나, Node.js에서 HTTPS를 직접 설정해야 합니다.
3. **보안**: 개발/테스트 목적으로만 사용하고, 프로덕션에서는 적절한 보안 설정을 추가하세요.

---

## 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :4200
# 또는
sudo netstat -tulpn | grep 4200

# 프로세스 종료
kill -9 <PID>
```

### 빌드 디렉토리가 없는 경우

```bash
# 빌드 실행
nx build web-manager

# 빌드 확인
ls -la dist/apps/web-manager
```
