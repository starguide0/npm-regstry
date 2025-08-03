import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useInstance from './useInstance';

describe('useInstance', () => {
  it('초기화함수를 한 번만 호출하고 동일한 인스턴스를 반환해야 한다', () => {
    const initFunc = vi.fn(() => ({ id: Math.random() }));

    const { result, rerender } = renderHook(() => useInstance(initFunc));

    const firstResult = result.current;
    expect(initFunc).toHaveBeenCalledTimes(1);

    // 훅을 다시 렌더링
    rerender();

    const secondResult = result.current;
    expect(initFunc).toHaveBeenCalledTimes(1); // 여전히 한 번만 호출되어야 함
    expect(secondResult).toBe(firstResult); // 동일한 인스턴스를 반환해야 함
  });

  it('다양한 타입과 함께 작동해야 한다', () => {
    const stringInitFunc = vi.fn(() => 'test-string');
    const numberInitFunc = vi.fn(() => 42);
    const objectInitFunc = vi.fn(() => ({ name: 'test' }));

    const { result: stringResult } = renderHook(() =>
      useInstance(stringInitFunc)
    );
    const { result: numberResult } = renderHook(() =>
      useInstance(numberInitFunc)
    );
    const { result: objectResult } = renderHook(() =>
      useInstance(objectInitFunc)
    );

    expect(stringResult.current).toBe('test-string');
    expect(numberResult.current).toBe(42);
    expect(objectResult.current).toEqual({ name: 'test' });
  });

  it('함수를 반환하는 함수를 처리해야 한다', () => {
    const innerFunc = () => 'inner result';
    const initFunc = vi.fn(() => innerFunc);

    const { result } = renderHook(() => useInstance(initFunc));

    expect(typeof result.current).toBe('function');
    expect(result.current()).toBe('inner result');
    expect(initFunc).toHaveBeenCalledTimes(1);
  });
});
