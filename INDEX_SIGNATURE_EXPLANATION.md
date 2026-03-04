# TypeScript 인덱스 시그니처(Index Signature) 설명

## 인덱스 시그니처란?

인덱스 시그니처는 **객체의 동적 키(dynamic key)를 타입으로 정의**하는 TypeScript의 기능입니다.

## 기본 문법

```typescript
{
  [key: string]: 타입;
}
// 또는
{
  [key: number]: 타입;
}
```

## 간단한 예제

### 예제 1: 기본 사용법

```typescript
// 인덱스 시그니처 사용
type MyObject = {
  [key: string]: number;
};

const obj: MyObject = {
  "name": 1,      // ✅ OK
  "age": 2,       // ✅ OK
  "city": 3,      // ✅ OK
  "anyKey": 100   // ✅ OK - 어떤 문자열 키든 가능
};

// obj["anything"] = 200;  // ✅ OK
```

### 예제 2: 실제 사용 사례

```typescript
// 사용자 정의 속성 객체
type UserPreferences = {
  theme: string;           // 명시적 속성
  language: string;        // 명시적 속성
  
  [key: string]: string;   // 인덱스 시그니처: 나머지 모든 키는 string
};

const prefs: UserPreferences = {
  theme: "dark",
  language: "ko",
  fontSize: "large",      // ✅ OK - 인덱스 시그니처로 허용됨
  colorScheme: "blue"     // ✅ OK
};
```

## 우리 프로젝트의 경우

### GetBackupInfoCmsResponse 타입

```typescript
export type GetBackupInfoCmsResponse = BaseCmsResponse & {
  dbname: string;  // 명시적 속성: 데이터베이스 이름
  
  // 인덱스 시그니처: 동적 키로 백업 정보 배열을 저장
  [key: string]: string | BackupInfo[];
};
```

### 실제 응답 구조

```json
{
  "__EXEC_TIME": "100ms",
  "status": "success",
  "task": "getbackupinfo",
  "dbname": "demodb",           // ← 명시적 속성 (string)
  "demodb": [                    // ← 동적 키 (BackupInfo[])
    { "backupid": "1", ... },
    { "backupid": "2", ... }
  ],
  "testdb": [                    // ← 다른 DB도 동적 키로 가능
    { "backupid": "3", ... }
  ]
}
```

## 문제 상황

### 타입 충돌

```typescript
type GetBackupInfoCmsResponse = {
  dbname: string;              // 명시적: string
  
  [key: string]: string | BackupInfo[];  // 인덱스 시그니처: 모든 키는 string | BackupInfo[]
};
```

**문제점:**
- `dbname`은 명시적으로 `string`으로 정의했지만
- 인덱스 시그니처 `[key: string]: string | BackupInfo[]`가 **모든 문자열 키**를 포함
- TypeScript는 `dbname`도 인덱스 시그니처의 범위에 포함시킴
- 결과: `dbname`의 타입이 `string | BackupInfo[]`로 추론됨

### 시각적 설명

```
타입 정의:
┌─────────────────────────────────────────┐
│ dbname: string                          │ ← 명시적 정의
│ [key: string]: string | BackupInfo[]    │ ← 인덱스 시그니처
└─────────────────────────────────────────┘
              ↓
TypeScript의 타입 추론:
┌─────────────────────────────────────────┐
│ 모든 문자열 키 → string | BackupInfo[]   │
│ dbname도 문자열 키이므로 포함됨!        │
└─────────────────────────────────────────┘
              ↓
최종 타입:
┌─────────────────────────────────────────┐
│ dbname: string | BackupInfo[]  ❌       │ ← 문제!
└─────────────────────────────────────────┘
```

## 해결 방법

### 방법 1: 타입 단언 (현재 사용 중)

```typescript
// extractDomainData 전에 dbname을 먼저 추출
const responseDbname = response.dbname as string;  // 명시적 타입 단언
```

**장점:**
- 간단하고 명확
- 실제로 `dbname`은 항상 `string`이므로 안전

**단점:**
- 타입 단언은 런타임 검증을 하지 않음

### 방법 2: 타입 정의 개선 (권장)

```typescript
export type GetBackupInfoCmsResponse = BaseCmsResponse & {
  dbname: string;  // 명시적 속성
  
  // 인덱스 시그니처를 선택적(optional)으로 만들고 dbname 제외
  [key: string]: string | BackupInfo[] | undefined;
} & {
  // dbname을 명시적으로 string으로 보장
  dbname: string;
};
```

또는 더 나은 방법:

```typescript
export type GetBackupInfoCmsResponse = BaseCmsResponse & {
  dbname: string;  // 명시적 속성
} & {
  // dbname을 제외한 나머지 동적 키들
  [K in Exclude<string, 'dbname'>]?: BackupInfo[];
};
```

## 인덱스 시그니처의 특징

### 1. 모든 키를 포함

```typescript
type Example = {
  name: string;
  [key: string]: string | number;
};

// name도 인덱스 시그니처의 범위에 포함됨
// name: string | number (string이 포함되므로 OK)
```

### 2. 타입 호환성

```typescript
type A = {
  [key: string]: string | number;
};

type B = {
  name: string;      // string은 string | number에 호환됨 ✅
  age: number;       // number는 string | number에 호환됨 ✅
  city: boolean;     // ❌ 오류! boolean은 string | number에 포함되지 않음
};
```

### 3. 읽기 전용 인덱스 시그니처

```typescript
type ReadOnly = {
  readonly [key: string]: string;
};

const obj: ReadOnly = { name: "test" };
// obj.name = "new";  // ❌ 오류! 읽기 전용
```

## 실제 사용 예제

### 예제 1: 설정 객체

```typescript
type Config = {
  apiUrl: string;
  timeout: number;
  [key: string]: string | number;  // 추가 설정 허용
};

const config: Config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retryCount: 3,      // ✅ 동적 추가 가능
  maxConnections: 10  // ✅ 동적 추가 가능
};
```

### 예제 2: 번역 객체

```typescript
type Translations = {
  [key: string]: string;  // 모든 키가 문자열 값
};

const translations: Translations = {
  "hello": "안녕하세요",
  "goodbye": "안녕히 가세요",
  "welcome": "환영합니다"
  // 어떤 키든 추가 가능
};
```

### 예제 3: 우리 프로젝트처럼 동적 키

```typescript
type DatabaseBackups = {
  dbname: string;                    // 명시적 속성
  [dbName: string]: BackupInfo[];    // 동적 키: DB 이름별 백업 정보
};

// 실제 데이터:
{
  dbname: "demodb",
  "demodb": [backup1, backup2],
  "testdb": [backup3, backup4]
}
```

## 주의사항

### 1. 타입 안전성 감소

인덱스 시그니처를 사용하면 타입 체크가 느슨해집니다:

```typescript
type Loose = {
  [key: string]: any;  // 모든 타입 허용
};

const obj: Loose = {
  name: "test",
  age: 30,
  isValid: true
};

// obj.anything = "anything";  // ✅ 컴파일은 통과하지만 위험할 수 있음
```

### 2. 명시적 속성과의 충돌

```typescript
type Conflicting = {
  name: string;
  [key: string]: number;  // ❌ 오류! name은 string인데 인덱스 시그니처는 number
};
```

**해결:**
```typescript
type Fixed = {
  name: string;
  [key: string]: string | number;  // ✅ string과 number 모두 허용
};
```

## 요약

1. **인덱스 시그니처**는 동적 키를 타입으로 정의하는 기능
2. `[key: string]: 타입` 형태로 사용
3. **모든 문자열 키**에 적용되므로 명시적 속성과 충돌할 수 있음
4. 우리 프로젝트에서는 `dbname`이 인덱스 시그니처에 포함되어 타입 오류 발생
5. 해결: 타입 단언 또는 타입 정의 개선
