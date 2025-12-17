import { describe, expect, it, vi } from 'vitest';
import { resource, signal, untrack } from './index';

const flush = () => Promise.resolve();

describe('resource', () => {
  it('initial state is idle and respects initialData', () => {
    const r1 = resource(async () => 'x');
    expect(r1.state()).toBe('idle');
    expect(r1.data()).toBeUndefined();

    const r2 = resource(async () => 'x', { initialData: 'seed' });
    expect(r2.state()).toBe('success');
    expect(r2.data()).toBe('seed');
  });

  it('handles success path and onSuccess', async () => {
    const onSuccess = vi.fn();
    const r = resource(async () => 'done', { onSuccess });

    const promise = r.refresh();
    expect(r.loading()).toBe(true);
    await promise;
    expect(r.loading()).toBe(false);
    expect(r.state()).toBe('success');
    expect(r.data()).toBe('done');
    expect(onSuccess).toHaveBeenCalledWith('done');
  });

  it('handles error path and keeps previous data by default', async () => {
    let fail = true;
    const r = resource(async () => {
      if (fail) throw new Error('boom');
      return 42;
    });

    await r.refresh();
    expect(r.state()).toBe('error');
    expect(r.error()).toBeInstanceOf(Error);
    expect(r.data()).toBeUndefined();

    fail = false;
    await r.refresh();
    expect(r.state()).toBe('success');
    expect(r.data()).toBe(42);
    expect(r.error()).toBeUndefined();
  });

  it('commits only the latest refresh when earlier promises resolve later', async () => {
    let resolveFirst: (v: number) => void = () => {};
    let resolveSecond: (v: number) => void = () => {};
    const producer = vi
      .fn<[], Promise<number>>()
      .mockImplementationOnce(
        () =>
          new Promise((res) => {
            resolveFirst = res;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((res) => {
            resolveSecond = res;
          })
      );

    const r = resource(producer);

    const p1 = r.refresh();
    const p2 = r.refresh();

    resolveSecond(2);
    await p2;
    resolveFirst(1);
    await p1;

    expect(r.data()).toBe(2);
    expect(r.state()).toBe('success');
    expect(producer).toHaveBeenCalledTimes(2);
  });

  it('mutate sets data and clears error/loading', () => {
    const r = resource(async () => 1);
    r.mutate(5);
    expect(r.data()).toBe(5);
    expect(r.loading()).toBe(false);
    expect(r.error()).toBeUndefined();
    expect(r.state()).toBe('success');
  });

  it('auto mode refreshes when dependencies change', async () => {
    const dep = signal(1);
    const runs: number[] = [];
    const r = resource(
      async () => {
        const value = dep.get();
        runs.push(value);
        return value * 2;
      },
      { auto: true }
    );

    await flush();
    expect(runs).toEqual([1]);
    expect(r.data()).toBe(2);

    dep.set(2);
    await flush();
    expect(runs).toEqual([1, 2]);
    expect(r.data()).toBe(4);
  });

  it('auto mode does not track async-only reads', async () => {
    const dep = signal(1);
    const runs: number[] = [];
    const r = resource(
      async () => {
        await flush();
        runs.push(dep.get());
        return dep.get();
      },
      { auto: true }
    );

    await flush();
    expect(runs).toEqual([1]);

    dep.set(2);
    await flush();
    expect(runs).toEqual([1]); // no re-run because dep read after await
  });

  it('auto mode initial run occurs once when no dependencies', async () => {
    const runs: number[] = [];
    const r = resource(
      async () => {
        runs.push(1);
        return 'ok';
      },
      { auto: true }
    );
    await flush();
    expect(runs).toEqual([1]);
    await flush();
    expect(runs).toEqual([1]);
    expect(r.data()).toBe('ok');
  });

  it('auto mode can be disposed to stop future refreshes', async () => {
    const dep = signal(1);
    const runs: number[] = [];
    const r = resource(
      async () => {
        runs.push(dep.get());
        return dep.get();
      },
      { auto: true }
    );
    await flush();
    expect(runs).toEqual([1]);
    r.dispose();
    dep.set(2);
    await flush();
    expect(runs).toEqual([1]);
  });

  it('auto mode does not loop on internal state updates', async () => {
    const dep = signal(1);
    const calls: number[] = [];
    const r = resource(
      async () => {
        calls.push(dep.get());
        return 'v';
      },
      { auto: true }
    );
    await flush();
    expect(calls).toEqual([1]);
    expect(r.loading()).toBe(false);
  });

  it('dispose aborts pending work and prevents commits', async () => {
    let resolveFn: (v: string) => void = () => {};
    const producer = vi.fn(() => new Promise<string>((res) => (resolveFn = res)));
    const r = resource(producer);
    const promise = r.refresh();
    r.dispose();
    resolveFn('late');
    await promise;
    expect(r.data()).toBeUndefined();
    expect(r.state()).toBe('idle');
    expect(r.loading()).toBe(false);
  });
});
