# @starguide0/react-hooks

React 애플리케이션에서 사용할 수 있는 공유 React 훅 라이브러리입니다.

## 설치

```bash
npm install @starguide0/react-hooks
```

또는

```bash
pnpm add @starguide0/react-hooks
```

## 제공 훅

- useInstance: 객체 인스턴스를 생명주기 동안 유지하고, 필요 시 리렌더 트리거를 제공하는 훅
- useSignal: Proxy 기반으로 속성 대입만으로 리렌더링을 유도하는 반응형 상태 훅
- createSafeContext: Provider 외부 사용 시 친절한 오류를 던지는 안전한 Context 생성 유틸리티

## 사용법

### useInstance

컴포넌트 생명주기 동안 단일 인스턴스를 유지하고, 리렌더링을 강제로 일으킬 수 있는 트리거 함수를 함께 제공합니다. 초기화 함수는 최초 1회만 실행됩니다.

반환 형태: [instance, trigger]

#### 기본 사용법

```tsx
import { useInstance } from '@starguide0/react-hooks';

const MyComponent = () => {
  const [obj, trigger] = useInstance(() => ({ count: 0 }));

  const inc = () => {
    obj.count += 1; // 변경 후
    trigger();      // 리렌더링 트리거
  };

  return <button onClick={inc}>카운트: {obj.count}</button>;
};
```

#### 클래스/맵 등 인스턴스 유지

```tsx
import { useInstance } from '@starguide0/react-hooks';

class Store { count = 0; inc(){ this.count += 1; } }

const CacheComponent = () => {
  const [store, trigger] = useInstance(() => new Store());

  const onClick = () => { store.inc(); trigger(); };

  return <button onClick={onClick}>카운트: {store.count}</button>;
};
```

주의사항:
- 초기화 함수는 반드시 "객체"를 반환해야 합니다. 원시값을 반환하면 오류가 발생합니다.
- 인스턴스의 속성을 변경한 뒤에는 리렌더링을 위해 trigger를 호출하세요.

### useSignal

Proxy 기반으로 반환 객체의 속성을 변경하면 자동으로 리렌더링되는 훅입니다. 얕은(shallow) 변경만 감지합니다.

```tsx
import { useSignal } from '@starguide0/react-hooks';

export function Counter() {
  const state = useSignal(() => ({ count: 0, label: 'Clicks' }));

  const inc = () => { state.count += 1; };
  const rename = () => { state.label = `Clicks (${state.count})`; };

  return (
    <div>
      <p>{state.label}: {state.count}</p>
      <button onClick={inc}>+1</button>
      <button onClick={rename}>rename</button>
    </div>
  );
}
```

주의사항:
- 반환된 객체 자체를 재할당하지 마세요. 속성만 변경하세요. (state = {...} 금지)
- 얕은 비교만 수행하므로, 중첩 객체 내부 변경은 감지되지 않을 수 있습니다. 이 경우 새 참조로 교체하세요.

중첩 객체 교체 예시:

```ts
const user = useSignal(() => ({ name: 'Ann', meta: { likes: 0 } }));
user.meta = { ...user.meta, likes: user.meta.likes + 1 };
```

### createSafeContext

Provider 외부에서 사용하면 명확한 오류를 던지는 안전한 Context 생성 도우미입니다.

```tsx
import { createSafeContext } from '@starguide0/react-hooks';

type Theme = 'light' | 'dark';
const [ThemeProvider, useTheme] = createSafeContext<Theme>();

function App() {
  return (
    <ThemeProvider value={'light'}>
      <Page />
    </ThemeProvider>
  );
}

function Page() {
  const theme = useTheme('ThemeContext'); // displayName 설정 가능
  return <div>theme: {theme}</div>;
}
```

오류 메시지:
- Provider 없이 훅을 호출하면 "Context must be used within its Provider" 에러가 발생합니다.

## API 참조

### useInstance<T>(init: () => T): [T, (updater?: (prev: T) => void) => void]
- init: 최초 1회만 호출되는 초기화 함수. 반드시 객체 반환.
- 반환: [instance, trigger]

### useSignal<T extends Record<string, unknown>>(init: () => T): T
- init: 최초 1회만 호출되는 초기화 함수. 객체 반환.
- 반환: Proxy로 감싸진 반응형 객체. 속성 대입 시 리렌더링.

### createSafeContext<T>(): [Provider: React.Provider<T>, useSafeContext: (displayName?: string) => T]
- Provider: React Context Provider 컴포넌트
- useSafeContext: Provider 외부 사용 시 에러를 던지는 훅 (displayName 설정 가능)

## 개발

```bash
# 개발 모드로 빌드 (watch 모드)
pnpm dev

# 프로덕션 빌드
pnpm build

# 테스트 실행
pnpm test

# 린트 검사
pnpm lint
```

## 라이선스

ISC
