import { describe, expect, it, vi } from 'vitest';
import { batch, computed, effect, signal, untrack } from './index';

describe('signals core', () => {
  it('reads and writes signals', () => {
    const count = signal(1);
    expect(count.get()).toBe(1);
    count.set(2);
    expect(count.get()).toBe(2);
    count.set((prev) => prev + 3);
    expect(count.peek()).toBe(5);
  });

  it('computes lazily and caches until dirty', () => {
    const base = signal(2);
    const spy = vi.fn(() => base.get() * 2);
    const doubled = computed(spy);

    expect(spy).not.toHaveBeenCalled();
    expect(doubled.get()).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(doubled.get()).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);

    base.set(3);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(doubled.get()).toBe(6);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('runs effects with cleanup and disposes', () => {
    const count = signal(0);
    const cleanup = vi.fn();
    const runs: number[] = [];

    const dispose = effect(() => {
      runs.push(count.get());
      return cleanup;
    });

    count.set(1);
    expect(runs).toEqual([0, 1]);
    expect(cleanup).toHaveBeenCalledTimes(1);

    dispose();
    count.set(2);
    expect(runs).toEqual([0, 1]);
  });

  it('batches updates to run effects once', () => {
    const count = signal(0);
    let runs = 0;

    effect(() => {
      count.get();
      runs += 1;
    });

    batch(() => {
      count.set(1);
      count.set(2);
    });

    expect(runs).toBe(2); // initial + one flush after batch
  });

  it('supports untrack to skip dependency collection', () => {
    const count = signal(1);
    let runs = 0;

    effect(() => {
      runs += 1;
      untrack(() => count.get());
    });

    count.set(2);
    expect(runs).toBe(1);
  });
});
