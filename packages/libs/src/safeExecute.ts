type SafeExecuteSuccess<R> = { success: true; value: R };
type SafeExecuteError = { success: false; error: unknown | Error };
type SafeExecuteResult<R> = SafeExecuteSuccess<R> | SafeExecuteError;

// 1. 동기 함수를 위한 오버로드 시그니처
export function safeExecute<F extends (...args: unknown[]) => any>(
  callback: F
): (...args: Parameters<F>) => SafeExecuteResult<ReturnType<F>>;

// 2. 비동기 함수를 위한 오버로드 시그니처
export function safeExecute<F extends (...args: unknown[]) => Promise<any>>(
  callback: F
): (
  ...args: Parameters<F>
) => Promise<SafeExecuteResult<Awaited<ReturnType<F>>>>;

// 3. 실제 구현부
export function safeExecute<F extends (...args: unknown[]) => unknown>(
  callback: F
) {
  return (...params: Parameters<F>) => {
    try {
      const result = callback(...params);
      if (result instanceof Promise) {
        return result
          .then(value => ({ success: true, value }))
          .catch(error => ({ success: false, error })) as any;
      }
      return { success: true, value: result };
    } catch (error) {
      return { success: false, error };
    }
  };
}
