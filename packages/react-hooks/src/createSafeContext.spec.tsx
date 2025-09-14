import { describe, it, expect } from 'vitest';
import React, { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import createSafeContext from './createSafeContext';

describe('createSafeContext', () => {
  it('Provider 없이 사용하면 에러를 던져야 한다', () => {
    const [, useSafeCtx] = createSafeContext<{ value: number }>();

    expect(() => renderHook(() => useSafeCtx())).toThrow(
      'Context must be used within its Provider',
    );
  });

  it('Provider로 감싸면 값이 정상적으로 제공되어야 한다', () => {
    const [Provider, useSafeCtx] = createSafeContext<{ value: number }>();

    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider value={{ value: 123 }}>{children}</Provider>
    );

    const { result } = renderHook(() => useSafeCtx('MyCtx'), { wrapper });

    expect(result.current).toEqual({ value: 123 });
  });
});
