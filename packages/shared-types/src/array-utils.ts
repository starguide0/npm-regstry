/**
 * 배열 조작을 위한 유틸리티 타입들
 *
 * 이 모듈은 TypeScript에서 배열과 튜플 타입을 조작하는 고급 유틸리티 타입들을 제공합니다.
 * 배열의 요소 추출, 변환, 검사 등을 타입 레벨에서 수행할 수 있습니다.
 */

/**
 * 배열의 첫 번째 요소 타입을 추출하는 유틸리티 타입
 *
 * 튜플이나 배열 타입에서 첫 번째 요소의 타입만 추출합니다.
 * 패턴 매칭이나 배열 분해에서 유용합니다.
 *
 * @template T - 분석할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type Numbers = [1, 2, 3, 4, 5];
 * type FirstNumber = Head<Numbers>;
 * // 결과: 1
 *
 * type StringArray = ["hello", "world", "typescript"];
 * type FirstString = Head<StringArray>;
 * // 결과: "hello"
 *
 * // 함수에서 사용
 * function processFirst<T extends readonly unknown[]>(arr: T): Head<T> {
 *   return arr[0] as Head<T>;
 * }
 *
 * const result = processFirst([42, "text", true]); // 타입: 42
 * ```
 *
 * @example
 * ```typescript
 * // 빈 배열의 경우
 * type EmptyArray = [];
 * type FirstOfEmpty = Head<EmptyArray>;
 * // 결과: never
 *
 * // 유니온 타입 배열
 * type MixedArray = [string | number, boolean, object];
 * type FirstMixed = Head<MixedArray>;
 * // 결과: string | number
 * ```
 */
export type Head<T extends readonly unknown[]> = T extends readonly [
  infer H,
  ...unknown[],
]
  ? H
  : never;

/**
 * 배열에서 첫 번째 요소를 제외한 나머지 요소들의 타입을 추출하는 유틸리티 타입
 *
 * 튜플이나 배열 타입에서 첫 번째 요소를 제거하고 나머지 요소들로 새로운 배열 타입을 생성합니다.
 * 재귀적 배열 처리나 함수형 프로그래밍에서 유용합니다.
 *
 * @template T - 분석할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type Numbers = [1, 2, 3, 4, 5];
 * type RestNumbers = Tail<Numbers>;
 * // 결과: [2, 3, 4, 5]
 *
 * type StringArray = ["first", "second", "third"];
 * type RestStrings = Tail<StringArray>;
 * // 결과: ["second", "third"]
 *
 * // 재귀적 처리에서 사용
 * type ProcessArray<T extends readonly unknown[]> = T extends readonly []
 *   ? []
 *   : [Head<T>, ...ProcessArray<Tail<T>>];
 * ```
 *
 * @example
 * ```typescript
 * // 단일 요소 배열
 * type SingleElement = ["only"];
 * type TailOfSingle = Tail<SingleElement>;
 * // 결과: []
 *
 * // 빈 배열
 * type EmptyArray = [];
 * type TailOfEmpty = Tail<EmptyArray>;
 * // 결과: []
 * ```
 */
export type Tail<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...infer Rest,
]
  ? Rest
  : [];

/**
 * 배열의 마지막 요소 타입을 추출하는 유틸리티 타입
 *
 * 튜플이나 배열 타입에서 마지막 요소의 타입만 추출합니다.
 * 배열의 끝 요소에 접근하거나 패턴 매칭에서 유용합니다.
 *
 * @template T - 분석할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type Numbers = [1, 2, 3, 4, 5];
 * type LastNumber = Last<Numbers>;
 * // 결과: 5
 *
 * type MixedArray = [string, number, boolean];
 * type LastType = Last<MixedArray>;
 * // 결과: boolean
 *
 * // 함수에서 사용
 * function getLast<T extends readonly unknown[]>(arr: T): Last<T> {
 *   return arr[arr.length - 1] as Last<T>;
 * }
 *
 * const lastItem = getLast(["a", "b", "c"]); // 타입: "c"
 * ```
 *
 * @example
 * ```typescript
 * // 콜백 함수의 마지막 매개변수 추출
 * type EventHandler = [MouseEvent, KeyboardEvent, FocusEvent];
 * type LastEvent = Last<EventHandler>;
 * // 결과: FocusEvent
 *
 * // 빈 배열의 경우
 * type EmptyArray = [];
 * type LastOfEmpty = Last<EmptyArray>;
 * // 결과: never
 * ```
 */
export type Last<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer L,
]
  ? L
  : never;

/**
 * 배열에서 마지막 요소를 제외한 나머지 요소들의 타입을 추출하는 유틸리티 타입
 *
 * 튜플이나 배열 타입에서 마지막 요소를 제거하고 나머지 요소들로 새로운 배열 타입을 생성합니다.
 * 배열의 초기 부분만 필요한 경우나 재귀적 처리에서 유용합니다.
 *
 * @template T - 분석할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type Numbers = [1, 2, 3, 4, 5];
 * type InitNumbers = Init<Numbers>;
 * // 결과: [1, 2, 3, 4]
 *
 * type StringArray = ["first", "second", "third"];
 * type InitStrings = Init<StringArray>;
 * // 결과: ["first", "second"]
 *
 * // 함수 매개변수에서 마지막 콜백 제외
 * type ApiParams = [string, number, boolean, () => void];
 * type DataParams = Init<ApiParams>;
 * // 결과: [string, number, boolean]
 * ```
 *
 * @example
 * ```typescript
 * // 단일 요소 배열
 * type SingleElement = ["only"];
 * type InitOfSingle = Init<SingleElement>;
 * // 결과: []
 *
 * // 빈 배열
 * type EmptyArray = [];
 * type InitOfEmpty = Init<EmptyArray>;
 * // 결과: []
 * ```
 */
export type Init<T extends readonly unknown[]> = T extends readonly [
  ...infer Rest,
  unknown,
]
  ? Rest
  : [];

/**
 * 튜플의 길이를 추출하는 유틸리티 타입
 *
 * 튜플 타입의 요소 개수를 숫자 리터럴 타입으로 반환합니다.
 * 컴파일 타임에 배열 길이를 확인하거나 타입 검증에서 유용합니다.
 *
 * @template T - 길이를 확인할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type ThreeItems = [string, number, boolean];
 * type ItemCount = Length<ThreeItems>;
 * // 결과: 3
 *
 * type EmptyArray = [];
 * type EmptyLength = Length<EmptyArray>;
 * // 결과: 0
 *
 * // 조건부 타입에서 사용
 * type IsLongArray<T extends readonly unknown[]> = Length<T> extends 0
 *   ? false
 *   : Length<T> extends 1
 *   ? false
 *   : true;
 *
 * type LongCheck1 = IsLongArray<[1, 2, 3]>; // true
 * type LongCheck2 = IsLongArray<[1]>; // false
 * ```
 *
 * @example
 * ```typescript
 * // 함수 오버로드에서 사용
 * function processArray<T extends readonly unknown[]>(
 *   arr: T
 * ): Length<T> extends 0 ? "empty" : "has items" {
 *   return (arr.length === 0 ? "empty" : "has items") as any;
 * }
 *
 * const result1 = processArray([]); // "empty"
 * const result2 = processArray([1, 2]); // "has items"
 * ```
 */
export type Length<T extends readonly unknown[]> = T['length'];

/**
 * 배열이 비어있는지 확인하는 유틸리티 타입
 *
 * 배열 타입이 빈 배열인지 검사하여 boolean 리터럴 타입을 반환합니다.
 * 조건부 타입이나 타입 가드에서 유용합니다.
 *
 * @template T - 검사할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type EmptyArray = [];
 * type IsEmptyCheck = IsEmpty<EmptyArray>;
 * // 결과: true
 *
 * type NonEmptyArray = [1, 2, 3];
 * type IsNonEmptyCheck = IsEmpty<NonEmptyArray>;
 * // 결과: false
 *
 * // 조건부 처리에서 사용
 * type ProcessResult<T extends readonly unknown[]> = IsEmpty<T> extends true
 *   ? "배열이 비어있습니다"
 *   : "배열에 요소가 있습니다";
 *
 * type Result1 = ProcessResult<[]>; // "배열이 비어있습니다"
 * type Result2 = ProcessResult<[1, 2]>; // "배열에 요소가 있습니다"
 * ```
 *
 * @example
 * ```typescript
 * // 타입 가드 함수
 * function isEmpty<T extends readonly unknown[]>(
 *   arr: T
 * ): arr is T & [] {
 *   return arr.length === 0;
 * }
 *
 * const myArray = [1, 2, 3] as const;
 * if (isEmpty(myArray)) {
 *   // 여기서 myArray는 [] 타입으로 좁혀짐
 * }
 * ```
 */
export type IsEmpty<T extends readonly unknown[]> = T extends readonly []
  ? true
  : false;

/**
 * 배열이 비어있지 않은지 확인하는 유틸리티 타입
 *
 * 배열 타입이 비어있지 않은지 검사하여 boolean 리터럴 타입을 반환합니다.
 * IsEmpty의 반대 개념으로, 배열에 요소가 있는지 확인할 때 유용합니다.
 *
 * @template T - 검사할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type NonEmptyArray = [1, 2, 3];
 * type HasElements = IsNotEmpty<NonEmptyArray>;
 * // 결과: true
 *
 * type EmptyArray = [];
 * type HasNoElements = IsNotEmpty<EmptyArray>;
 * // 결과: false
 *
 * // 안전한 배열 접근
 * type SafeHead<T extends readonly unknown[]> = IsNotEmpty<T> extends true
 *   ? Head<T>
 *   : never;
 *
 * type SafeFirst = SafeHead<[1, 2, 3]>; // 1
 * type UnsafeFirst = SafeHead<[]>; // never
 * ```
 *
 * @example
 * ```typescript
 * // 함수에서 사용
 * function processNonEmpty<T extends readonly unknown[]>(
 *   arr: T
 * ): IsNotEmpty<T> extends true ? Head<T> : undefined {
 *   return (arr.length > 0 ? arr[0] : undefined) as any;
 * }
 *
 * const result1 = processNonEmpty([1, 2, 3]); // 1
 * const result2 = processNonEmpty([]); // undefined
 * ```
 */
export type IsNotEmpty<T extends readonly unknown[]> = T extends readonly []
  ? false
  : true;

/**
 * 배열의 순서를 뒤집는 유틸리티 타입
 *
 * 튜플이나 배열 타입의 요소 순서를 역순으로 변경한 새로운 배열 타입을 생성합니다.
 * 재귀적으로 구현되어 있으며, 배열 변환이나 패턴 매칭에서 유용합니다.
 *
 * @template T - 뒤집을 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type Numbers = [1, 2, 3, 4, 5];
 * type ReversedNumbers = Reverse<Numbers>;
 * // 결과: [5, 4, 3, 2, 1]
 *
 * type StringArray = ["first", "second", "third"];
 * type ReversedStrings = Reverse<StringArray>;
 * // 결과: ["third", "second", "first"]
 *
 * // 함수 매개변수 순서 변경
 * type OriginalParams = [string, number, boolean];
 * type ReversedParams = Reverse<OriginalParams>;
 * // 결과: [boolean, number, string]
 * ```
 *
 * @example
 * ```typescript
 * // 빈 배열과 단일 요소
 * type EmptyArray = [];
 * type ReversedEmpty = Reverse<EmptyArray>;
 * // 결과: []
 *
 * type SingleElement = ["only"];
 * type ReversedSingle = Reverse<SingleElement>;
 * // 결과: ["only"]
 *
 * // 중첩 배열
 * type NestedArray = [[1, 2], [3, 4], [5, 6]];
 * type ReversedNested = Reverse<NestedArray>;
 * // 결과: [[5, 6], [3, 4], [1, 2]]
 * ```
 */
export type Reverse<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? [...Reverse<Rest>, First]
  : [];

/**
 * 중첩된 배열을 평면화하는 유틸리티 타입
 *
 * 다차원 배열을 1차원 배열로 변환합니다. 재귀적으로 모든 중첩 레벨을 평면화합니다.
 * 복잡한 중첩 구조를 단순화하거나 데이터 변환에서 유용합니다.
 *
 * @template T - 평면화할 읽기 전용 배열 타입
 *
 * @example
 * ```typescript
 * type NestedNumbers = [[1, 2], [3, [4, 5]], 6];
 * type FlatNumbers = Flatten<NestedNumbers>;
 * // 결과: [1, 2, 3, 4, 5, 6]
 *
 * type DeepNested = [[[1]], [[2, 3]], [4]];
 * type FlatDeep = Flatten<DeepNested>;
 * // 결과: [1, 2, 3, 4]
 *
 * // 혼합 타입 배열
 * type MixedNested = [["a", "b"], [1, 2], [true]];
 * type FlatMixed = Flatten<MixedNested>;
 * // 결과: ["a", "b", 1, 2, true]
 * ```
 *
 * @example
 * ```typescript
 * // 단일 레벨 배열 (변화 없음)
 * type SimpleArray = [1, 2, 3];
 * type FlatSimple = Flatten<SimpleArray>;
 * // 결과: [1, 2, 3]
 *
 * // 빈 배열과 빈 중첩 배열
 * type EmptyNested = [[], [1, 2], []];
 * type FlatEmpty = Flatten<EmptyNested>;
 * // 결과: [1, 2]
 * ```
 */
export type Flatten<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends readonly unknown[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : [];

/**
 * 문자열 배열의 요소들을 구분자로 연결하는 유틸리티 타입
 *
 * 문자열 배열의 모든 요소를 지정된 구분자로 연결한 단일 문자열 타입을 생성합니다.
 * 템플릿 리터럴 타입과 함께 사용하여 동적 문자열 생성에 유용합니다.
 *
 * @template T - 연결할 읽기 전용 문자열 배열 타입
 * @template S - 구분자 문자열 (기본값: ',')
 *
 * @example
 * ```typescript
 * type Words = ["hello", "world", "typescript"];
 * type Sentence = Join<Words, " ">;
 * // 결과: "hello world typescript"
 *
 * type Numbers = ["1", "2", "3", "4"];
 * type CommaSeparated = Join<Numbers>;
 * // 결과: "1,2,3,4" (기본 구분자 사용)
 *
 * type PathParts = ["users", "profile", "settings"];
 * type UrlPath = Join<PathParts, "/">;
 * // 결과: "users/profile/settings"
 * ```
 *
 * @example
 * ```typescript
 * // 단일 요소와 빈 배열
 * type SingleWord = ["hello"];
 * type JoinedSingle = Join<SingleWord, "-">;
 * // 결과: "hello"
 *
 * type EmptyArray = [];
 * type JoinedEmpty = Join<EmptyArray, ",">;
 * // 결과: ""
 *
 * // CSS 클래스명 생성
 * type ClassNames = ["btn", "primary", "large"];
 * type ClassName = Join<ClassNames, "-">;
 * // 결과: "btn-primary-large"
 * ```
 */
export type Join<
  T extends readonly string[],
  S extends string = ',',
> = T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest['length'] extends 0
        ? First
        : `${First}${S}${Join<Rest, S>}`
      : never
    : never
  : '';

/**
 * 문자열을 구분자로 분할하여 배열 타입으로 변환하는 유틸리티 타입
 *
 * 문자열을 지정된 구분자로 분할하여 문자열 배열 타입을 생성합니다.
 * 문자열 파싱이나 경로 분석에서 유용합니다.
 *
 * @template S - 분할할 문자열 타입
 * @template D - 구분자 문자열 (기본값: '')
 *
 * @example
 * ```typescript
 * type CsvData = "apple,banana,cherry";
 * type Fruits = Split<CsvData, ",">;
 * // 결과: ["apple", "banana", "cherry"]
 *
 * type FilePath = "src/components/Button.tsx";
 * type PathParts = Split<FilePath, "/">;
 * // 결과: ["src", "components", "Button.tsx"]
 *
 * type Sentence = "hello world typescript";
 * type Words = Split<Sentence, " ">;
 * // 결과: ["hello", "world", "typescript"]
 * ```
 *
 * @example
 * ```typescript
 * // 문자 단위 분할 (기본 구분자)
 * type Word = "hello";
 * type Characters = Split<Word>;
 * // 결과: ["h", "e", "l", "l", "o"]
 *
 * // 구분자가 없는 경우
 * type NoSeparator = "noseparator";
 * type SingleItem = Split<NoSeparator, ",">;
 * // 결과: ["noseparator"]
 *
 * // URL 파싱
 * type Url = "https://example.com/api/users";
 * type UrlParts = Split<Url, "/">;
 * // 결과: ["https:", "", "example.com", "api", "users"]
 * ```
 */
export type Split<
  S extends string,
  D extends string = '',
> = S extends `${infer First}${D}${infer Rest}`
  ? [First, ...Split<Rest, D>]
  : [S];

/**
 * 지정된 타입으로 N개 길이의 배열을 생성하는 유틸리티 타입
 *
 * 동일한 타입의 요소로 채워진 고정 길이 배열 타입을 생성합니다.
 * 재귀적으로 구현되어 있으며, 고정 크기 데이터 구조 정의에 유용합니다.
 *
 * @template T - 배열 요소의 타입
 * @template N - 배열의 길이 (숫자 리터럴)
 * @template Result - 내부 재귀용 누적 배열 (기본값: [])
 *
 * @example
 * ```typescript
 * type FiveNumbers = Repeat<number, 5>;
 * // 결과: [number, number, number, number, number]
 *
 * type ThreeStrings = Repeat<string, 3>;
 * // 결과: [string, string, string]
 *
 * type TenBooleans = Repeat<boolean, 10>;
 * // 결과: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]
 *
 * // 함수에서 사용
 * function createArray<T, N extends number>(
 *   value: T,
 *   count: N
 * ): Repeat<T, N> {
 *   return Array(count).fill(value) as Repeat<T, N>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 특정 값으로 채운 배열
 * type ZeroArray = Repeat<0, 4>;
 * // 결과: [0, 0, 0, 0]
 *
 * // 객체 타입 반복
 * type UserArray = Repeat<{ id: number; name: string }, 2>;
 * // 결과: [{ id: number; name: string }, { id: number; name: string }]
 *
 * // 빈 배열 (길이 0)
 * type EmptyRepeat = Repeat<string, 0>;
 * // 결과: []
 * ```
 */
export type Repeat<
  T,
  N extends number,
  Result extends T[] = [],
> = Result['length'] extends N ? Result : Repeat<T, N, [...Result, T]>;

/**
 * 배열의 특정 인덱스에 있는 요소의 타입을 추출하는 유틸리티 타입
 *
 * 배열이나 튜플에서 지정된 인덱스 위치의 요소 타입을 반환합니다.
 * 인덱스 기반 타입 접근이나 동적 타입 추출에서 유용합니다.
 *
 * @template T - 접근할 읽기 전용 배열 타입
 * @template I - 접근할 인덱스 (숫자 리터럴)
 *
 * @example
 * ```typescript
 * type MixedArray = [string, number, boolean, object];
 * type SecondElement = At<MixedArray, 1>;
 * // 결과: number
 *
 * type FirstElement = At<MixedArray, 0>;
 * // 결과: string
 *
 * type LastElement = At<MixedArray, 3>;
 * // 결과: object
 *
 * // 함수에서 사용
 * function getAtIndex<T extends readonly unknown[], I extends number>(
 *   arr: T,
 *   index: I
 * ): At<T, I> {
 *   return arr[index] as At<T, I>;
 * }
 *
 * const value = getAtIndex(["a", 42, true], 1); // 타입: 42
 * ```
 *
 * @example
 * ```typescript
 * // 함수 매개변수 타입 추출
 * type FunctionParams = [string, number, () => void];
 * type CallbackParam = At<FunctionParams, 2>;
 * // 결과: () => void
 *
 * // 범위를 벗어난 인덱스
 * type OutOfBounds = At<[1, 2, 3], 5>;
 * // 결과: undefined
 *
 * // 동적 인덱스 접근
 * type DynamicAccess<T extends readonly unknown[], I extends keyof T> = At<T, I>;
 * ```
 */
export type At<T extends readonly unknown[], I extends number> = T[I];

/**
 * 배열이 특정 타입을 포함하는지 확인하는 유틸리티 타입
 *
 * 배열 타입의 요소 중에 지정된 타입과 일치하는 요소가 있는지 검사합니다.
 * 재귀적으로 구현되어 있으며, 타입 검증이나 조건부 타입에서 유용합니다.
 *
 * @template T - 검사할 읽기 전용 배열 타입
 * @template U - 찾을 타입
 *
 * @example
 * ```typescript
 * type MixedArray = [string, number, boolean];
 * type HasString = Includes<MixedArray, string>;
 * // 결과: true
 *
 * type HasObject = Includes<MixedArray, object>;
 * // 결과: false
 *
 * type NumberArray = [1, 2, 3, 4, 5];
 * type HasThree = Includes<NumberArray, 3>;
 * // 결과: true
 *
 * type HasSix = Includes<NumberArray, 6>;
 * // 결과: false
 * ```
 *
 * @example
 * ```typescript
 * // 조건부 타입에서 사용
 * type SafeProcess<T extends readonly unknown[]> = Includes<T, string> extends true
 *   ? "문자열 처리 가능"
 *   : "문자열 없음";
 *
 * type Result1 = SafeProcess<[1, "hello", true]>; // "문자열 처리 가능"
 * type Result2 = SafeProcess<[1, 2, 3]>; // "문자열 없음"
 *
 * // 유니온 타입 검사
 * type UnionArray = [string | number, boolean];
 * type HasStringOrNumber = Includes<UnionArray, string | number>;
 * // 결과: true
 *
 * // 빈 배열
 * type EmptyArray = [];
 * type EmptyIncludes = Includes<EmptyArray, any>;
 * // 결과: false
 * ```
 */
export type Includes<T extends readonly unknown[], U> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends U
    ? true
    : Includes<Rest, U>
  : false;
