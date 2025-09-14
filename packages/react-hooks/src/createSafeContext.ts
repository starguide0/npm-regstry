import { createContext, useContext } from 'react';

const nullSymbol = Symbol('Null');
type NullSymbol = typeof nullSymbol;

const createSafeContext = <T>() => {
  const context = createContext<T | NullSymbol>(nullSymbol);

  const useSafeContext = (displayName?: string) => {
    context.displayName = displayName ?? 'SafeContext';
    const contextValue = useContext(context) ?? Symbol('Null');

    if (contextValue === nullSymbol) {
      throw new Error('Context must be used within its Provider');
    }

    return contextValue;
  };

  return [context.Provider, useSafeContext] as const;
};

export default createSafeContext;