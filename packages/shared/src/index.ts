export type Disposer = () => void;
export type MaybeArray<T> = T | T[];

export const __DEV__ =
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  process.env.NODE_ENV !== 'production';

export function devWarn(message: string): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`[atomica] ${message}`);
  }
}

export function invariant(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[atomica] ${message}`);
  }
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function runDisposers(disposers: Disposer[]): void {
  for (let i = disposers.length - 1; i >= 0; i -= 1) {
    const dispose = disposers[i];
    try {
      dispose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}
