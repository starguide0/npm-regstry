# NPM Registry 모노레포

이 프로젝트는 Turborepo와 pnpm을 사용하는 NPM 패키지 모노레포입니다.

## 📋 프로젝트 개요

- **프로젝트명**: npm-registry
- **버전**: 1.0.0
- **패키지 매니저**: pnpm 8.15.6+
- **Node.js 버전**: 18.0.0+
- **빌드 도구**: Turborepo

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상

### 설치

```bash
# 의존성 설치
pnpm install
```

## 📦 사용 가능한 스크립트

### 개발

```bash
# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 린트 검사
pnpm lint

# 코드 포맷팅
pnpm format
```

### 테스트

```bash
# 테스트 실행
pnpm test

# 테스트 UI로 실행
pnpm test:ui

# 테스트 한 번 실행
pnpm test:run

# 커버리지와 함께 테스트 실행
pnpm test:coverage
```

### 배포

```bash
# 체인지셋 생성
pnpm changeset

# 자동 체인지셋 생성 (git 커밋 기반)
pnpm changeset:auto

# 패키지 버전 업데이트
pnpm version-packages

# 릴리스
pnpm release
```

## 🤖 자동 체인지셋 생성

Git 커밋 히스토리를 기반으로 자동으로 체인지셋을 생성하는 기능을 제공합니다.

### 사용법

```bash
# main 브랜치 이후의 커밋을 분석하여 패키지별 체인지셋 자동 생성
pnpm changeset:auto
```

### 작동 방식

1. **커밋 분석**: main 브랜치와 현재 상태 사이의 커밋을 분석합니다
2. **패키지 식별**: 각 커밋에서 변경된 파일을 확인하여 영향받은 패키지를 식별합니다
3. **자동 분류**: 커밋 메시지의 접두사(`feat:`, `fix:`, `chore:` 등)를 기반으로 변경사항을 분류합니다
4. **체인지셋 생성**: 패키지별로 적절한 버전 타입과 한국어 요약이 포함된 체인지셋 파일을 생성합니다

### 버전 타입 결정 규칙

- **Major**: 커밋 메시지에 `BREAKING CHANGE` 또는 `!:` 포함
- **Minor**: `feat:` 접두사가 포함된 커밋이 있는 경우
- **Patch**: `fix:` 접두사가 포함되거나 기타 변경사항

## 🏗️ 프로젝트 구조

```
npm-regstry2/
├── packages/           # 모노레포 패키지들
├── .changeset/        # 체인지셋 설정
├── .github/           # GitHub Actions 워크플로우
├── package.json       # 루트 패키지 설정
├── pnpm-workspace.yaml # pnpm 워크스페이스 설정
├── turbo.json         # Turborepo 설정
└── README.md          # 이 파일
```

## 🛠️ 기술 스택

- **모노레포 관리**: Turborepo
- **패키지 매니저**: pnpm
- **언어**: TypeScript
- **테스트**: Vitest
- **린팅**: ESLint
- **포맷팅**: Prettier
- **버전 관리**: Changesets

## 📝 개발 가이드

1. 새로운 패키지는 `packages/` 디렉토리에 추가합니다
2. 코드 변경 시 `pnpm changeset`을 사용하여 체인지셋을 생성합니다
3. 모든 커밋 전에 `pnpm lint`와 `pnpm test`를 실행합니다
4. 코드 포맷팅은 `pnpm format`으로 자동화됩니다
