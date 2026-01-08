# CUBRID Web Manager

CUBRID 데이터베이스 관리를 위한 모던 웹 애플리케이션입니다.

## 프로젝트 구조

```
cubrid-webmanager/
├── apps/
│   ├── web-manager/     # [REACT] The modern UI
│   ├── api-server/       # [NESTJS] Logic & CUBRID connection
│   └── desktop-shell/   # [ELECTRON] Future desktop wrapper
├── libs/
│   ├── cubrid-driver/   # Shared logic to connect to CUBRID database
│   ├── api-interfaces/  # TypeScript types (Shared by React, Nest, and Electron)
│   └── ui-components/   # Reusable Database tables, charts, and editors
├── nx.json
└── package.json
```

## 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

#### Frontend (React)
```bash
nx serve web-manager
```

#### Backend (NestJS)
```bash
# 기본 설정으로 실행 (SEED=seed, SALT=salt, PORT=8080)
nx serve api-server

# 커스텀 인자 전달 (--args 플래그 사용)
nx serve api-server --args="--SEED=myseed --SALT=mysalt --PORT=8081"

# 또는 configuration 사용
nx serve api-server --configuration=dev-with-port
```

**중요**: API 서버는 다음 커맨드라인 인자가 필수입니다:
- `--SEED={string}`: 암호화 시드 값 (필수)
- `--SALT={string}`: 암호화 솔트 값 (필수)
- `--PORT={number}`: 서버 포트 번호 (선택, 기본값: 8080)

### 빌드

```bash
# Frontend 빌드
nx build web-manager

# Backend 빌드
nx build api-server
```

### 실행 파일 빌드 (pkg)

`pkg`를 사용하여 단일 실행 파일로 빌드할 수 있습니다:

```bash
# 모든 플랫폼용 실행 파일 빌드 (Windows, Linux, macOS)
nx build:exe api-server --configuration=all

# 특정 플랫폼만 빌드
nx build:exe api-server --configuration=windows   # Windows만
nx build:exe api-server --configuration=linux    # Linux만
nx build:exe api-server --configuration=macos     # macOS만
```

빌드된 실행 파일은 `dist/executables/` 디렉토리에 생성됩니다:
- Windows: `api-server.exe`
- Linux: `api-server-linux`
- macOS: `api-server-macos`

**실행 파일 사용법:**
```bash
# Windows
dist/executables/api-server.exe --SEED=seed --SALT=salt --PORT=8080

# Linux
./dist/executables/api-server-linux --SEED=seed --SALT=salt --PORT=8080

# macOS
./dist/executables/api-server-macos --SEED=seed --SALT=salt --PORT=8080
```

**pkg 설정:**
- `pkg` 설정은 루트 `package.json`의 `pkg` 필드에 정의되어 있습니다.
- 빌드 시 이 설정이 자동으로 빌드된 `package.json`에 복사됩니다.
- 플랫폼별 타겟을 변경하려면 루트 `package.json`의 `pkg.targets`를 수정하거나, configuration을 사용하세요.

**참고:**
- webpack이 모든 의존성을 번들링하므로, 실행 파일은 Node.js 없이도 독립적으로 실행됩니다.
- TypeScript path alias는 빌드 시점에 해결되므로, 실행 파일에서도 정상적으로 작동합니다.
- `pkg`는 pre-built 바이너리를 사용하므로 빌드 도구가 필요 없고 안정적입니다.

## 기술 스택

- **Frontend**: React 19, Vite, Ant Design, Redux Toolkit
- **Backend**: NestJS 11, TypeScript
- **Monorepo**: Nx 22.3.3

## Nx Monorepo 구조 이해하기

Nx monorepo는 **단일 `package.json`**으로 모든 프로젝트의 의존성을 관리합니다.

### 핵심 개념

- **루트 `package.json`**: 모든 npm 패키지 의존성을 한 곳에서 관리
- **`project.json`**: 각 앱/라이브러리의 빌드/실행 설정 (의존성 관리 아님)
- **Path Alias**: TypeScript가 `@api-interfaces`, `@auth` 등을 실제 경로로 해결
- **번들링**: webpack이 빌드 시 모든 코드를 하나로 묶음

### 왜 각 앱에 `package.json`이 없을까?

일반적인 멀티 프로젝트는 각 프로젝트마다 `package.json`이 있지만, Nx monorepo는:
- ✅ **단일 의존성 관리**: 루트 `package.json` 하나로 모든 프로젝트 관리
- ✅ **중복 제거**: 같은 패키지가 여러 곳에 설치되지 않음
- ✅ **버전 통일**: 모든 프로젝트가 같은 버전 사용
- ✅ **공유 라이브러리**: `libs/`의 코드를 쉽게 공유

자세한 내용은 [`docs/NX_STRUCTURE.md`](./docs/NX_STRUCTURE.md)를 참고하세요.
