# 개발 가이드라인 (프로젝트 특화)

본 문서는 이 모노레포(npm-registry)의 고급 기여자를 위한 프로젝트 특화 정보만을 다룹니다. pnpm + turborepo + vitest(+ package별 vitest.config) + changesets로 구성되어 있습니다. 기본 지식은 가정합니다.

## 1) 빌드/구성 지침
- 런타임/도구 버전
  - Node >= 18, pnpm >= 8 (package.json engines 및 packageManager 참조)
  - pnpm 8.15.6 기준으로 검증됨
- 워크스페이스
  - pnpm-workspace.yaml: packages/* 를 워크스페이스로 관리
  - 터보 파이프라인(turbo.json): build, lint, dev, test 작업 정의
    - test 파이프라인은 "^build"에 의존하도록 설정되어 있어 상위 패키지가 먼저 build 됩니다.
- 루트 스크립트(package.json)
  - pnpm build → turbo run build (패키지별 build)
  - pnpm test → turbo run test (패키지별 test 스크립트를 각 패키지 컨텍스트로 실행)
  - pnpm test:run → vitest run (루트 컨텍스트에서 단일 Vitest 실행: 루트 vitest.config.ts가 적용됨)
  - pnpm test:ui → vitest --ui
  - pnpm lint → turbo run lint
  - pnpm release → pnpm build 후 changeset publish (GitHub Packages 레지스트리 사용)
- Vitest 구성
  - 루트 vitest.config.ts는 기본적으로 Node 환경을 사용하고, include: packages/*/src/**/*.{test,spec}.* 로 전 패키지 테스트를 수집합니다.
  - 단, React 훅 등 DOM이 필요한 패키지는 패키지 로컬 vitest.config.ts(예: packages/react-hooks/vitest.config.ts)에서 environment: 'jsdom'을 선언합니다.
  - 중요한 포인트: 루트에서 vitest를 직접 실행(pnpm test:run)하면 루트 설정(Node env)이 적용되므로 jsdom이 필요한 테스트가 실패할 수 있습니다. 이 경우 turbo를 통해 각 패키지 테스트를 실행(pnpm test)하거나, 패키지 디렉터리에서 직접 vitest run을 실행하십시오.
- 인증/환경 변숫값 주의
  - 로컬에서 pnpm 실행 시 .npmrc의 ${NODE_AUTH_TOKEN} 대체 경고가 뜰 수 있습니다. 테스트/빌드에는 영향 없습니다. 공개 레지스트리(publish) 시에만 필요합니다.

## 2) 테스트 정보
### 2.1 테스트 구성 및 실행 지침
- 루트 전체 실행(패키지별 환경 존중):
  - pnpm install
  - pnpm build  # 필요 시 (test 파이프라인이 build에 의존)
  - pnpm test   # turbo가 각 패키지의 "test": "vitest run"을 해당 패키지 컨텍스트에서 수행
- 루트 단일 Vitest 실행(빠른 수집/단일 환경):
  - pnpm test:run  # 루트 vitest.config.ts 기준(Node env). jsdom 테스트가 있다면 실패 가능
- 패키지별 실행(권장: 환경 차이 있을 때):
  - cd packages/react-hooks && pnpm test        # jsdom 환경 설정이 있는 패키지
  - cd packages/libs && pnpm test               # node 환경 패키지
  - 또는 루트에서 경로 지정: pnpm vitest run packages/libs/src/safeExecute.spec.ts
- 커버리지:
  - pnpm test:coverage (루트) 또는 패키지에서 vitest run --coverage

### 2.2 새 테스트 추가 및 실행 지침
- 테스트 파일 위치 규칙
  - 기본적으로 src/**/*.{test,spec}.{js,ts,tsx,...} 경로를 수집합니다. 각 패키지의 vitest.config.ts include를 확인하세요.
- 환경 설정
  - DOM이 필요한 경우 해당 패키지의 vitest.config.ts에 environment: 'jsdom'을 설정하십시오. 루트에서 돌릴 계획이 없다면 패키지 로컬 설정만으로 충분합니다.
- 실행 전략
  - 환경이 섞인 모노레포에서는 turbo 기반 테스트 실행(pnpm test) 또는 패키지별 실행을 권장합니다.
  - 루트 단일 실행이 필요하면 환경 충돌(예: document is not defined)을 피하기 위해 테스트 선택 실행 또는 환경 분기 설정이 필요합니다.

### 2.3 간단한 테스트 생성 및 실행(시연)
아래 절차는 실제로 로컬에서 검증했습니다.
- 파일 생성 (예시: packages/libs/src/smoke.spec.ts)
  - 내용:
    - describe('smoke', () => {
      it('basic math works', () => { expect(1 + 2).toBe(3); });
    });
- 단일 파일 실행:
  - pnpm vitest run packages/libs/src/smoke.spec.ts
  - 결과: 1 passed (1)
- 시연 후 정리
  - 본 문서 요구사항에 맞춰 데모 테스트 파일은 제거했습니다. 실제로 새 테스트를 추가할 때는 각 패키지의 src 하위에 *.spec.ts / *.test.ts 파일을 추가하면 됩니다.

## 3) 추가 개발 정보
- 코드 스타일/품질
  - ESLint(루트 eslint.config.js) + Prettier. 패키지별로 lint 스크립트가 있으며 turbo를 통해 일괄 실행 가능.
  - 포맷: pnpm format (루트). 대상: **/*.{ts,tsx,js,json,md,yml,yaml}
- 빌드
  - 각 패키지 package.json의 build 스크립트가 단순 tsc인 경우가 많습니다. 상위에 의존하는 build는 turbo가 정렬합니다.
- 변경 이력/릴리스
  - Changesets(@changesets/cli) 사용. 기본 흐름:
    - pnpm changeset        # 변경 기록/버전 범위 선택
    - pnpm version-packages # packages version bump + changelog 반영
    - pnpm release          # 빌드 후 changeset publish (GitHub Packages)
  - 자동 changeset 보조 스크립트: scripts/auto-changeset.mjs
    - 패키지 디렉터리 스캔, 브랜치 커밋 분석, 패키지별 변경 분류를 통해 changeset 템플릿을 생성하는 도구입니다. 팀 워크플로에 맞게 브랜치/커밋 메시지 규칙 연동을 고려하세요.
- 디버깅 팁
  - Vitest UI: pnpm test:ui 로 파일/테스트 케이스 단위 실행/재실행이 용이.
  - 모노레포 환경에서의 환경 충돌 회피: 루트 단일 실행 대신 패키지별 실행으로 컨텍스트 격리.
  - React 훅 테스트는 @testing-library/react + jsdom 환경이 전제입니다(react-hooks 패키지에 이미 devDeps로 포함).
- CI/워크플로
  - .github/workflows/changeset.yml / publish.yml 를 통해 릴리스 자동화가 구성되어 있을 수 있습니다(리포지토리 설정에 의존). 로컬에서 토큰 없는 상태로는 테스트/빌드만 수행하고 publish는 생략하십시오.

## 4) 자주 겪는 이슈와 대처
- document is not defined 오류
  - 루트에서 vitest run 실행 시 Node 환경으로 수집되어 jsdom이 필요한 테스트가 실패. 해결: pnpm test (turbo) 또는 패키지별 vitest 실행.
- 타이머/가상시간 관련 테스트 삑사리
  - fake timers(vi.useFakeTimers) 사용 시 runAllTimersAsync/advanceTimersByTime 호출 순서를 엄격히 관리하세요. turbo로 상위 build를 선행시키는 설정으로 인해 타이밍이 민감할 수 있습니다.

## 5) 요약
- 테스트를 실제로 실행·검증 완료: 패키지 단일 파일(smoke.spec.ts) 기준 1 test passed 확인 후 파일은 제거.
- 환경 충돌 최소화를 위해 "pnpm test"(turbo)나 패키지 단위 실행을 권장.
- 빌드/릴리스/변경관리 파이프라인은 turbo + changesets를 중심으로 동작하며, 레지스트리 인증 토큰은 로컬 테스트에 불필요.
