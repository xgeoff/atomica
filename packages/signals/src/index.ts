import { __DEV__, Disposer, devWarn, isFunction } from '@atomica/shared';

export interface ReadonlySignal<T> {
  get(): T;
  peek(): T;
}

export interface Signal<T> extends ReadonlySignal<T> {
  set(next: T | ((prev: T) => T)): void;
}

type Dep = SignalNode<any> | ComputedNode<any>;
type Observer = ComputedNode<any> | EffectNode;

interface SignalNode<T> {
  value: T;
  subscribers: Set<Observer>;
}

interface ComputedNode<T> {
  type: 'computed';
  value: T;
  fn: () => T;
  dirty: boolean;
  evaluating: boolean;
  deps: Set<Dep>;
  subscribers: Set<Observer>;
  cleanup?: Disposer;
}

interface EffectNode {
  type: 'effect';
  fn: () => void | Disposer;
  deps: Set<Dep>;
  cleanup?: Disposer;
  queued: boolean;
  disposed: boolean;
}

let currentObserver: Observer | null = null;
let batchDepth = 0;
let flushScheduled = false;
let flushing = false;
const effectQueue: EffectNode[] = [];

const queueMicro =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (fn: () => void) => Promise.resolve().then(fn);

function addDependency(dep: Dep, observer: Observer): void {
  if (dep.subscribers.has(observer)) {
    return;
  }
  dep.subscribers.add(observer);
  observer.deps.add(dep);
}

function cleanupObserver(observer: Observer): void {
  observer.deps.forEach((dep) => {
    dep.subscribers.delete(observer);
  });
  observer.deps.clear();
}

function markDirty(dep: Dep): void {
  dep.subscribers.forEach((observer) => {
    if (observer.type === 'computed') {
      if (observer.dirty) {
        return;
      }
      observer.dirty = true;
      markDirty(observer);
    } else {
      scheduleEffect(observer);
    }
  });
}

function scheduleEffect(effect: EffectNode): void {
  if (effect.disposed || effect.queued) {
    return;
  }
  effect.queued = true;
  effectQueue.push(effect);
  if (batchDepth === 0 && !flushScheduled) {
    flushScheduled = true;
    queueMicro(flushEffects);
  }
}

function flushEffects(): void {
  if (flushing) return;
  flushScheduled = false;
  flushing = true;
  try {
    while (effectQueue.length) {
      const effect = effectQueue.shift()!;
      effect.queued = false;
      runEffect(effect);
    }
  } finally {
    flushing = false;
  }
}

function runEffect(node: EffectNode): void {
  if (node.disposed) {
    return;
  }
  cleanupObserver(node);
  if (node.cleanup) {
    node.cleanup();
    node.cleanup = undefined;
  }
  const prevObserver = currentObserver;
  currentObserver = node;
  try {
    const cleanup = node.fn();
    if (isFunction(cleanup)) {
      node.cleanup = cleanup as Disposer;
    }
  } catch (err) {
    if (__DEV__) {
      devWarn(`effect execution threw: ${err instanceof Error ? err.message : String(err)}`);
    }
    throw err;
  } finally {
    currentObserver = prevObserver;
  }
}

function evaluateComputed<T>(node: ComputedNode<T>): T {
  if (!node.dirty) {
    return node.value;
  }
  if (node.evaluating) {
    throw new Error('[atomica] Cyclic computed evaluation detected');
  }
  node.evaluating = true;
  cleanupObserver(node);
  if (node.cleanup) {
    node.cleanup();
    node.cleanup = undefined;
  }
  const prevObserver = currentObserver;
  currentObserver = node;
  try {
    const next = node.fn();
    node.value = next;
    node.dirty = false;
    return next;
  } finally {
    node.evaluating = false;
    currentObserver = prevObserver;
  }
}

export function signal<T>(initial: T): Signal<T> {
  const node: SignalNode<T> = {
    value: initial,
    subscribers: new Set()
  };

  return {
    get() {
      if (currentObserver) {
        addDependency(node, currentObserver);
      }
      return node.value;
    },
    peek() {
      return node.value;
    },
    set(next) {
      const value = isFunction(next) ? (next as (prev: T) => T)(node.value) : next;
      if (Object.is(value, node.value)) {
        return;
      }
      node.value = value;
      markDirty(node);
      if (batchDepth === 0) {
        flushEffects();
      }
    }
  };
}

export function computed<T>(fn: () => T): ReadonlySignal<T> {
  const node: ComputedNode<T> = {
    type: 'computed',
    value: undefined as any,
    fn,
    dirty: true,
    evaluating: false,
    deps: new Set(),
    subscribers: new Set()
  };

  const api: ReadonlySignal<T> = {
    get() {
      const value = evaluateComputed(node);
      if (currentObserver) {
        addDependency(node, currentObserver);
      }
      return value;
    },
    peek() {
      const prev = currentObserver;
      currentObserver = null;
      try {
        return evaluateComputed(node);
      } finally {
        currentObserver = prev;
      }
    }
  };

  return api;
}

export function effect(fn: () => void | Disposer): () => void {
  const node: EffectNode = {
    type: 'effect',
    fn,
    deps: new Set(),
    queued: false,
    disposed: false
  };

  const disposer = () => {
    if (node.disposed) return;
    node.disposed = true;
    cleanupObserver(node);
    if (node.cleanup) {
      node.cleanup();
      node.cleanup = undefined;
    }
  };

  runEffect(node);

  return disposer;
}

export function batch(fn: () => void): void {
  batchDepth += 1;
  try {
    fn();
  } finally {
    batchDepth -= 1;
    if (batchDepth === 0) {
      flushEffects();
    }
  }
}

export function untrack<T>(fn: () => T): T {
  const prev = currentObserver;
  currentObserver = null;
  try {
    return fn();
  } finally {
    currentObserver = prev;
  }
}

export type { Dep as Node, SignalNode, ComputedNode, EffectNode };
