---
"@npm-registry/eslint": minor
---

ESLint flat 설정 유틸리티 및 공유 설정 추가

- 타입 안전한 ESLint flat 설정을 위한 FlatESLintConfig 인터페이스 추가
- TypeScript 중심의 규칙과 설정이 포함된 baseFlatConfig 추가
- 사용자 정의 가능한 설정 생성을 위한 createFlatESLintConfig 유틸리티 추가
- TypeScript 파서 옵션 및 ES2020 글로벌 설정 포함
- 규칙 재정의 및 확장 가능한 설정 패턴 지원
