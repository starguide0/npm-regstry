/**
 * Shared TypeScript type definitions
 */

export type CompilerTarget =
  | 'ES5'
  | 'ES2015'
  | 'ES2017'
  | 'ES2018'
  | 'ES2019'
  | 'ES2020'
  | 'ES2021'
  | 'ES2022'
  | 'ESNext';

export type ModuleKind =
  | 'CommonJS'
  | 'AMD'
  | 'System'
  | 'UMD'
  | 'ES6'
  | 'ES2015'
  | 'ES2020'
  | 'ES2022'
  | 'ESNext'
  | 'Node16'
  | 'NodeNext';

export interface TsConfigOptions {
  target?: CompilerTarget;
  module?: ModuleKind;
  lib?: string[];
  outDir?: string;
  rootDir?: string;
  strict?: boolean;
  esModuleInterop?: boolean;
  skipLibCheck?: boolean;
  forceConsistentCasingInFileNames?: boolean;
  declaration?: boolean;
  declarationMap?: boolean;
  sourceMap?: boolean;
}

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
}
