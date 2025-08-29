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

- Node.js 18.0.0 이상 (권장: 20 LTS)
- pnpm 8.0.0 이상 (프로젝트는 packageManager: pnpm@8.15.6 기준 검증)

### 설치

```bash
# 의존성 설치
pnpm install
```

## 📦 사용 가능한 스크립트

### 개발/빌드

```bash
# 의존성 설치
pnpm install

# 빌드 (Turbo가 각 패키지 build 스크립트를 순서대로 실행)
pnpm build

# 개발 모드 (패키지별 dev 스크립트 실행)
pnpm dev

# 린트 검사 (패키지별 eslint 스크립트 실행)
pnpm lint

# 코드 포맷팅 (루트에서 전체 파일 포맷)
pnpm format
```

### 테스트

주의: 루트에서의 단일 Vitest 실행(pnpm test:run)은 Node 환경이 기본이라 DOM(jsdom)이 필요한 테스트는 실패할 수 있습니다. 패키지별 테스트 실행 또는 turbo 기반 실행을 권장합니다.

추가로, Turbo 파이프라인에서 test 작업은 상위 패키지의 build에 의존합니다(turbo.json: "test" → dependsOn: ["^build"]). 따라서 pnpm test 실행 시 필요한 빌드가 먼저 수행됩니다.

```bash
# turbo를 통해 패키지 컨텍스트에서 테스트 실행(패키지별 vitest.config를 존중)
pnpm test

# 루트 단일 Vitest 실행(빠르지만 환경은 루트 설정: Node)
pnpm test:run

# Vitest UI
pnpm test:ui

# 커버리지
pnpm test:coverage

# 패키지별 테스트 실행 예시
pnpm vitest run packages/libs/src/some.spec.ts
```

### 배포/릴리스 (Changesets + GitHub Packages)

```bash
# 자동 체인지셋 생성 (git 커밋 기반)
pnpm changeset:auto

# 버전 반영 (각 패키지 package.json & CHANGELOG 갱신)
pnpm version-packages

# (선택) 로컬에서 사전 빌드
pnpm build

# 빌드 후 GitHub Packages에 publish (사전 인증 필요)
pnpm release
```

인증/환경 변수:
- 로컬에서 설치/빌드/테스트에는 토큰이 필요하지 않습니다.
- publish 시에는 GitHub Token을 NODE_AUTH_TOKEN으로 주입해야 합니다.
  - 로컬 예시: NODE_AUTH_TOKEN=ghp_xxx pnpm release
  - CI는 .github/workflows/publish.yml에서 secrets.GITHUB_TOKEN을 사용합니다.

GitHub Packages 설정(.npmrc 예시):
- 조직/계정 스코프(@your-scope)를 GitHub Packages에 연결하고 인증 토큰을 주입해야 합니다.
- 이 레포는 예시 스코프로 @starguide0를 사용합니다.

```ini
@starguide0:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

주의:
- 로컬에서 pnpm install 시 .npmrc의 ${NODE_AUTH_TOKEN} 치환 경고가 보일 수 있으나, 테스트/빌드에는 영향이 없습니다(실제 publish 시에만 필요).

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
npm-registry/
├── packages/            # 모노레포 패키지들
├── .changeset/          # Changesets 설정 및 생성된 변경 기록
├── .github/             # GitHub Actions 워크플로우 (publish 등)
├── package.json         # 루트 스크립트/엔진/도구 버전
├── pnpm-workspace.yaml  # pnpm 워크스페이스 설정 (packages/*)
├── turbo.json           # Turborepo 파이프라인 (test는 ^build 의존)
├── vitest.config.ts     # 루트 Vitest 설정(Node env)
└── README.md            # 이 파일
```

## 🛠️ 기술 스택

- **모노레포 관리**: Turborepo
- **패키지 매니저**: pnpm
- **언어**: TypeScript
- **테스트**: Vitest
- **린팅**: ESLint
- **포맷팅**: Prettier
- **버전 관리**: Changesets

## 📝 개발 가이드 & 트러블슈팅

1. 새로운 패키지는 `packages/` 디렉토리에 추가합니다
2. 코드 변경 시 `pnpm changeset`을 사용하여 체인지셋을 생성합니다
3. 모든 커밋 전에 `pnpm lint`와 `pnpm test`를 실행합니다
4. 코드 포맷팅은 `pnpm format`으로 자동화됩니다
5. DOM 환경이 필요한 테스트(예: react-hooks)는 해당 패키지의 `vitest.config.ts`에서 `environment: 'jsdom'`을 설정하고, 루트 단일 실행 대신 패키지별로 테스트를 실행하세요.
6. 루트에서 `pnpm install` 시 `.npmrc`의 `${NODE_AUTH_TOKEN}` 경고가 보일 수 있으나, 이는 테스트/빌드에는 영향을 주지 않습니다(배포 시에만 필요).

### CI/CD
- 릴리스: GitHub Release가 생성되면 `.github/workflows/publish.yml`이 트리거되어 `pnpm release`를 수행합니다.
- 런타임: CI는 Node 20, pnpm 9로 동작합니다(로컬 최소 요구사항은 Node>=18, pnpm>=8이며 pnpm 8.15.6 기준 검증됨).
- 토큰: CI에서는 `secrets.GITHUB_TOKEN`이 `NODE_AUTH_TOKEN`으로 주입됩니다.
- 로컬에서 실제 publish가 필요 없다면 `pnpm build`와 `pnpm test`만 수행하면 됩니다.
