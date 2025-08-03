import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sleep } from './sleep';

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('지정된 시간만큼 대기해야 한다', async () => {
    const sleepPromise = sleep(1000);

    // 타이머를 1000ms 진행
    vi.advanceTimersByTime(1000);

    await sleepPromise;

    // Promise가 해결되었는지 확인
    await expect(sleepPromise).resolves.toBeUndefined();
  });

  it('0ms 대기 시 즉시 완료되어야 한다', async () => {
    const sleepPromise = sleep(0);

    // 타이머를 진행하지 않아도 즉시 완료되어야 함
    vi.advanceTimersByTime(0);

    await sleepPromise;

    await expect(sleepPromise).resolves.toBeUndefined();
  });

  it('여러 sleep 호출이 독립적으로 작동해야 한다', async () => {
    const sleep1 = sleep(500);
    const sleep2 = sleep(1000);
    const sleep3 = sleep(1500);

    // 500ms 진행 - sleep1만 완료
    vi.advanceTimersByTime(500);
    await expect(sleep1).resolves.toBeUndefined();

    // 추가 500ms 진행 (총 1000ms) - sleep2 완료
    vi.advanceTimersByTime(500);
    await expect(sleep2).resolves.toBeUndefined();

    // 추가 500ms 진행 (총 1500ms) - sleep3 완료
    vi.advanceTimersByTime(500);
    await expect(sleep3).resolves.toBeUndefined();
  });

  it('Promise 체이닝과 함께 작동해야 한다', async () => {
    let executed = false;

    const chainPromise = sleep(100).then(() => {
      executed = true;
      return 'completed';
    });

    // 아직 실행되지 않았어야 함
    expect(executed).toBe(false);

    // 타이머 진행
    vi.advanceTimersByTime(100);

    const result = await chainPromise;
    expect(executed).toBe(true);
    expect(result).toBe('completed');
  });

  it('async/await와 함께 작동해야 한다', async () => {
    let step = 0;

    const asyncFunction = async () => {
      step = 1;
      await sleep(200);
      step = 2;
      await sleep(300);
      step = 3;
      return step;
    };

    const resultPromise = asyncFunction();

    // 첫 번째 단계
    expect(step).toBe(1);

    // 200ms 진행하고 대기
    vi.advanceTimersByTime(200);
    await vi.runAllTimersAsync();
    expect(step).toBe(2);

    // 추가 300ms 진행하고 완료 대기
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    const result = await resultPromise;
    expect(step).toBe(3);
    expect(result).toBe(3);
  });

  it('음수 값으로 호출 시에도 작동해야 한다', async () => {
    // 음수 값은 setTimeout에서 0으로 처리됨
    const sleepPromise = sleep(-100);

    vi.advanceTimersByTime(0);

    await expect(sleepPromise).resolves.toBeUndefined();
  });

  it('매우 큰 값으로 호출 시에도 작동해야 한다', async () => {
    const sleepPromise = sleep(Number.MAX_SAFE_INTEGER);

    // 실제로는 매우 오래 걸리지만 테스트에서는 타이머를 조작
    vi.advanceTimersByTime(Number.MAX_SAFE_INTEGER);

    await expect(sleepPromise).resolves.toBeUndefined();
  });

  it('소수점 값으로 호출 시에도 작동해야 한다', async () => {
    const sleepPromise = sleep(100.5);

    // setTimeout은 소수점을 정수로 변환
    vi.advanceTimersByTime(100);

    await expect(sleepPromise).resolves.toBeUndefined();
  });
});

// 실제 타이머를 사용한 통합 테스트
describe('sleep (실제 타이머)', () => {
  it('실제 환경에서 짧은 시간 대기가 작동해야 한다', async () => {
    const startTime = Date.now();

    await sleep(50); // 50ms 대기

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // 50ms 이상 경과했는지 확인 (약간의 여유 허용)
    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(200); // 너무 오래 걸리지 않았는지 확인
  });

  it('연속된 sleep 호출이 순차적으로 실행되어야 한다', async () => {
    const startTime = Date.now();
    const results: number[] = [];

    await sleep(20);
    results.push(Date.now() - startTime);

    await sleep(30);
    results.push(Date.now() - startTime);

    await sleep(25);
    results.push(Date.now() - startTime);

    // 각 단계가 순차적으로 증가하는지 확인
    expect(results[0]).toBeGreaterThanOrEqual(15);
    expect(results[1]).toBeGreaterThanOrEqual(results[0] + 25);
    expect(results[2]).toBeGreaterThanOrEqual(results[1] + 20);
  });
});
