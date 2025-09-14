import { useRef, useState } from 'react';

/**
 * 컴포넌트의 생명주기 동안 인스턴스를 유지하고, 리렌더링을 유발하는 트리거를 함께 반환하는 훅.
 *
 * 이 훅은 인스턴스 자체의 불변성을 보장하지 않으므로, 인스턴스의 상태 변경 후에는 반드시 `trigger` 함수를 호출해야 합니다.
 *
 * @template T - 인스턴스 객체의 타입.
 * @param {() => T} init - 객체를 반환하는 초기화 함수.
 * @returns {[T, (updater?: (prev: T) => void) => void]} - 인스턴스와 리렌더링 트리거 함수.
 *
 * @example
 * // 리터럴 객체 사용 예시
 * import { useEffect } from 'react';
 *
 * const MyComponent = () => {
 *   const [myState, trigger] = useInstance(() => ({ count: 0 }));
 *
 *   useEffect(() => {
 *     console.log('리렌더링이 발생했습니다. 현재 카운트:', myState.count);
 *   }, [trigger]);
 *
 *   const handleClick = () => {
 *     myState.count += 1;
 *     if(myState.count % 2 === 0) trigger(); // 인스턴스 값 변경 후 트리거를 호출하여 리렌더링
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>카운트: {myState.count}</button>
 *   );
 * };
 *
 * @example
 * // 클래스 인스턴스 사용 예시
 * import { useEffect } from 'react';
 *
 * class CounterStore {
 *   count = 0;
 *   increment() {
 *     this.count += 1;
 *   }
 * }
 *
 * const MyComponentWithClass = () => {
 *   const [store, trigger] = useInstance(() => new CounterStore());
 *
 *   useEffect(() => {
 *     console.log('스토어 상태 변경 감지. 현재 카운트:', store.count);
 *   }, [trigger]);
 *
 *   const handleClick = () => {
 *     store.increment();
 *     trigger();
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>카운트: {store.count}</button>
 *   );
 * };
 */
const useInstance = <T extends unknown>(init: () => T): [T, (_updater?: (_prev: T) => void) => void] => {
  const [, forceUpdate] = useState(0);
  const instanceRef = useRef<T>();

  if (!instanceRef.current) {
    const value = init();
    if (typeof value !== 'object' || value === null) {
      throw new Error('useInstance: 초기화 함수는 반드시 객체를 반환해야 합니다.');
    }
    instanceRef.current = value;
  }

  const trigger = (updater?: (_prev: T) => void) => {
    if (updater) {
      updater(instanceRef.current!);
    }
    forceUpdate(prev => prev + 1);
  };

  return [instanceRef.current!, trigger];
};

export default useInstance;
