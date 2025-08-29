/**
 * 케밥 케이스('-')나 스네이크 케이스('_') 문자열을
 * 카멜 케이스로 변환하는 유틸리티 타입입니다.
 * - 파스칼 케이스 입력도 자동으로 소문자화되어 카멜 케이스의 첫 글자 규칙을 따릅니다.
 *
 * @typeParam S - 입력 문자열 리터럴 타입
 *
 * @example
 * type A = CamelCase<'extract-components'>; // 'extractComponents'
 * type B = CamelCase<'on_error'>;           // 'onError'
 * type C = CamelCase<'ExtractComponents'>;  // 'extractComponents'
 */
export type CamelCase<S extends string> =
  S extends `${infer Head}-${infer Rest}`
    ? `${Head}${Capitalize<CamelCase<Rest>>}`
    : S extends `${infer Head}_${infer Rest}`
      ? `${Head}${Capitalize<CamelCase<Rest>>}`
      : Uncapitalize<S>;

/**
 * 케밥 케이스('-')나 스네이크 케이스('_') 문자열을
 * 파스칼 케이스로 변환하는 유틸리티 타입입니다.
 * - 연속 구분자도 안전하게 처리됩니다.
 * - 선행/후행 구분자는 무시됩니다.
 *
 * @typeParam S - 입력 문자열 리터럴 타입
 *
 * @example
 * type A = PascalCase<'extract-components'>; // 'ExtractComponents'
 * type B = PascalCase<'on_error'>;           // 'OnError'
 * type C = PascalCase<'__deep--case__'>;     // 'DeepCase'
 */
export type PascalCase<S extends string> =
  S extends `${infer Head}-${infer Rest}`
    ? PascalCase<Head> extends ''
      ? PascalCase<Rest>
      : `${Capitalize<PascalCase<Head>>}${PascalCase<Rest>}`
    : S extends `${infer Head}_${infer Rest}`
      ? PascalCase<Head> extends ''
        ? PascalCase<Rest>
        : `${Capitalize<PascalCase<Head>>}${PascalCase<Rest>}`
      : S extends ''
        ? ''
        : Capitalize<S>;

/**
 * Camel/Pascal/snake/kebab 문자열을 스네이크 케이스로 변환하는 유틸리티 타입입니다.
 * - 연속된 구분자('-', '_')는 하나의 구분자로 처리합니다.
 * - 선행/후행 구분자는 무시됩니다.
 * - 대문자 경계(camel, Pascal)에는 자동으로 '_'를 삽입합니다.
 *
 * @example
 * type A = SnakeCase<'extract-components'>; // 'extract_components'
 * type B = SnakeCase<'on_error'>;           // 'on_error'
 * type C = SnakeCase<'ExtractComponents'>;  // 'extract_components'
 * type D = SnakeCase<'deep__Case--X'>;      // 'deep_case_x'
 */
export type SnakeCase<S extends string> =
  NormalizeSnake<
    InsertSep<'_', Uncapitalize<S>>
  >;

/**
 * Camel/Pascal/snake/kebab 문자열을 케밥 케이스로 변환하는 유틸리티 타입입니다.
 * - 연속된 구분자('-', '_')는 하나의 구분자로 처리합니다.
 * - 선행/후행 구분자는 무시됩니다.
 * - 대문자 경계(camel, Pascal)에는 자동으로 '-'를 삽입합니다.
 *
 * @example
 * type A = KebabCase<'extract-components'>; // 'extract-components'
 * type B = KebabCase<'on_error'>;           // 'on-error'
 * type C = KebabCase<'ExtractComponents'>;  // 'extract-components'
 * type D = KebabCase<'deep__Case--X'>;      // 'deep-case-x'
 */
export type KebabCase<S extends string> =
  NormalizeKebab<
    InsertSep<'-', Uncapitalize<S>>
  >;

// 내부 헬퍼: 대문자 경계 앞에 구분자 삽입
type InsertSep<Sep extends '-' | '_', S extends string> =
  S extends `${infer A}${infer B}`
    ? B extends ''
      ? Lowercase<A>
      : A extends '-' | '_'
        ? `${Sep}${InsertSep<Sep, B>}`
        : B extends Uncapitalize<B> // 다음 문자가 소문자 시작
          ? `${Lowercase<A>}${InsertSep<Sep, B>}`
          : `${Lowercase<A>}${Sep}${InsertSep<Sep, B>}`
    : S;

// 내부 헬퍼: 스네이크 정규화 (연속/양끝 구분자 정리)
type NormalizeSnake<S extends string> =
  S extends `_${infer R}` ? NormalizeSnake<R>
    : S extends `${infer R}_` ? NormalizeSnake<R>
      : S extends `${infer A}__${infer B}` ? NormalizeSnake<`${A}_${B}`>
        : S;

// 내부 헬퍼: 케밥 정규화 (연속/양끝 구분자 정리)
type NormalizeKebab<S extends string> =
  S extends `-${infer R}` ? NormalizeKebab<R>
    : S extends `${infer R}-` ? NormalizeKebab<R>
      : S extends `${infer A}--${infer B}` ? NormalizeKebab<`${A}-${B}`>
        : S;



