# @starguide0/libs

공통으로 사용할 수 있는 유틸리티 함수들을 제공하는 패키지입니다.

## 설치

```bash
npm install @starguide0/libs
```

또는

```bash
pnpm add @starguide0/libs
```

## 개요

이 패키지는 프로젝트 전반에서 재사용 가능한 유틸리티 함수들을 제공합니다. 현재 안전한 함수 실행과 지연 처리를 위한 함수들이 포함되어 있습니다.

## 사용법

### safeExecute

함수를 안전하게 실행하고 성공/실패 결과를 반환하는 유틸리티입니다.

```typescript
import { safeExecute } from '@starguide0/libs';

// 기본 사용법
const safeFetch = safeExecute(fetch);
const result = await safeFetch('https://api.example.com/data');

if (result.success) {
  console.log('성공:', result.value);
} else {
  console.error('실패:', result.error);
}

// 동기 함수와 함께 사용
const safeParseJSON = safeExecute(JSON.parse);
const parseResult = await safeParseJSON('{"key": "value"}');

if (parseResult.success) {
  console.log('파싱 성공:', parseResult.value);
} else {
  console.error('파싱 실패:', parseResult.error);
}

// 매개변수가 있는 함수와 함께 사용
const safeCalculate = safeExecute((a: number, b: number) => a / b);
const calcResult = await safeCalculate(10, 2);

if (calcResult.success) {
  console.log('계산 결과:', calcResult.value); // 5
}
```

### sleep

지정된 시간만큼 대기하는 Promise 기반 함수입니다.

```typescript
import { sleep } from '@starguide0/libs';

// 기본 사용법 - async/await
async function example() {
  console.log('시작');
  await sleep(1000); // 1초 대기
  console.log('1초 후 실행');
}

// Promise 체이닝
sleep(2000).then(() => {
  console.log('2초 후 실행');
});

// 순차적 실행
async function sequentialExecution() {
  console.log('첫 번째 작업');
  await sleep(500);

  console.log('두 번째 작업');
  await sleep(1000);

  console.log('세 번째 작업');
}
```

## API 참조

### safeExecute<R>(callback: (...args: unknown[]) => R | Promise<R>)

**매개변수:**

- `callback`: 실행할 함수 (동기 또는 비동기)

**반환값:**

- `Promise<{success: true, value: R} | {success: false, error: unknown}>`

**설명:**
함수를 안전하게 실행하고 예외가 발생하면 에러를 캐치하여 결과 객체로 반환합니다.

### sleep(milliseconds: number): Promise<void>

**매개변수:**

- `milliseconds`: 대기할 시간 (밀리초)

**반환값:**

- `Promise<void>`

**설명:**
지정된 시간만큼 대기하는 Promise를 반환합니다. 1000ms = 1초입니다.

## 타입 정의

```typescript
// safeExecute 반환 타입
type SafeExecuteResult<T> =
  | { success: true; value: T }
  | { success: false; error: unknown };

// sleep 함수 타입
type SleepFunction = (milliseconds: number) => Promise<void>;
```

## 사용 예제

### 에러 처리가 필요한 API 호출

```typescript
import { safeExecute, sleep } from '@starguide0/libs';

async function fetchWithRetry(url: string, maxRetries = 3) {
  const safeFetch = safeExecute(fetch);

  for (let i = 0; i < maxRetries; i++) {
    const result = await safeFetch(url);

    if (result.success) {
      return result.value;
    }

    console.log(`시도 ${i + 1} 실패:`, result.error);

    if (i < maxRetries - 1) {
      await sleep(1000 * (i + 1)); // 점진적 지연
    }
  }

  throw new Error('최대 재시도 횟수 초과');
}
```

### 배치 처리

```typescript
import { safeExecute, sleep } from '@starguide0/libs';

async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  batchSize = 5,
  delay = 100
) {
  const safeProcessor = safeExecute(processor);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const results = await Promise.all(batch.map(item => safeProcessor(item)));

    // 실패한 항목 로깅
    results.forEach((result, index) => {
      if (!result.success) {
        console.error(`항목 ${i + index} 처리 실패:`, result.error);
      }
    });

    // 배치 간 지연
    if (i + batchSize < items.length) {
      await sleep(delay);
    }
  }
}
```

## 개발

```bash
# 개발 모드로 빌드 (watch 모드)
pnpm dev

# 프로덕션 빌드
pnpm build

# 린트 검사
pnpm lint

# 테스트 실행
pnpm test
```

## 라이선스

ISC
