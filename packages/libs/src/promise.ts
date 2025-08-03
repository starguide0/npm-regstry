export const isPromiseLike = (
  value: unknown
): value is PromiseLike<unknown> => {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
};

/**
 * 비동기 함수 생성자를 참조하는 상수입니다.
 * async 함수의 내부 constructor를 직접 접근하여 저장합니다.
 * 새로운 비동기 함수를 동적으로 생성할 때 사용할 수 있습니다.
 * @return '
 */
export const AsyncFunc = (async () => {}).constructor;

/**
 * withResolver polyfill
 */
(() => {
  if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function <T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;

      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });

      return {
        promise,
        resolve,
        reject,
      };
    };
  }
})();
