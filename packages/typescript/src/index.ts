/**
 * Shared TypeScript configurations and utilities
 */

export interface BaseConfig {
  target: string;
  module: string;
  strict: boolean;
}

export const defaultTsConfig: BaseConfig = {
  target: 'ES2020',
  module: 'ESNext',
  strict: true,
};

export const createTsConfig = (
  overrides: Partial<BaseConfig> = {}
): BaseConfig => {
  return {
    ...defaultTsConfig,
    ...overrides,
  };
};

export * from './types';
