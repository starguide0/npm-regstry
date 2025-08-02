import React from 'react';

/**
 * 컴포넌트 생명주기 동안 단일 인스턴스를 유지하는 React 훅
 *
 * 이 훅은 초기화 함수를 한 번만 실행하고, 그 결과를 컴포넌트가 언마운트될 때까지 유지합니다.
 * 리렌더링이 발생해도 동일한 인스턴스를 반환하므로 비용이 많이 드는 객체 생성을 최적화할 수 있습니다.
 *
 * @notice
 * - 이 훅이 반환하는 인스턴스는 항상 동일한 참조를 유지하므로, 인스턴스의 변경사항은 React의 리렌더링을
 *   트리거하지 않습니다.
 * - 인스턴스 내부 상태가 변경될 때 컴포넌트를 리렌더링해야 하는 경우, 별도의 state 관리나
 *   강제 리렌더링이 필요할 수 있습니다.
 * - 특히 Map이나 Set과 같은 mutable 객체를 사용할 때는 이 점을 주의해야 합니다.
 *
 * @template T - 생성될 인스턴스의 타입
 * @param {() => T} initFunc - 인스턴스를 생성하는 초기화 함수. 컴포넌트 생명주기 동안 한 번만 호출됩니다.
 * @returns {T} 생성된 인스턴스. 컴포넌트가 언마운트될 때까지 동일한 참조를 유지합니다.
 *
 * @example
 * ```tsx
 * // 비용이 많이 드는 객체 생성 최적화
 * const MyComponent = () => {
 *   const expensiveObject = useInstance(() => new ExpensiveClass());
 *
 *   return <div>{expensiveObject.getValue()}</div>;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Map 인스턴스 유지
 * const CacheComponent = () => {
 *   const cache = useInstance(() => new Map<string, any>());
 *
 *   const addToCache = (key: string, value: any) => {
 *     cache.set(key, value);
 *   };
 *
 *   return <div>캐시 크기: {cache.size}</div>;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // 설정 객체 생성
 * const ConfigComponent = () => {
 *   const config = useInstance(() => ({
 *     apiUrl: process.env.REACT_APP_API_URL,
 *     timeout: 5000,
 *     retries: 3
 *   }));
 *
 *   return <div>API URL: {config.apiUrl}</div>;
 * };
 * ```
 */
const useInstance = <T>(initFunc: () => T): T => {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = initFunc();
  }

  return ref.current;
};

export default useInstance;
