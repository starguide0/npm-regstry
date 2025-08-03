/**
 * Shared ESLint flat configurations and utilities
 */

export interface FlatESLintConfig {
  files?: string[];
  ignores?: string[];
  languageOptions?: {
    parser?: any;
    parserOptions?: Record<string, any>;
    globals?: Record<string, boolean>;
  };
  plugins?: Record<string, any>;
  rules?: Record<string, any>;
}

export const baseFlatConfig: FlatESLintConfig[] = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        node: true,
        es2020: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
];

export const createFlatESLintConfig = (
  overrides: Partial<FlatESLintConfig> = {}
): FlatESLintConfig[] => {
  return [
    {
      ...baseFlatConfig[0],
      ...overrides,
      rules: {
        ...baseFlatConfig[0].rules,
        ...overrides.rules,
      },
    },
    baseFlatConfig[1],
  ];
};

export * from './configs';
