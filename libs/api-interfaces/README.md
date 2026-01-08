# API Interfaces

클라이언트와 서버 간에 공유되는 TypeScript 타입 정의 라이브러리입니다.

## 구조

- `request/`: 클라이언트에서 서버로 보내는 요청 타입
- `response/`: 서버에서 클라이언트로 보내는 응답 타입

## 사용 방법

### 서버에서 사용

```typescript
import { DatabaseClientRequest, DatabaseClientResponse } from '@api-interfaces';
```

### 클라이언트에서 사용

```typescript
import { DatabaseClientRequest, DatabaseClientResponse } from '@api-interfaces';
```

## 주의사항

이 라이브러리는 클라이언트-서버 간 공유 타입만 포함합니다.
서버 내부 전용 타입(CMS request/response 등)은 포함하지 않습니다.
