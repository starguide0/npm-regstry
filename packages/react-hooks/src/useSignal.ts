import { useMemo, useRef, useState } from 'react';

/**
 * React 상태를 "Signal"처럼 다룰 수 있게 해주는 훅.
 *
 * - 반환된 객체는 Proxy로 감싸져 있어 속성에 새 값을 대입하면 자동으로 컴포넌트가 리렌더링됩니다.
 * - Immer나 setState 호출 없이도 `obj.count += 1`과 같이 직접 변경(mutation)하는 형태로 사용할 수 있습니다.
 * - 내부적으로는 변경 감지를 위해 얕은(shallow) 비교를 수행하고, 변경 시 강제 리렌더링을 트리거합니다.
 *
 * 제약/주의사항:
 * - 이 훅은 "객체 교체"가 아니라 "객체 속성 변경"을 전제로 합니다. 반환된 객체 자체를 재할당하지 마세요.
 *   (예: signal = { ... } 금지. signal.count = 1 처럼 속성만 변경)
 * - 얕은 비교만 수행하므로, 중첩 객체의 내부 속성 변경은 자동 감지되지 않습니다.
 *   필요하다면 중첩 객체를 새 참조로 교체하세요. (예: signal.user = { ...signal.user, name: 'Alice' })
 * - 비동기 이벤트에서 안전하게 동작하지만, React의 상태 업데이트 배치 규칙은 그대로 적용됩니다.
 *
 * 타입 파라미터:
 * - T: 속성 변경을 추적할 객체 형태. Record<string, unknown>의 서브타입이어야 합니다.
 *
 * @param init 초기 객체를 반환하는 팩토리 함수. 최초 렌더 시 한 번만 호출됩니다.
 * @returns 변경을 Proxy로 감지하는 반응형 객체(T)
 *
 * 사용 예시:
 * ```tsx
 * import React from 'react';
 * import { useSignal } from '@your-scope/react-hooks';
 *
 * export function Counter() {
 *   const state = useSignal(() => ({ count: 0, label: 'Clicks' }));
 *
 *   // 아래와 같이 직접 변경하면 자동 리렌더링됩니다.
 *   const inc = () => {
 *     state.count += 1;
 *   };
 *
 *   const rename = () => {
 *     state.label = `Clicks (${state.count})`;
 *   };
 *
 *   return (
 *     <div>
 *       <p>{state.label}: {state.count}</p>
 *       <button onClick={inc}>+1</button>
 *       <button onClick={rename}>rename</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * 중첩 객체 갱신 예시:
 * ```ts
 * type User = { name: string; meta: { likes: number } };
 * const user = useSignal<User>(() => ({ name: 'Ann', meta: { likes: 0 } }));
 * // 내부(meta.likes)만 바꾸면 얕은 비교로는 감지되지 않을 수 있으므로
 * // 다음처럼 새로운 객체로 교체해 주세요.
 * user.meta = { ...user.meta, likes: user.meta.likes + 1 };
 * ```
 */
const useSignal = <T extends Record<string, unknown>>(init: () => T) => {
  const [, forceUpdate] = useState(0);
  const stateRef = useRef<T | null>(null);

  if (stateRef.current === null) {
    stateRef.current = init();
  }

  const currentState = stateRef.current as T;
  return useMemo(() => {
    return new Proxy(currentState, {
      /**
       * 속성 값 변경을 가로채는 'set' 핸들러
       * @param target - 원본 객체 (stateRef.current)
       * @param prop - 변경하려는 속성 이름 (예: 'age')
       * @param value - 새로 할당하려는 값 (예: 31)
       */
      set(target, prop, value) {
        // 만약 이전 값과 동일하면 불필요한 리렌더링 방지
        if (target[prop as string] === value) {
          return true;
        }

        (target as T)[prop as keyof T] = value as T[keyof T];
        forceUpdate(c => c + 1);
        return true;
      },
    });
  }, []);
};

export default useSignal;