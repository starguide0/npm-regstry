/**
 * 객체 조작을 위한 깊은 유틸리티 타입들
 *
 * 이 모듈은 TypeScript에서 제공하지 않는 고급 객체 타입 조작 유틸리티들을 제공합니다.
 * 중첩된 객체의 속성을 재귀적으로 변경하거나, 특정 조건에 따라 속성을 선택/제외할 수 있습니다.
 */

/**
 * 타입 T의 모든 속성을 재귀적으로 선택적(optional)으로 만드는 유틸리티 타입
 *
 * 중첩된 객체의 모든 레벨에서 속성들을 선택적으로 변경합니다.
 * 부분 업데이트나 설정 객체에서 유용합니다.
 *
 * @template T - 변환할 객체 타입
 *
 * @example
 * ```typescript
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
 * // 결과: {
 * //   name?: string;
 * //   profile?: {
 * //     age?: number;
 * //     address?: {
 * //       city?: string;
 * //       zipCode?: string;
 * //     };
 * //   };
 * // }
 *
 * const updateUser: PartialUser = {
 *   profile: {
 *     address: {
 *       city: "서울"
 *     }
 *   }
 * };
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 타입 T의 모든 속성을 재귀적으로 필수(required)로 만드는 유틸리티 타입
 *
 * 중첩된 객체의 모든 레벨에서 선택적 속성들을 필수로 변경합니다.
 * API 응답 검증이나 완전한 객체가 필요한 경우에 유용합니다.
 *
 * @template T - 변환할 객체 타입
 *
 * @example
 * ```typescript
 * interface PartialConfig {
 *   database?: {
 *     host?: string;
 *     port?: number;
 *     credentials?: {
 *       username?: string;
 *       password?: string;
 *     };
 *   };
 * }
 *
 * type RequiredConfig = DeepRequired<PartialConfig>;
 * // 결과: {
 * //   database: {
 * //     host: string;
 * //     port: number;
 * //     credentials: {
 * //       username: string;
 * //       password: string;
 * //     };
 * //   };
 * // }
 * ```
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 타입 T의 모든 속성을 재귀적으로 읽기 전용(readonly)으로 만드는 유틸리티 타입
 *
 * 중첩된 객체의 모든 레벨에서 속성들을 불변으로 만듭니다.
 * 불변 데이터 구조나 상태 관리에서 유용합니다.
 *
 * @template T - 변환할 객체 타입
 *
 * @example
 * ```typescript
 * interface MutableState {
 *   user: {
 *     name: string;
 *     settings: {
 *       theme: string;
 *       notifications: boolean;
 *     };
 *   };
 * }
 *
 * type ImmutableState = DeepReadonly<MutableState>;
 * // 결과: {
 * //   readonly user: {
 * //     readonly name: string;
 * //     readonly settings: {
 * //       readonly theme: string;
 * //       readonly notifications: boolean;
 * //     };
 * //   };
 * // }
 *
 * const state: ImmutableState = {
 *   user: {
 *     name: "홍길동",
 *     settings: {
 *       theme: "dark",
 *       notifications: true
 *     }
 *   }
 * };
 * // state.user.name = "김철수"; // 컴파일 에러!
 * ```
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 타입 T의 모든 속성을 재귀적으로 변경 가능(mutable)하게 만드는 유틸리티 타입
 *
 * 중첩된 객체의 모든 레벨에서 readonly 속성들을 제거합니다.
 * 읽기 전용 타입을 편집 가능한 형태로 변환할 때 유용합니다.
 *
 * @template T - 변환할 객체 타입
 *
 * @example
 * ```typescript
 * interface ReadonlyConfig {
 *   readonly server: {
 *     readonly host: string;
 *     readonly port: number;
 *     readonly ssl: {
 *       readonly enabled: boolean;
 *       readonly cert: string;
 *     };
 *   };
 * }
 *
 * type MutableConfig = DeepMutable<ReadonlyConfig>;
 * // 결과: {
 * //   server: {
 * //     host: string;
 * //     port: number;
 * //     ssl: {
 * //       enabled: boolean;
 * //       cert: string;
 * //     };
 * //   };
 * // }
 * ```
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

/**
 * 타입 T에서 값이 타입 U에 할당 가능한 속성들만 선택하는 유틸리티 타입
 *
 * 특정 타입의 속성들만 필터링하여 새로운 타입을 생성합니다.
 * 타입별로 속성을 그룹화하거나 특정 타입의 속성만 추출할 때 유용합니다.
 *
 * @template T - 원본 객체 타입
 * @template U - 선택할 속성 값의 타입
 *
 * @example
 * ```typescript
 * interface Mixed {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 *   count: number;
 *   description: string;
 * }
 *
 * type StringProps = PickByType<Mixed, string>;
 * // 결과: {
 * //   name: string;
 * //   description: string;
 * // }
 *
 * type NumberProps = PickByType<Mixed, number>;
 * // 결과: {
 * //   age: number;
 * //   count: number;
 * // }
 * ```
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * 타입 T에서 값이 타입 U에 할당 가능한 속성들을 제외하는 유틸리티 타입
 *
 * 특정 타입의 속성들을 제외하여 새로운 타입을 생성합니다.
 * 불필요한 타입의 속성을 제거하거나 필터링할 때 유용합니다.
 *
 * @template T - 원본 객체 타입
 * @template U - 제외할 속성 값의 타입
 *
 * @example
 * ```typescript
 * interface ApiResponse {
 *   data: object;
 *   status: number;
 *   message: string;
 *   timestamp: Date;
 *   isSuccess: boolean;
 * }
 *
 * type WithoutFunctions = OmitByType<ApiResponse, Function>;
 * // 결과: {
 * //   data: object;
 * //   status: number;
 * //   message: string;
 * //   timestamp: Date;
 * //   isSuccess: boolean;
 * // }
 *
 * type WithoutObjects = OmitByType<ApiResponse, object>;
 * // 결과: {
 * //   status: number;
 * //   message: string;
 * //   isSuccess: boolean;
 * // }
 * ```
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * 타입 T에서 값이 타입 U에 할당 가능한 속성들의 키만 추출하는 유틸리티 타입
 *
 * 특정 타입을 가진 속성들의 키 이름만 유니온 타입으로 반환합니다.
 * 동적으로 속성에 접근하거나 키를 기반으로 작업할 때 유용합니다.
 *
 * @template T - 원본 객체 타입
 * @template U - 찾을 속성 값의 타입
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   age: number;
 *   isActive: boolean;
 * }
 *
 * type StringKeys = KeysOfType<User, string>;
 * // 결과: "name" | "email"
 *
 * type NumberKeys = KeysOfType<User, number>;
 * // 결과: "id" | "age"
 *
 * // 사용 예시
 * function getStringProperty(user: User, key: StringKeys): string {
 *   return user[key]; // 타입 안전함
 * }
 * ```
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * 타입 T에서 특정 속성들 K를 선택적(optional)으로 만드는 유틸리티 타입
 *
 * 지정된 속성들만 선택적으로 변경하고 나머지는 그대로 유지합니다.
 * 부분 업데이트나 선택적 필드가 있는 폼에서 유용합니다.
 *
 * @template T - 원본 객체 타입
 * @template K - 선택적으로 만들 속성 키들
 *
 * @example
 * ```typescript
 * interface CreateUser {
 *   name: string;
 *   email: string;
 *   age: number;
 *   phone: string;
 * }
 *
 * type UpdateUser = PartialBy<CreateUser, 'age' | 'phone'>;
 * // 결과: {
 * //   name: string;
 * //   email: string;
 * //   age?: number;
 * //   phone?: string;
 * // }
 *
 * const updateData: UpdateUser = {
 *   name: "홍길동",
 *   email: "hong@example.com"
 *   // age와 phone은 선택적
 * };
 * ```
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 타입 T에서 특정 속성들 K를 필수(required)로 만드는 유틸리티 타입
 *
 * 지정된 속성들만 필수로 변경하고 나머지는 그대로 유지합니다.
 * 선택적 속성이 많은 타입에서 특정 필드만 필수로 만들 때 유용합니다.
 *
 * @template T - 원본 객체 타입
 * @template K - 필수로 만들 속성 키들
 *
 * @example
 * ```typescript
 * interface PartialUser {
 *   name?: string;
 *   email?: string;
 *   age?: number;
 *   phone?: string;
 * }
 *
 * type UserWithRequiredContact = RequiredBy<PartialUser, 'name' | 'email'>;
 * // 결과: {
 * //   name: string;
 * //   email: string;
 * //   age?: number;
 * //   phone?: string;
 * // }
 *
 * const user: UserWithRequiredContact = {
 *   name: "김철수", // 필수
 *   email: "kim@example.com", // 필수
 *   // age와 phone은 여전히 선택적
 * };
 * ```
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * 중첩된 객체 타입을 평면화(flatten)하는 유틸리티 타입
 *
 * 복잡한 교차 타입이나 조건부 타입을 단순한 객체 타입으로 변환합니다.
 * IDE에서 타입 정보를 더 명확하게 표시하고 디버깅을 용이하게 합니다.
 *
 * @template T - 평면화할 객체 타입
 *
 * @example
 * ```typescript
 * type BaseUser = {
 *   id: number;
 *   name: string;
 * };
 *
 * type UserPermissions = {
 *   canRead: boolean;
 *   canWrite: boolean;
 * };
 *
 * type ComplexUser = BaseUser & UserPermissions & {
 *   email: string;
 * };
 *
 * type FlatUser = Flatten<ComplexUser>;
 * // 결과: {
 * //   id: number;
 * //   name: string;
 * //   canRead: boolean;
 * //   canWrite: boolean;
 * //   email: string;
 * // }
 * ```
 */
export type Flatten<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: O[K] }
    : never
  : T;
