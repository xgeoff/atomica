import { __DEV__, invariant } from '@atomica/shared';

// PUBLIC API — v0.2 LOCKED
export interface Context<T> {
  use(): T;
  provide<R>(value: T, fn: () => R): R;
}

export interface ContextOptions {
  strict?: boolean;
}

export function context<T>(defaultValue: T, options: ContextOptions = {}): Context<T> {
  const stack: T[] = [];
  const { strict = false } = options;

  const use = (): T => {
    if (stack.length > 0) {
      return stack[stack.length - 1];
    }
    if (strict) {
      invariant(false, 'No provider found for strict context');
    }
    return defaultValue;
  };

  const provide = <R>(value: T, fn: () => R): R => {
    stack.push(value);
    try {
      const result = fn();
      if (__DEV__ && result instanceof Promise) {
        throw new Error(
          '[atomica] Context providers must be synchronous; async providers are not supported.'
        );
      }
      return result;
    } finally {
      stack.pop();
    }
  };

  return { use, provide };
}
