/**
 * 함수 조작을 위한 유틸리티 타입들
 *
 * 이 모듈은 함수 타입을 분석하고 변환하는 고급 유틸리티 타입들을 제공합니다.
 * 함수의 매개변수, 반환 타입, 비동기 처리 등을 타입 레벨에서 조작할 수 있습니다.
 */

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */

/**
 * 비동기 함수의 반환 타입을 추출하는 유틸리티 타입
 *
 * Promise를 반환하는 함수에서 실제 해결(resolve)되는 값의 타입을 추출합니다.
 * 비동기 함수의 결과 타입을 다른 곳에서 재사용할 때 유용합니다.
 *
 * @template T - Promise를 반환하는 함수 타입
 *
 * @example
 * ```typescript
 * async function fetchUser(id: string): Promise<{ name: string; email: string }> {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * }
 *
 * type User = AsyncReturnType<typeof fetchUser>;
 * // 결과: { name: string; email: string }
 *
 * // 사용 예시
 * function processUser(user: User) {
 *   console.log(`사용자: ${user.name}, 이메일: ${user.email}`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // API 응답 타입 추출
 * const apiCall = async (): Promise<{ data: string[]; count: number }> => {
 *   return { data: ["item1", "item2"], count: 2 };
 * };
 *
 * type ApiResponse = AsyncReturnType<typeof apiCall>;
 * // 결과: { data: string[]; count: number }
 * ```
 */
export type AsyncReturnType<T extends (..._args: any) => Promise<any>> = T extends (
  ..._args: any
) => Promise<infer R>
  ? R
  : never;

/**
 * 함수의 매개변수 타입들을 튜플로 추출하는 유틸리티 타입
 *
 * 함수의 모든 매개변수 타입을 순서대로 튜플 타입으로 반환합니다.
 * 함수 시그니처를 다른 곳에서 재사용하거나 매개변수를 분석할 때 유용합니다.
 *
 * @template T - 분석할 함수 타입
 *
 * @example
 * ```typescript
 * function createUser(name: string, age: number, isActive: boolean): void {
 *   // 구현...
 * }
 *
 * type CreateUserParams = Parameters<typeof createUser>;
 * // 결과: [string, number, boolean]
 *
 * // 사용 예시
 * function callCreateUser(...args: CreateUserParams) {
 *   createUser(...args);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 콜백 함수의 매개변수 타입 추출
 * type EventHandler = (event: MouseEvent, target: HTMLElement) => void;
 * type HandlerParams = Parameters<EventHandler>;
 * // 결과: [MouseEvent, HTMLElement]
 * ```
 */
export type Parameters<T extends (..._args: any) => any> = T extends (
  ..._args: infer P
) => any
  ? P
  : never;

/**
 * 함수의 첫 번째 매개변수 타입을 추출하는 유틸리티 타입
 *
 * 함수의 첫 번째 매개변수의 타입만 추출합니다.
 * 커링이나 부분 적용 함수를 만들 때 유용합니다.
 *
 * @template T - 분석할 함수 타입
 *
 * @example
 * ```typescript
 * function processData(data: { id: number; name: string }, options: ProcessOptions): Result {
 *   // 구현...
 * }
 *
 * type DataType = FirstParameter<typeof processData>;
 * // 결과: { id: number; name: string }
 *
 * // 사용 예시
 * function validateData(data: DataType): boolean {
 *   return data.id > 0 && data.name.length > 0;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 이벤트 핸들러의 첫 번째 매개변수 추출
 * type ClickHandler = (event: MouseEvent, element: HTMLElement) => void;
 * type EventType = FirstParameter<ClickHandler>;
 * // 결과: MouseEvent
 * ```
 */
export type FirstParameter<T extends (..._args: any) => any> = T extends (
  _first: infer P,
  ..._args: any
) => any
  ? P
  : never;

/**
 * 함수의 마지막 매개변수 타입을 추출하는 유틸리티 타입
 *
 * 함수의 마지막 매개변수의 타입만 추출합니다.
 * 콜백 함수나 옵션 매개변수를 다룰 때 유용합니다.
 *
 * @template T - 분석할 함수 타입
 *
 * @example
 * ```typescript
 * function fetchData(url: string, method: string, callback: (data: any) => void): void {
 *   // 구현...
 * }
 *
 * type CallbackType = LastParameter<typeof fetchData>;
 * // 결과: (data: any) => void
 *
 * // 사용 예시
 * const myCallback: CallbackType = (data) => {
 *   console.log("데이터 수신:", data);
 * };
 * ```
 *
 * @example
 * ```typescript
 * // 설정 함수의 옵션 매개변수 추출
 * function configure(host: string, port: number, options: ConfigOptions): void {
 *   // 구현...
 * }
 *
 * type OptionsType = LastParameter<typeof configure>;
 * // 결과: ConfigOptions
 * ```
 */
export type LastParameter<T extends (...args: any) => any> = T extends (
  ...args: any[]
) => any
  ? T extends (...args: [...any[], infer L]) => any
    ? L
    : never
  : never;

/**
 * 특정 매개변수 타입들과 반환 타입을 가진 함수 타입을 생성하는 유틸리티 타입
 *
 * 매개변수 타입들의 튜플과 반환 타입을 받아서 함수 타입을 생성합니다.
 * 동적으로 함수 시그니처를 구성할 때 유용합니다.
 *
 * @template P - 매개변수 타입들의 튜플
 * @template R - 반환 타입 (기본값: any)
 *
 * @example
 * ```typescript
 * type MyFunctionParams = [string, number, boolean];
 * type MyFunction = FunctionWithParams<MyFunctionParams, void>;
 * // 결과: (arg0: string, arg1: number, arg2: boolean) => void
 *
 * const myFunc: MyFunction = (name, age, isActive) => {
 *   console.log(`이름: ${name}, 나이: ${age}, 활성: ${isActive}`);
 * };
 * ```
 *
 * @example
 * ```typescript
 * // API 호출 함수 타입 생성
 * type ApiParams = [string, RequestOptions];
 * type ApiFunction = FunctionWithParams<ApiParams, Promise<Response>>;
 *
 * const callApi: ApiFunction = async (endpoint, options) => {
 *   return fetch(endpoint, options);
 * };
 * ```
 */
export type FunctionWithParams<P extends readonly unknown[], R = any> = (
  ...args: P
) => R;

/**
 * 함수의 매개변수들을 선택적(optional)으로 만드는 유틸리티 타입
 *
 * 모든 매개변수를 선택적으로 변경하여 부분 적용이 가능한 함수 타입을 생성합니다.
 * 설정 함수나 기본값이 있는 함수를 만들 때 유용합니다.
 *
 * @template T - 변환할 함수 타입
 *
 * @example
 * ```typescript
 * function createConfig(host: string, port: number, ssl: boolean): Config {
 *   return { host, port, ssl };
 * }
 *
 * type FlexibleConfig = OptionalParameters<typeof createConfig>;
 * // 결과: (host?: string, port?: number, ssl?: boolean) => Config
 *
 * const flexibleCreateConfig: FlexibleConfig = (host = "localhost", port = 3000, ssl = false) => {
 *   return createConfig(host, port, ssl);
 * };
 *
 * // 사용 예시
 * const config1 = flexibleCreateConfig(); // 모든 기본값 사용
 * const config2 = flexibleCreateConfig("example.com"); // host만 지정
 * const config3 = flexibleCreateConfig("example.com", 8080, true); // 모든 값 지정
 * ```
 */
export type OptionalParameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => infer R
  ? (...args: Partial<P>) => R
  : never;

/**
 * 함수를 커링된(curried) 형태로 변환하는 유틸리티 타입
 *
 * 여러 매개변수를 받는 함수를 단일 매개변수를 받는 함수들의 체인으로 변환합니다.
 * 함수형 프로그래밍에서 부분 적용과 함수 조합에 유용합니다.
 *
 * @template T - 커링할 함수 타입
 *
 * @example
 * ```typescript
 * type AddFunction = (a: number, b: number, c: number) => number;
 * type CurriedAdd = Curry<AddFunction>;
 * // 결과: (arg: number) => (arg: number) => (arg: number) => number
 *
 * const add: AddFunction = (a, b, c) => a + b + c;
 * const curriedAdd: CurriedAdd = (a) => (b) => (c) => a + b + c;
 *
 * // 사용 예시
 * const add5 = curriedAdd(5);
 * const add5And3 = add5(3);
 * const result = add5And3(2); // 10
 *
 * // 또는 체이닝으로
 * const result2 = curriedAdd(1)(2)(3); // 6
 * ```
 *
 * @example
 * ```typescript
 * // 문자열 처리 함수 커링
 * type StringProcessor = (prefix: string, suffix: string, text: string) => string;
 * type CurriedProcessor = Curry<StringProcessor>;
 *
 * const processString: CurriedProcessor = (prefix) => (suffix) => (text) =>
 *   `${prefix}${text}${suffix}`;
 *
 * const addBrackets = processString("[")("]");
 * const result = addBrackets("내용"); // "[내용]"
 * ```
 */
export type Curry<T> = T extends (first: infer F, ...rest: infer R) => infer Return
  ? R extends []
    ? (arg: F) => Return
    : (arg: F) => Curry<(...args: R) => Return>
  : never;

/**
 * 생성자 함수의 매개변수 타입들을 추출하는 유틸리티 타입
 *
 * 클래스나 생성자 함수의 생성자 매개변수 타입들을 튜플로 추출합니다.
 * 팩토리 함수나 의존성 주입에서 유용합니다.
 *
 * @template T - 생성자 함수 타입
 *
 * @example
 * ```typescript
 * class User {
 *   constructor(public name: string, public age: number, public email: string) {}
 * }
 *
 * type UserConstructorParams = ConstructorParameters<typeof User>;
 * // 결과: [string, number, string]
 *
 * // 팩토리 함수에서 사용
 * function createUser(...args: UserConstructorParams): User {
 *   return new User(...args);
 * }
 *
 * const user = createUser("홍길동", 30, "hong@example.com");
 * ```
 *
 * @example
 * ```typescript
 * // 제네릭 팩토리 함수
 * function createInstance<T extends new (...args: any[]) => any>(
 *   constructor: T,
 *   ...args: ConstructorParameters<T>
 * ): InstanceType<T> {
 *   return new constructor(...args);
 * }
 *
 * const user = createInstance(User, "김철수", 25, "kim@example.com");
 * ```
 */
export type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

/**
 * 생성자 함수로부터 인스턴스 타입을 추출하는 유틸리티 타입
 *
 * 클래스나 생성자 함수에서 생성되는 인스턴스의 타입을 추출합니다.
 * 팩토리 패턴이나 타입 추론에서 유용합니다.
 *
 * @template T - 생성자 함수 타입
 *
 * @example
 * ```typescript
 * class DatabaseConnection {
 *   constructor(private url: string) {}
 *
 *   connect(): void {
 *     console.log(`${this.url}에 연결 중...`);
 *   }
 * }
 *
 * type Connection = InstanceType<typeof DatabaseConnection>;
 * // 결과: DatabaseConnection
 *
 * // 팩토리에서 사용
 * function createConnection(url: string): Connection {
 *   return new DatabaseConnection(url);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 제네릭 컨테이너
 * function createContainer<T extends new (...args: any[]) => any>(
 *   constructor: T
 * ): { instance: InstanceType<T>; create: (...args: ConstructorParameters<T>) => InstanceType<T> } {
 *   return {
 *     instance: null as any,
 *     create: (...args) => new constructor(...args)
 *   };
 * }
 * ```
 */
export type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;

/**
 * 동기 함수를 비동기 함수로 변환하는 유틸리티 타입
 *
 * 함수의 반환 타입을 Promise로 감싸서 비동기 버전의 함수 타입을 생성합니다.
 * API 래퍼나 비동기 변환에서 유용합니다.
 *
 * @template T - 변환할 함수 타입
 *
 * @example
 * ```typescript
 * function calculateSum(a: number, b: number): number {
 *   return a + b;
 * }
 *
 * type AsyncCalculateSum = Promisify<typeof calculateSum>;
 * // 결과: (a: number, b: number) => Promise<number>
 *
 * const asyncCalculateSum: AsyncCalculateSum = async (a, b) => {
 *   // 비동기 처리 시뮬레이션
 *   await new Promise(resolve => setTimeout(resolve, 100));
 *   return a + b;
 * };
 *
 * // 사용 예시
 * asyncCalculateSum(5, 3).then(result => {
 *   console.log("결과:", result); // 8
 * });
 * ```
 *
 * @example
 * ```typescript
 * // 동기 API를 비동기로 변환
 * function readFileSync(path: string): string {
 *   // 동기 파일 읽기
 *   return "file content";
 * }
 *
 * type AsyncReadFile = Promisify<typeof readFileSync>;
 * const readFileAsync: AsyncReadFile = async (path) => {
 *   return new Promise(resolve => {
 *     setTimeout(() => resolve("file content"), 1000);
 *   });
 * };
 * ```
 */
export type Promisify<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => infer R
  ? (...args: P) => Promise<R>
  : never;

/**
 * Promise를 반환하는 함수를 동기 함수로 변환하는 유틸리티 타입
 *
 * 비동기 함수의 Promise 래퍼를 제거하여 동기 버전의 함수 타입을 생성합니다.
 * 타입 변환이나 동기 버전 인터페이스 정의에서 유용합니다.
 *
 * @template T - 변환할 비동기 함수 타입
 *
 * @example
 * ```typescript
 * async function fetchUserData(id: string): Promise<{ name: string; email: string }> {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * }
 *
 * type SyncFetchUserData = Unpromisify<typeof fetchUserData>;
 * // 결과: (id: string) => { name: string; email: string }
 *
 * // 동기 버전 구현 (예: 캐시에서 읽기)
 * const syncFetchUserData: SyncFetchUserData = (id) => {
 *   // 캐시에서 동기적으로 데이터 반환
 *   return { name: "홍길동", email: "hong@example.com" };
 * };
 * ```
 *
 * @example
 * ```typescript
 * // 비동기 API의 동기 인터페이스 정의
 * type AsyncApiCall = (endpoint: string, data: any) => Promise<Response>;
 * type SyncApiCall = Unpromisify<AsyncApiCall>;
 * // 결과: (endpoint: string, data: any) => Response
 *
 * // 테스트용 동기 구현
 * const mockApiCall: SyncApiCall = (endpoint, data) => {
 *   return new Response(JSON.stringify({ success: true }));
 * };
 * ```
 */
export type Unpromisify<T extends (...args: any) => Promise<any>> = T extends (
  ...args: infer P
) => Promise<infer R>
  ? (...args: P) => R
  : never;
