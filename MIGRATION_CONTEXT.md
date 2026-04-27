# CUBRID WebManager Migration Context

이 문서는 `cubrid-webmanager`의 구조, 목적, 운영 패턴, 에러 규칙, 배포 방식, 그리고 **다른 프로젝트(특히 Electron IPC 기반)**로 이식할 때 필요한 컨텍스트를 가능한 한 상세하게 담은 마이그레이션 기준 문서다.

---

## 1) 프로젝트 목적과 제품 관점

`cubrid-webmanager`는 CUBRID 운영 관리를 위한 웹 애플리케이션이다. 크게 두 축으로 구성된다.

- 프론트엔드(`apps/web-manager`): 운영 UI
- 백엔드(`apps/api-server`): 인증, 호스트 관리, CMS 연동, DB/브로커/모니터링 API

핵심 비즈니스 성격:

- 다중 host(CUBRID 매니저 대상) 관리
- host별 CMS 로그인 토큰 관리
- DB 라이프사이클(start/stop/restart/create/delete)
- DB 설정/자동화(auto-exec-query, auto-start, auto-add-vol)
- 브로커, 파일, HA, 모니터링 기능

---

## 2) 모노레포/빌드 시스템

워크스페이스는 Nx 기반 모노레포다.

- 루트 설정: `nx.json`
- 공통 TS 경로 별칭: `tsconfig.base.json`
- 앱 2개 + 공유 인터페이스 라이브러리
  - `apps/api-server`
  - `apps/web-manager`
  - `libs/api-interfaces`

### 루트 스크립트 특징 (`package.json`)

- 통합 빌드: `npm run build` (`nx run-many -t build --all`)
- 백엔드 실행: `npm run dev:api-server`
- 프론트 실행: `npm run dev:web-manager`
- 백엔드 타입체크: `npm run typecheck:api-server`
- HTTPS 프론트/프록시 도구:
  - `tools/serve-web-manager-https-proxy.js`
  - `tools/run-web-manager-https-stack.js`

### Node/npm 호환성 주의

현재 lockfile은 `lockfileVersion: 3`이다.  
즉 npm 6(예: Node 10 환경)에서는 `npm ci`가 깨질 수 있다.

- 권장: Node 18+ / npm 9+
- 과거 실제 이슈: npm6에서 `Cannot read property '@nestjs/axios' of undefined`

---

## 3) 디렉토리 구조 (핵심만)

### 백엔드 `apps/api-server/src`

- `main.ts`: Nest 부트스트랩, HTTPS, CORS, 글로벌 인터셉터/필터 등록
- `app.module.ts`: 전체 모듈 결합 지점
- `auth`, `token`, `security`: 인증/JWT/암호화
- `host`, `database`, `broker`, `file`, `ha`, `monitoring`: 도메인 서비스
- `cms-*`: CMS 연동 전용 서비스
- `repository`, `storage`, `lock`: 저장소/락/원자 업데이트 인프라
- `error`: 도메인 에러, 글로벌 예외 필터, 에러 메시지 매핑
- `common`: 인터셉터, 데코레이터, 공통 헬퍼
- `type`: 내부 타입 모델
- `config`: 런타임 env/CLI 인자/키 파생

### 프론트 `apps/web-manager/src`

- `api/apiClient.js`: Axios 인스턴스 + 토큰 + 응답 언랩 + 401 리프레시 로직
- `features/*`: 기능별 slice/화면
- API base URL 기본값: `/api` (same-origin 프록시 패턴)

### 공유 타입 `libs/api-interfaces/src`

- `request/*`, `response/*`
- 표준 응답 타입(`StandardResponse`) 및 요청/응답 계약

---

## 4) 백엔드 실행/환경 규칙

## HTTPS 기본 동작

`main.ts`에서 `getHttpsOptions()`를 이용해 HTTPS 서버를 생성한다.  
따라서 배포 시 TLS 파일/경로를 반드시 맞춰야 한다.

## CORS 정책

`ConfigService`의 `ALLOWED_ORIGINS`/`ENVIRONMENT`로 결정된다.

- `development`: 강제 `['*']`
- `production`: `ALLOWED_ORIGINS` CSV 파싱

중요 포인트:

- CLI 인자는 `--KEY=value` 형식만 인식 (`parse-cli-args.ts`)
- 공백 포함 `--ALLOWED_ORIGINS = ...` 형식은 무시됨
- Origin 일치 비교는 포트 포함 정확 매칭이 필요
  - 예: `https://192.168.7.31:8443`

## 런타임 env 로딩 우선순위

`load-runtime-env.ts` 기준:

- production:
  1. `/etc/cubrid-webmanager.env`
  2. `apps/api-server/.env`
  3. `.env`
- non-production:
  1. `.env`
  2. `apps/api-server/.env`

`override: false`이므로 이미 설정된 환경변수는 덮지 않는다.

---

## 5) API 응답/에러 처리 패턴 (중요)

## 성공 응답

`SuccessResponseInterceptor`가 모든 성공 응답을 표준 포맷으로 래핑:

- `data`: payload
- `status`: HTTP status
- `note`: `"success"`

## 실패 응답

`GlobalExceptionFilter`가 모든 예외를 `StandardResponse`로 변환:

- `data`: 문제 세부(`code`, `type`, `title`, `message`, `detail`)
- `status`: HTTP status
- `note`: 사용자 노출 메시지

## 공개 메시지 정책

`error/client-error-messages.ts`가 사용자용 메시지를 결정한다.

- 내부/민감 정보는 숨김
- kind/code 기반 고정 메시지 사용
- CMS는 `note`가 의미 있으면 우선 사용

즉, 같은 기술적 원인이라도 `AUTH`/`DATABASE`/`CMS` kind에 따라 사용자가 받는 문구가 달라진다.

---

## 6) 도메인 에러 모델

기반 클래스:

- `AppError` (`kind`, `code`, `additionalData`, `originalError`)

대표 kind:

- `AUTH`, `DATABASE`, `CMS`, `CONFIG`, `RESOURCE`, `USER`, `VALIDATION`, `BROKER`, `LOCK`, `STORAGE`

HTTP status는 `AppError.getHttpStatus()`에서 kind/code별로 매핑된다.

### 과거 실제 이슈 패턴

입력 검증 오류가 `HandleDatabaseErrors`에서 `DatabaseError.UNKNOWN`으로 래핑되면  
클라이언트가 400이 아닌 500을 받는다.

해결 방향:

- `ValidationError`는 pass-through 해야 한다.
- 데코레이터 계층에서 AppError 래핑 정책을 신중히 유지해야 한다.

---

## 7) 저장소/동시성/암호화 패턴

유저 저장 구조(`UserRepositoryService`):

- 키: `id` 해시값
- 값: JSON 암호문
- 저장소: 파일 기반(`StorageService`)

원자 업데이트:

- `atomicUpdateUser()` + `LockService.withLock()` 패턴
- read/decrypt/modify/encrypt/write를 lock 구간에서 수행

암호화/보안:

- 대칭키는 `SEED + SALT`로 PBKDF2 파생 (`master-key.ts`)
- 비밀번호는 `PasswordService` 해시

마이그레이션 시 반드시 유지할 invariants:

- 사용자 파일 키 스킴(해시 키)
- 원자 업데이트/락
- 암호화 키 파생 규칙

---

## 8) CMS 연동 패턴

공통 베이스:

- `BaseService.executeCmsRequest()`
  - host 조회
  - URL 구성 (`https://{host.address}:{host.port}/cm_api`)
  - token 주입
  - `checkCmsTokenError`, `checkCmsStatusError`

모든 도메인 서비스는 이 베이스를 통해 CMS 요청을 보내는 것이 일관 패턴이다.

마이그레이션 시 동일 추상화 권장:

- `CmsGateway` 인터페이스를 두고
- request/response envelope 제거(`extractDomainData`) 패턴 유지

---

## 9) 데이터 모델 핵심

### `HostInfo` (`type/host-info.ts`)

- `uid`, `id`, `address`, `port`, `password`, `token?`, `alias?`, `dbProfiles`
- 최근 추가 맥락으로 `initialLogin` 필드가 운영 논의 대상이었음
  - 생성 시 기본 `true`
  - host 로그인 성공 시 `false` 전환
  - 구 데이터 호환을 위한 기본값 보정 필요

### `User`

- `host_list`, `ha_mon_list`, `resource_mon_list`, `user_preference`

도메인 로직은 `host_list`를 중심으로 거의 모든 CMS 액션을 수행한다.

---

## 10) 프론트 API 통신 패턴

`apiClient.js` 특징:

- `baseURL = VITE_API_BASE_URL || '/api'`
- 토큰 헤더 자동 주입
- 표준 응답 언랩 (`{ data, status, note } -> data`)
- host 단위 401 발생 시 재로그인 플로우 시도

운영 프록시 패턴:

- 프론트는 `/api/...`로 호출
- nginx/express proxy가 백엔드로 전달
- same-origin 구성으로 CORS 리스크 감소

실무상 자주 나는 문제:

- 프론트가 `127.0.0.1` 하드코딩 -> 배포 환경에서 오동작
- HTTPS 페이지에서 HTTP API 호출(Mixed Content)

---

## 11) 배포/런타임 운영 패턴

## CI

`.github/workflows/build-executables.yml`:

- Node 20
- `npm ci`
- `typecheck:api-server`
- `nx run-many --target=build --all`
- 공식 저장소 develop push 시 `dist/` artifact 업로드

## 배포 스크립트 도구

- `tools/serve-web-manager.js`: 정적 서빙(HTTP)
- `tools/serve-web-manager-https-proxy.js`: HTTPS + `/api` 프록시
- `tools/run-web-manager-https-stack.js`: API + HTTPS 프록시 동시 실행

## 운영 명령 관례

- 서비스 재시작: `systemctl restart ...`
- 로그: `journalctl -u ... -n 100 --no-pager`
- 산출물 이동/동기화: `mv`, `rsync`, `scp`

---

## 12) 알려진 장애/트러블슈팅 지식

### A. npm6 + lockfile v3

- 증상: `Cannot read property '...' of undefined` during `npm ci`
- 원인: npm 6이 lockfile v3 파싱 불가
- 조치: Node 18+/npm 9+ 사용

### B. CORS 오판

- 증상: CORS처럼 보이나 실제로는 잘못된 API base URL/프록시 미적용
- 체크:
  - 브라우저 Request URL이 `/api/...`인지
  - Origin에 포트까지 포함해 whitelist 일치하는지
  - `--ALLOWED_ORIGINS=...` 형식 공백 없는지

### C. automation(특히 `auto-exec-query`) 500

- 원인 패턴: CMS 응답에서 `planlist`/`queryplan` 누락 시 `.map` 호출
- 조치: null-safe 처리 (`Array.isArray(...) ? ... : []`)

### D. 입력 검증이 500으로 승격

- 원인: 데코레이터에서 `ValidationError`를 `DatabaseError.UNKNOWN`으로 변환
- 조치: `ValidationError` pass-through

---

## 13) 다른 프로젝트로 이식 시 유지해야 할 아키텍처 규칙

## 도메인 계층화

- API 계층(컨트롤러/IPC 핸들러)과 도메인 서비스 분리
- CMS 통신/스토리지/락은 인프라 계층으로 고정

## 계약 우선

- `libs/api-interfaces` 같은 request/response 계약 계층 유지
- 응답 envelope 표준 유지 여부를 초기 결정

## 에러 정책 일관성

- 내부 에러 숨김 + 사용자 메시지 매핑 유지
- kind/code 시스템 유지(또는 명시적 대체)

## 동시성/일관성

- 파일 저장이라면 lock + atomic write 반드시 유지

---

## 14) Electron IPC 기반으로 옮길 때 (포트 사용 금지 가정)

이 프로젝트 컨텍스트를 다른 Electron 프로젝트로 옮길 때 권장 전략:

### 목표 구조

- `main`: 시스템 권한 + 서비스 호출
- `preload`: 안전한 IPC 브릿지 (`contextBridge`)
- `renderer`: UI (`window.api.*`만 사용)

### 금지/권장

- 금지: renderer 직접 Node 접근, 임의 IPC 채널
- 권장:
  - `nodeIntegration: false`
  - `contextIsolation: true`
  - 채널/입력 스키마 화이트리스트

### 단계별 이식

1. 도메인/유스케이스 목록 추출
2. IPC contracts 정의 (`channel`, `request`, `response`)
3. 컨트롤러를 IPC 핸들러로 교체
4. 프론트 API 호출을 `window.api`로 교체
5. 에러 매핑 정책 동일 적용
6. 회귀 테스트

### 우선 이식 추천 유스케이스

1. `auth/login`
2. `host/list`, `host/login`
3. `database/register`
4. `database/start|stop|restart`

---

## 15) 마이그레이션 체크리스트

### 기능 체크

- [ ] 인증/JWT 흐름 동등
- [ ] host 토큰 재로그인 흐름 동등
- [ ] DB 자동화(auto-*) 응답 구조 동등
- [ ] 파일/브로커/HA 최소 핵심 API 동등

### 비기능 체크

- [ ] 에러 status/code/message 동등
- [ ] 민감정보 비노출
- [ ] 락/원자성 유지
- [ ] CORS/Origin/HTTPS 운영 파라미터 문서화

### 운영 체크

- [ ] Node/npm 버전 명시
- [ ] 배포 스크립트/서비스 재시작/로그 확인 절차 문서화
- [ ] rollback 절차 (`git revert`) 문서화

---

## 16) 신규 프로젝트 킥오프 시 권장 산출물

마이그레이션 시작 전에 아래 파일을 먼저 만드는 것을 권장:

- `docs/ARCHITECTURE.md`
- `docs/IPC_CONTRACTS.md`
- `docs/ERROR_POLICY.md`
- `docs/RUNTIME_CONFIG.md`
- `docs/OPERATIONS_RUNBOOK.md`

이 문서(`MIGRATION_CONTEXT.md`)는 위 산출물을 채우기 위한 소스 오브 트루스로 사용한다.

---

## 17) 빠른 요약

- 이 프로젝트는 Nx 모노레포 + Nest API + React UI + CMS 연동 구조다.
- 응답/에러는 강한 표준화(`StandardResponse`, `AppError`)를 가진다.
- 파일 기반 저장소/락/암호화가 핵심 인프라 패턴이다.
- 운영에서 CORS/Origin/Node 버전 이슈가 자주 발생한다.
- 다른 프로젝트로의 이식은 가능하며, 핵심은 “도메인 유지 + 운반체(HTTP/Electron IPC) 교체”다.

