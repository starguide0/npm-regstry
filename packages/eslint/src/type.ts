
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
