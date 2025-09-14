# @starguide0/shared-types

TypeScript에서 기본적으로 제공하지 않는 유용한 유틸리티 타입들의 모음집입니다. 이 타입들은 TypeScript 개발에서 자주 사용되는 패턴들을 도와줍니다.

## 설치

```bash
npm install @starguide0/shared-types
```

또는

```bash
pnpm add @starguide0/shared-types
```

## 개요

이 패키지는 세 가지 주요 카테고리의 유틸리티 타입을 제공합니다:

- **객체 조작 타입**: 객체의 속성을 재귀적으로 변경하거나 필터링
- **함수 조작 타입**: 함수의 매개변수, 반환 타입, 비동기 처리 등을 분석
- **배열 조작 타입**: 배열과 튜플의 요소를 추출, 변환, 검사

## 폴더 구조

- src/
  - index.ts: 패키지 공개 API를 한 곳에서 재내보내는 엔트리 파일
  - object-utils.ts: 객체 조작 관련 유틸리티 타입 모음
  - array-utils.ts: 배열/튜플 조작 관련 유틸리티 타입 모음
  - function-utils.ts: 함수/생성자 관련 유틸리티 타입 모음
  - notation.ts: 문자열 표기법 변환 유틸리티 타입 모음 (camel/pascal/snake/kebab)
- dist/: 빌드 산출물 (publish 시 포함)
- package.json, tsconfig.json, README.md, CHANGELOG.md

참고: array-utils의 Flatten 타입은 object-utils의 Flatten과 이름이 겹쳐, 공개 API에서는 ArrayFlatten으로 재내보냅니다.

## 사용법

### 기본 사용법

```typescript
import type {
  DeepPartial,
  Head,
  AsyncReturnType,
} from '@starguide0/shared-types';

// 객체 타입을 재귀적으로 선택적으로 만들기
interface User {
  name: string;
  profile: {
    age: number;
    address: {
      city: string;
      zipCode: string;
    };
  };
}

type PartialUser = DeepPartial<User>;
// 모든 속성이 선택적이 됨

// 배열의 첫 번째 요소 타입 추출
type FirstElement = Head<[string, number, boolean]>; // string

// 비동기 함수의 반환 타입 추출
async function fetchData(): Promise<{ data: string[] }> {
  return Promise.resolve({ data: ['item1', 'item2'] });
}
type DataType = AsyncReturnType<typeof fetchData>; // { data: string[] }
```

## 객체 조작 타입

객체의 속성을 재귀적으로 변경하거나, 특정 조건에 따라 속성을 선택/제외하는 타입들입니다. 중첩된 객체 구조를 다룰 때 특히 유용합니다.

### 사용 가능한 타입들

- `DeepPartial<T>`: 모든 속성을 재귀적으로 선택적으로 만듭니다
- `DeepRequired<T>`: 모든 속성을 재귀적으로 필수로 만듭니다
- `DeepReadonly<T>`: 모든 속성을 재귀적으로 읽기 전용으로 만듭니다
- `DeepMutable<T>`: 모든 속성을 재귀적으로 변경 가능하게 만듭니다
- `PickByType<T, U>`: 특정 타입의 속성만 선택합니다
- `OmitByType<T, U>`: 특정 타입의 속성을 제외합니다
- `KeysOfType<T, U>`: 특정 타입을 가진 키들을 추출합니다
- `PartialBy<T, K>`: 지정된 키들만 선택적으로 만듭니다
- `RequiredBy<T, K>`: 지정된 키들만 필수로 만듭니다
- `Flatten<T>`: 중첩된 객체를 평면화합니다

### 예제

```typescript
// 깊은 부분 타입 만들기
type Config = DeepPartial<{
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
}>;

// 특정 타입의 속성만 선택
type StringProps = PickByType<
  {
    name: string;
    age: number;
    email: string;
  },
  string
>; // { name: string; email: string }
```

## 함수 조작 타입

함수의 매개변수, 반환 타입, 비동기 처리 등을 타입 레벨에서 분석하고 변환하는 타입들입니다. 함수형 프로그래밍이나 고차 함수를 다룰 때 유용합니다.

### 사용 가능한 타입들

- `AsyncReturnType<T>`: 비동기 함수의 반환 타입을 추출합니다
- `FirstParameter<T>`: 함수의 첫 번째 매개변수 타입을 추출합니다
- `LastParameter<T>`: 함수의 마지막 매개변수 타입을 추출합니다
- `FunctionWithParams<P, R>`: 지정된 매개변수와 반환 타입을 가진 함수 타입을 생성합니다
- `OptionalParameters<T>`: 함수의 선택적 매개변수들을 추출합니다
- `Curry<T>`: 함수를 커링된 형태로 변환합니다
- `ConstructorParameters<T>`: 생성자의 매개변수 타입들을 추출합니다
- `InstanceType<T>`: 생성자의 인스턴스 타입을 추출합니다
- `Promisify<T>`: 함수를 Promise를 반환하는 형태로 변환합니다
- `Unpromisify<T>`: Promise를 반환하는 함수를 동기 함수로 변환합니다

### 예제

```typescript
// 함수의 매개변수 타입 추출
function createUser(name: string, age: number, isActive: boolean): User {
  return { name, age, isActive };
}

type UserParams = Parameters<typeof createUser>; // [string, number, boolean]
type FirstParam = FirstParameter<typeof createUser>; // string

// 비동기 함수를 동기 함수로 변환
type SyncVersion = Unpromisify<(id: string) => Promise<User>>; // (id: string) => User
```

## 배열 조작 타입

배열과 튜플의 요소를 추출, 변환, 검사하는 타입들입니다. 타입 레벨에서 배열을 조작하거나 패턴 매칭을 수행할 때 유용합니다.

### 사용 가능한 타입들

- `Head<T>`: 배열의 첫 번째 요소 타입을 추출합니다
- `Tail<T>`: 첫 번째 요소를 제외한 나머지 배열 타입을 추출합니다
- `Last<T>`: 배열의 마지막 요소 타입을 추출합니다
- `Init<T>`: 마지막 요소를 제외한 배열 타입을 추출합니다
- `Length<T>`: 배열의 길이를 추출합니다
- `IsEmpty<T>`: 배열이 비어있는지 확인합니다
- `IsNotEmpty<T>`: 배열이 비어있지 않은지 확인합니다
- `Reverse<T>`: 배열을 역순으로 뒤집습니다
- `Join<T, S>`: 배열 요소들을 구분자로 연결합니다
- `Split<T, S>`: 문자열을 구분자로 분할합니다
- `Repeat<T, N>`: 요소를 N번 반복한 배열을 생성합니다
- `At<T, N>`: 지정된 인덱스의 요소 타입을 추출합니다
- `Includes<T, U>`: 배열이 특정 타입을 포함하는지 확인합니다
- `ArrayFlatten<T>`: 중첩된 배열을 평면화합니다

### 예제

```typescript
// 배열 요소 추출
type Numbers = [1, 2, 3, 4, 5];
type FirstNumber = Head<Numbers>; // 1
type LastNumber = Last<Numbers>; // 5
type RestNumbers = Tail<Numbers>; // [2, 3, 4, 5]

// 배열 변환
type Reversed = Reverse<Numbers>; // [5, 4, 3, 2, 1]
type ArrayLength = Length<Numbers>; // 5

// 문자열 배열 조작
type Words = ['hello', 'world', 'typescript'];
type Sentence = Join<Words, ' '>; // "hello world typescript"

// 중첩 배열 평면화
type NestedArray = [[1, 2], [3, [4, 5]], 6];
type FlatArray = ArrayFlatten<NestedArray>; // [1, 2, 3, 4, 5, 6]
```

## 문자열 표기법 변환 타입

문자열의 표기법을 타입 레벨에서 변환합니다. 케밥/스네이크/카멜/파스칼 간 상호 변환을 지원합니다.

### 사용 가능한 타입들

- `CamelCase<S>`: kebab/snake/Pascal을 camelCase로 변환
- `PascalCase<S>`: kebab/snake/camel을 PascalCase로 변환
- `SnakeCase<S>`: camel/Pascal/kebab을 snake_case로 변환
- `KebabCase<S>`: camel/Pascal/snake를 kebab-case로 변환

### 예제

```typescript
type A = CamelCase<'extract-components'>; // 'extractComponents'
type B = PascalCase<'on_error'>;          // 'OnError'
type C = SnakeCase<'DeepCaseX'>;          // 'deep_case_x'
type D = KebabCase<'deep__Case--X'>;      // 'deep-case-x'
```

## 개발

```bash
# 개발 모드로 빌드 (watch 모드)
pnpm dev

# 프로덕션 빌드
pnpm build

# 테스트 실행
pnpm test

# 린트 검사
pnpm lint
```

## 라이선스

ISC
