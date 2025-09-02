/**
 * Shared ESLint flat configurations and utilities
 */
import { FlatESLintConfig } from './type';

/**
 * 기본 eslint 설정
 */
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
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
];

/**
 * Creates a flat ESLint configuration by merging the supplied overrides into a base configuration.
 *
 * @param {Partial<FlatESLintConfig>} [overrides={}] 구성 객체는 첫 번째로 병합됩니다
 *  기본 구성 배열의 요소. 재정의에 정의 된 속성 만적용됩니다. '규칙'속성은`remerides.rules '의 모든 규칙 정의가 포함되도록 병합됩니다.
 *  기본 구성에서 해당 항목을 덮어 씁니다.
 *
 * @returns {FlatESLintConfig[]} 두 개의 구성 객체로 구성된 배열. 첫 번째 (`baseflatconfig [0]`)
 *  객체는 기본 구성입니다. 두 번째(`BaseFlatConfig [1]`) 객체는 기본 구성의 변하지 않은 두 번째 요소입니다.
 *
 * @type {function(Partial<FlatESLintConfig>): FlatESLintConfig[]}
 */
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
