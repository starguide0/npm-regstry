# @starguide0/react-hooks

## 1.2.4

### Patch Changes

- - **기타**
    - 코드 정리 및 새로운 패키지 추가 (b159fc8)
  - **기타 변경사항**
    - Version: Update package.json and changelogs (cfc3066)
    - Version: Update package.json and changelogs (b9aa54f)
    - Version: Update package.json and changelogs (b7ad2cc)
    - ### chore: 프로젝트 스코프 명칭 변경 및 자동화 스크립트 추가 (c34f1c0)
    - Version Packages (2d30d0c)

  **관련 PR**: [#26](https://github.com/starguide0/npm-regstry/pull/26)

## 1.0.1

### Minor Changes

- e179093: 인스턴스 관리 및 안전한 컨텍스트 처리를 위한 React 훅 추가
  - 컴포넌트 리렌더링 간 단일 인스턴스 유지를 위한 useInstance 훅 추가
  - 에러 처리가 포함된 타입 안전한 React 컨텍스트 생성을 위한 createSafeContext 유틸리티 추가
  - 사용 예제가 포함된 포괄적인 JSDoc 문서 제공
  - 비용이 많이 드는 객체 생성 최적화 및 가변 객체 관리 지원
  - Provider 외부에서 컨텍스트 사용 시 자동 에러 발생 기능 포함
