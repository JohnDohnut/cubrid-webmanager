# CUBRID Web Manager

CUBRID 데이터베이스 운영 관리를 위한 차세대 웹/데스크톱 애플리케이션입니다.

## 프로젝트 구조

```
cubrid-webmanager/
├── apps/
│   ├── web-manager/     # React 19 + Vite + Ant Design (프론트엔드)
│   ├── api-server/      # NestJS 11 + TypeScript (백엔드 API)
│   └── desktop/         # Electron 35 (데스크톱 래퍼)
├── libs/
│   └── api-interfaces/  # 공유 TypeScript 타입 (Request/Response)
├── scripts/             # 빌드 보조 스크립트
├── tools/               # 개발 도구 (HTTPS 프록시 등)
├── cwm.conf.sample      # 서버 배포용 설정 파일 샘플
└── package.json
```

## 시작하기

### 의존성 설치

```bash
npm install
```

---

## 개발 모드

### 방법 1 — 프론트 + API 각각 실행

```bash
npm run dev:web-manager   # React (Vite HMR, http://localhost:4200)
npm run dev:api-server    # NestJS (watch mode, https://localhost:8080)
```

개발 시 `.env` 또는 `apps/api-server/.env` 파일에 환경변수를 설정합니다:

```env
SEED=your-seed-value
SALT=your-salt-value
PORT=8080
```

### 방법 2 — HTTPS 스택 한번에 실행 (브라우저 테스트)

```bash
npm run dev:stack
```

NestJS API(:8080)와 HTTPS 프록시(:443)를 함께 실행합니다.
같은 자체 서명 인증서를 공유하므로 브라우저에서 한 번만 신뢰하면 됩니다.

---

## 빌드

```bash
npm run build:web-manager   # React만 빌드
npm run build:api-server    # NestJS만 빌드
npm run build:server        # 서버 배포용 통합 빌드 (아래 참고)
npm run build               # 전체 빌드
```

---

## 배포

### 방법 A — Node.js 직접 실행

```bash
npm run build:server
# → dist/apps/api-server/main.js + dist/apps/api-server/public/ 생성
```

배포 서버에서:
```bash
# cwm.conf 설정 후 실행
node dist/apps/api-server/main.js
```

### 방법 B — 단일 실행파일 패키징 (권장)

Node.js 없이 실행 가능한 실행파일로 패키징합니다.

```bash
npm run package:linux    # Linux용
npm run package:windows  # Windows용
npm run package:macos    # macOS용
npm run package:all      # 전 플랫폼 동시
```

출력물 (`dist/package/{platform}/`):
```
dist/package/linux/
  ├── cwm-linux          # 실행파일 (Node.js 내장)
  ├── public/            # React 정적 파일
  └── cwm.conf.sample    # 설정 파일 샘플
```

#### cwm.conf 설정

배포 폴더에 `cwm.conf.sample`을 `cwm.conf`로 복사 후 편집합니다:

```json
{
  "PORT": "8080",
  "ENVIRONMENT": "production",
  "STORAGE_PATH": "./data"
}
```

| 항목 | 설명 | 기본값 |
|------|------|--------|
| `PORT` | 서버 포트 | `8080` |
| `ENVIRONMENT` | 실행 환경 | `production` |
| `STORAGE_PATH` | 데이터 저장 경로 | `./data` |
| `SEED` | 암호화 시드 (없으면 자동 생성) | — |
| `SALT` | 암호화 솔트 (없으면 자동 생성) | — |
| `SSL_CERT_PATH` | 공인 인증서 경로 (없으면 자동 생성) | — |
| `SSL_KEY_PATH` | 공인 인증서 키 경로 | — |

#### 첫 실행 동작

1. `SEED` / `SALT` 없으면 자동 생성 후 `cwm.conf`에 저장
2. `ssl/` 폴더에 자체 서명 인증서 자동 생성 (없을 때)
3. 브라우저에서 `https://서버IP:PORT` 접속 → 인증서 한 번 신뢰

#### 실행

```bash
# Linux
./cwm-linux

# Windows
cwm.exe

# macOS
./cwm-macos
```

### 방법 C — Electron 데스크톱 앱

별도 브랜치(`project/electron-desktop`)에서 관리됩니다.

---

## 빌드된 서버 로컬 실행

```bash
npm run build:server
npm run start
# → https://localhost:8080 에서 실행
```

---

## 테스트 / 린트

```bash
npm run test                   # 전체 테스트
npm run test:api-server        # API 서버만
npm run lint                   # 전체 린트
npm run typecheck:api-server   # 타입 체크
npm run ci                     # 타입 체크 + 빌드 (CI용)
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, Vite 7, Ant Design 5, Redux Toolkit, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript, Passport JWT |
| Desktop | Electron 35 |
| Tooling | Nx 22, Webpack, pkg, Jest, ESLint |

---

## 환경변수 전체 목록

개발 시 `.env` 파일, 배포 시 `cwm.conf` 또는 시스템 환경변수로 설정합니다.

| 변수 | 설명 | 필수 |
|------|------|------|
| `SEED` | 암호화 시드 | ✅ (cwm.conf에서 자동 생성) |
| `SALT` | 암호화 솔트 | ✅ (cwm.conf에서 자동 생성) |
| `PORT` | API 서버 포트 (기본: 8080) | — |
| `ENVIRONMENT` | `development` / `production` | — |
| `STORAGE_PATH` | 데이터 저장 경로 | — |
| `SSL_CERT_PATH` | SSL 인증서 경로 (없으면 자동 생성) | — |
| `SSL_KEY_PATH` | SSL 키 경로 | — |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 (쉼표 구분) | — |
| `CWM_DESKTOP` | Electron 모드 (`1`) | — |
