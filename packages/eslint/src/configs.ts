/**
 * Predefined ESLint flat configurations
 */
import { FlatESLintConfig } from './type';

/**
 * node eslint 설정 flat config
 */
export const nodeFlatConfig: FlatESLintConfig[] = [
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
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
];

/**
 * 라이브러리 eslint flat config
 */
export const libraryFlatConfig: FlatESLintConfig[] = [
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
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
];

/**
 * application 개발 eslint flat config
 */
export const strictFlatConfig: FlatESLintConfig[] = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        node: true,
        es2020: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      'no-console': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
];
