import { describe, it, expect } from 'vitest';
import { safeExecute } from './safeExecute';

describe('safeExecute', () => {
  it('동기 함수가 성공할 때 올바른 결과를 반환해야 한다', async () => {
    const syncFunc = (a: number, b: number) => a + b;
    const safeSyncFunc = safeExecute(syncFunc);

    const result = await safeSyncFunc(5, 3);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(8);
    }
  });

  it('동기 함수가 에러를 던질 때 에러를 캐치해야 한다', async () => {
    const errorFunc = () => {
      throw new Error('Test error');
    };
    const safeErrorFunc = safeExecute(errorFunc);

    const result = await safeErrorFunc();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Test error');
    }
  });

  it('비동기 함수가 성공할 때 올바른 결과를 반환해야 한다', async () => {
    const asyncFunc = async (delay: number) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return 'async result';
    };
    const safeAsyncFunc = safeExecute(asyncFunc);

    const result = await safeAsyncFunc(10);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('async result');
    }
  });

  it('비동기 함수가 에러를 던질 때 에러를 캐치해야 한다', async () => {
    const asyncErrorFunc = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw new Error('Async error');
    };
    const safeAsyncErrorFunc = safeExecute(asyncErrorFunc);

    const result = await safeAsyncErrorFunc();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Async error');
    }
  });

  it('여러 매개변수를 가진 함수와 함께 작동해야 한다', async () => {
    const multiParamFunc = (name: string, age: number, city: string) => {
      return `${name} is ${age} years old and lives in ${city}`;
    };
    const safeMultiParamFunc = safeExecute(multiParamFunc);

    const result = await safeMultiParamFunc('Alice', 30, 'Seoul');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('Alice is 30 years old and lives in Seoul');
    }
  });

  it('JSON.parse와 같은 실제 함수와 함께 작동해야 한다', async () => {
    const safeJsonParse = safeExecute(JSON.parse);

    // 유효한 JSON
    const validResult = await safeJsonParse('{"key": "value"}');
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.value).toEqual({ key: 'value' });
    }

    // 무효한 JSON
    const invalidResult = await safeJsonParse('invalid json');
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error).toBeInstanceOf(SyntaxError);
    }
  });

  it('함수를 반환하는 함수를 처리해야 한다', async () => {
    const funcReturningFunc = () => {
      return (x: number) => x * 2;
    };
    const safeFuncReturningFunc = safeExecute(funcReturningFunc);

    const result = await safeFuncReturningFunc();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.value).toBe('function');
      expect(result.value(5)).toBe(10);
    }
  });

  it('undefined를 반환하는 함수를 처리해야 한다', async () => {
    const undefinedFunc = () => undefined;
    const safeUndefinedFunc = safeExecute(undefinedFunc);

    const result = await safeUndefinedFunc();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBeUndefined();
    }
  });

  it('null을 반환하는 함수를 처리해야 한다', async () => {
    const nullFunc = () => null;
    const safeNullFunc = safeExecute(nullFunc);

    const result = await safeNullFunc();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBeNull();
    }
  });

  it('Promise를 reject하는 함수를 처리해야 한다', async () => {
    const rejectFunc = async () => {
      return Promise.reject(new Error('Promise rejected'));
    };
    const safeRejectFunc = safeExecute(rejectFunc);

    const result = await safeRejectFunc();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Promise rejected');
    }
  });
});
