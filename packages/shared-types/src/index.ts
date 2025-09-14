/**
 * @starguide0/shared-types
 *
 * TypeScript에서 기본적으로 제공하지 않는 유용한 유틸리티 타입들의 모음집입니다.
 * 이 타입들은 TypeScript 개발에서 자주 사용되는 패턴들을 도와줍니다.
 *
 * 이 패키지는 세 가지 주요 카테고리의 유틸리티 타입을 제공합니다:
 * - 객체 조작 타입: 객체의 속성을 재귀적으로 변경하거나 필터링
 * - 함수 조작 타입: 함수의 매개변수, 반환 타입, 비동기 처리 등을 분석
 * - 배열 조작 타입: 배열과 튜플의 요소를 추출, 변환, 검사
 *
 * @example
 * ```typescript
 * import type { DeepPartial, Head, AsyncReturnType } from '@starguide0/shared-types';
 *
 * // 객체 타입을 재귀적으로 선택적으로 만들기
 * interface User {
 *   name: string;
 *   profile: {
 *     age: number;
 *     address: {
 *       city: string;
 *       zipCode: string;
 *     };
 *   };
 * }
 *
 * type PartialUser = DeepPartial<User>;
 * // 모든 속성이 선택적이 됨
 *
 * // 배열의 첫 번째 요소 타입 추출
 * type FirstElement = Head<[string, number, boolean]>; // string
 *
 * // 비동기 함수의 반환 타입 추출
 * async function fetchData(): Promise<{ data: string[] }> {
 *   return { data: ["item1", "item2"] };
 * }
 * type DataType = AsyncReturnType<typeof fetchData>; // { data: string[] }
 * ```
 */

/**
 * 객체 조작을 위한 유틸리티 타입들
 *
 * 객체의 속성을 재귀적으로 변경하거나, 특정 조건에 따라 속성을 선택/제외하는 타입들입니다.
 * 중첩된 객체 구조를 다룰 때 특히 유용합니다.
 *
 * @example
 * ```typescript
 * // 깊은 부분 타입 만들기
 * type Config = DeepPartial<{
 *   database: {
 *     host: string;
 *     port: number;
 *     credentials: {
 *       username: string;
 *       password: string;
 *     };
 *   };
 * }>;
 *
 * // 특정 타입의 속성만 선택
 * type StringProps = PickByType<{
 *   name: string;
 *   age: number;
 *   email: string;
 * }, string>; // { name: string; email: string }
 * ```
 */
export type {
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  DeepMutable,
  PickByType,
  OmitByType,
  KeysOfType,
  PartialBy,
  RequiredBy,
  Flatten,
} from './object-utils';

/**
 * 함수 조작을 위한 유틸리티 타입들
 *
 * 함수의 매개변수, 반환 타입, 비동기 처리 등을 타입 레벨에서 분석하고 변환하는 타입들입니다.
 * 함수형 프로그래밍이나 고차 함수를 다룰 때 유용합니다.
 *
 * @example
 * ```typescript
 * // 함수의 매개변수 타입 추출
 * function createUser(name: string, age: number, isActive: boolean): User {
 *   return { name, age, isActive };
 * }
 *
 * type FirstParam = FirstParameter<typeof createUser>; // string
 *
 * // 비동기 함수를 동기 함수로 변환
 * type SyncVersion = Unpromisify<(id: string) => Promise<User>>; // (id: string) => User
 * ```
 */
export type {
  AsyncReturnType,
  FirstParameter,
  LastParameter,
  FunctionWithParams,
  OptionalParameters,
  Curry,
  ConstructorParameters,
  InstanceType,
  Promisify,
  Unpromisify,
} from './function-utils';

/**
 * 배열 조작을 위한 유틸리티 타입들
 *
 * 배열과 튜플의 요소를 추출, 변환, 검사하는 타입들입니다.
 * 타입 레벨에서 배열을 조작하거나 패턴 매칭을 수행할 때 유용합니다.
 *
 * @example
 * ```typescript
 * // 배열 요소 추출
 * type Numbers = [1, 2, 3, 4, 5];
 * type FirstNumber = Head<Numbers>; // 1
 * type LastNumber = Last<Numbers>; // 5
 * type RestNumbers = Tail<Numbers>; // [2, 3, 4, 5]
 *
 * // 배열 변환
 * type Reversed = Reverse<Numbers>; // [5, 4, 3, 2, 1]
 * type ArrayLength = Length<Numbers>; // 5
 *
 * // 문자열 배열 조작
 * type Words = ["hello", "world", "typescript"];
 * type Sentence = Join<Words, " ">; // "hello world typescript"
 * ```
 *
 * 배열 평면화 타입 (이름 충돌 방지용 재내보내기)
 *
 * object-utils의 Flatten과 이름 충돌을 방지하기 위해 ArrayFlatten으로 재내보냅니다.
 * 중첩된 배열을 1차원 배열로 평면화하는 타입입니다.
 *
 * @example
 * ```typescript
 * type NestedArray = [[1, 2], [3, [4, 5]], 6];
 * type FlatArray = ArrayFlatten<NestedArray>; // [1, 2, 3, 4, 5, 6]
 * ```
 */
export type {
  Head,
  Tail,
  Last,
  Init,
  Length,
  IsEmpty,
  IsNotEmpty,
  Reverse,
  Join,
  Split,
  Repeat,
  At,
  Includes,
  Flatten as ArrayFlatten,
} from './array-utils';

/**
 * 문자열 표기법 변환 유틸리티 타입들
 *
 * 케밥/스네이크/카멜/파스칼 간 변환을 타입 레벨에서 수행합니다.
 *
 * @example
 * type A = CamelCase<'extract-components'>; // 'extractComponents'
 * type B = PascalCase<'on_error'>;          // 'OnError'
 * type C = SnakeCase<'DeepCaseX'>;          // 'deep_case_x'
 * type D = KebabCase<'deep__Case--X'>;      // 'deep-case-x'
 */
export type { CamelCase, PascalCase, SnakeCase, KebabCase } from './notation';
