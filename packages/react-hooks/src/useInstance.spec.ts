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
    expect(secondResult[0]).toBe(firstResult[0]); // 동일한 인스턴스를 반환해야 함
  });

  it('객체를 반환하지 않으면 에러를 던져야 한다', () => {
    const stringInitFunc = vi.fn(() => 'test-string');
    const numberInitFunc = vi.fn(() => 42);
    const objectInitFunc = vi.fn(() => ({ name: 'test' }));

    expect(() => renderHook(() => useInstance(stringInitFunc))).toThrow(
      'useInstance: 초기화 함수는 반드시 객체를 반환해야 합니다.',
    );
    expect(() => renderHook(() => useInstance(numberInitFunc))).toThrow(
      'useInstance: 초기화 함수는 반드시 객체를 반환해야 합니다.',
    );

    const { result: { current: objectResult } } = renderHook(() =>
      useInstance(objectInitFunc),
    );
    expect(objectResult[0]).toEqual({ name: 'test' });
  });

  it('init이 함수를 반환하면 에러를 던져야 한다(객체만 허용)', () => {
    const innerFunc = (): string => 'inner result';
    const initFunc = vi.fn(() => innerFunc);

    expect(() => renderHook(() => useInstance(initFunc))).toThrow(
      'useInstance: 초기화 함수는 반드시 객체를 반환해야 합니다.',
    );
  });
});
