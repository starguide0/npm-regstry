/**
 * 파라미터(milliseconds)만큼 대기하는 함수입니다.
 * @param milliseconds Milliseconds :: 1000ms = 1sec
 * @returns {Promise<function>} PromiseConstructor
 * <pre>
 * 1. func = async () => {
 *      await sleep(milliseconds)
 *    }
 * 2. sleep(milliseconds).then(() => func())
 * </pre>
 */
export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
