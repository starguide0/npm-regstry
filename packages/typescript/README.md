# @starguide0/typescript

프로젝트 전반에서 사용할 수 있는 공유 TypeScript 설정을 제공하는 패키지입니다.

## 설치

```bash
npm install @starguide0/typescript
```

또는

```bash
pnpm add @starguide0/typescript
```

## 개요

이 패키지는 일관된 TypeScript 개발 환경을 위한 기본 설정을 제공합니다. 모든 프로젝트에서 동일한 컴파일러 옵션과 규칙을 사용할 수 있도록 도와줍니다.

## 사용법

### 기본 설정 사용

프로젝트의 `tsconfig.json` 파일에서 기본 설정을 확장하여 사용할 수 있습니다:

```json
{
  "extends": "@starguide0/typescript/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 제공되는 설정

#### base.json

기본 TypeScript 설정으로 다음과 같은 옵션들을 포함합니다:

- **타겟 및 모듈**: ES2020 타겟, ESNext 모듈 시스템
- **모듈 해석**: Node.js 스타일 모듈 해석
- **엄격 모드**: 모든 strict 옵션 활성화
- **선언 파일**: 타입 선언 파일 및 소스맵 생성
- **성능 최적화**: 증분 컴파일 및 복합 프로젝트 지원

#### 주요 컴파일러 옵션

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  }
}
```

## 설정 상세

### 타겟 및 라이브러리

- `target: "ES2020"`: ES2020 문법으로 컴파일
- `lib: ["ES2020"]`: ES2020 라이브러리 사용

### 모듈 시스템

- `module: "ESNext"`: 최신 ES 모듈 시스템 사용
- `moduleResolution: "node"`: Node.js 스타일 모듈 해석
- `resolveJsonModule: true`: JSON 파일 import 허용

### 엄격성 및 타입 검사

- `strict: true`: 모든 엄격한 타입 검사 옵션 활성화
- `forceConsistentCasingInFileNames: true`: 파일명 대소문자 일관성 강제

### 호환성

- `allowJs: true`: JavaScript 파일 허용
- `esModuleInterop: true`: CommonJS와 ES 모듈 간 상호 운용성 개선
- `skipLibCheck: true`: 라이브러리 타입 검사 건너뛰기

### 출력 및 성능

- `declaration: true`: 타입 선언 파일(.d.ts) 생성
- `declarationMap: true`: 선언 파일 소스맵 생성
- `sourceMap: true`: 소스맵 파일 생성
- `composite: true`: 복합 프로젝트 지원
- `incremental: true`: 증분 컴파일 활성화

### 제외 파일

기본적으로 다음 파일들이 컴파일에서 제외됩니다:

- `node_modules`
- `dist`
- `**/*.test.ts`
- `**/*.spec.ts`

## 사용 예제

### 라이브러리 프로젝트

```json
{
  "extends": "@starguide0/typescript/base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 애플리케이션 프로젝트

```json
{
  "extends": "@starguide0/typescript/base.json",
  "compilerOptions": {
    "outDir": "./build",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "**/*.test.ts"]
}
```

### 모노레포 프로젝트

```json
{
  "extends": "@starguide0/typescript/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/src/*"]
    }
  },
  "references": [{ "path": "../shared" }]
}
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
