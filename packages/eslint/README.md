# @starguide0/eslint

프로젝트 전반에서 사용할 수 있는 공유 ESLint 설정을 제공하는 패키지입니다.

## 설치

```bash
npm install @starguide0/eslint
```

또는

```bash
pnpm add @starguide0/eslint
```

## 개요

이 패키지는 일관된 코드 품질과 스타일을 위한 ESLint 설정을 제공합니다. TypeScript 프로젝트에 최적화되어 있으며, 다양한 프로젝트 유형에 맞는 설정을 선택할 수 있습니다.

## 사용법

### 기본 설정 사용

프로젝트의 `eslint.config.js` 파일에서 기본 설정을 사용할 수 있습니다:

```javascript
import baseConfig from '@starguide0/eslint/configs/base.js';

export default [
  ...baseConfig,
  // 추가 설정이 필요한 경우 여기에 작성
];
```

### 라이브러리 설정 사용

라이브러리나 패키지 개발 시에는 더 엄격한 설정을 사용할 수 있습니다:

```javascript
import libraryConfig from '@starguide0/eslint/configs/library.js';

export default [
  ...libraryConfig,
  // 추가 설정이 필요한 경우 여기에 작성
];
```

## 제공되는 설정

### base.js

일반적인 TypeScript 프로젝트를 위한 기본 설정입니다.

#### 포함된 규칙

- **JavaScript 권장 설정**: ESLint의 기본 권장 규칙
- **TypeScript 기본 규칙**:
  - `@typescript-eslint/no-unused-vars`: 사용하지 않는 변수 금지 (error)
  - `@typescript-eslint/explicit-function-return-type`: 함수 반환 타입 명시 권장 (warn)
  - `@typescript-eslint/no-explicit-any`: any 타입 사용 주의 (warn)

#### 파서 설정

- **파서**: `@typescript-eslint/parser`
- **ECMAScript 버전**: 2020
- **모듈 타입**: ES 모듈
- **환경**: Node.js, ES2020

#### 무시 파일

- `dist/`
- `node_modules/`
- `*.js`

### library.js

라이브러리나 패키지 개발을 위한 더 엄격한 설정입니다.

#### 추가 규칙 (base.js 기반)

- `@typescript-eslint/explicit-function-return-type`: 함수 반환 타입 명시 필수 (error)
- `@typescript-eslint/no-explicit-any`: any 타입 사용 금지 (error)
- `no-console`: console 사용 주의 (warn)
- `@typescript-eslint/prefer-nullish-coalescing`: nullish coalescing 연산자 사용 권장 (error)
- `@typescript-eslint/prefer-optional-chain`: optional chaining 사용 권장 (error)

## 설정 상세

### 지원 파일 형식

- `**/*.ts`: TypeScript 파일
- `**/*.tsx`: TypeScript JSX 파일

### 파서 옵션

```javascript
{
  ecmaVersion: 2020,
  sourceType: 'module'
}
```

### 환경 설정

```javascript
{
  node: true,
  es2020: true
}
```

## 사용 예제

### React 프로젝트

```javascript
import baseConfig from '@starguide0/eslint/configs/base.js';

export default [
  ...baseConfig,
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/prop-types': 'off', // TypeScript를 사용하므로 prop-types 불필요
    },
  },
];
```

### Node.js 라이브러리

```javascript
import libraryConfig from '@starguide0/eslint/configs/library.js';

export default [
  ...libraryConfig,
  {
    rules: {
      'no-console': 'off', // 라이브러리에서 로깅이 필요한 경우
    },
  },
];
```

### 모노레포 설정

```javascript
import baseConfig from '@starguide0/eslint/configs/base.js';
import libraryConfig from '@starguide0/eslint/configs/library.js';

export default [
  // 일반 소스 코드
  ...baseConfig,

  // 패키지 디렉토리는 더 엄격한 규칙 적용
  {
    files: ['packages/*/src/**/*.ts'],
    ...libraryConfig[1], // library 설정의 규칙 부분만 적용
  },
];
```

### 커스텀 규칙 추가

```javascript
import baseConfig from '@starguide0/eslint/configs/base.js';

export default [
  ...baseConfig,
  {
    rules: {
      // 기존 규칙 재정의
      '@typescript-eslint/no-explicit-any': 'error',

      // 새로운 규칙 추가
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
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

## 의존성

이 패키지는 다음 ESLint 관련 패키지들을 포함합니다:

- `eslint`: ESLint 코어
- `@typescript-eslint/eslint-plugin`: TypeScript ESLint 플러그인
- `@typescript-eslint/parser`: TypeScript 파서

## 라이선스

ISC
