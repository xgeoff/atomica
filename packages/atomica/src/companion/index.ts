import { context } from '../../../dom/src/index.ts';
import { resource, signal, type Resource, type Signal } from '../../../signals/src/index.ts';

// PUBLIC API — v0.2 LOCKED

export type Channel<T> = {
  publish(payload: T): void;
  subscribe(fn: (payload: T) => void): () => void;
  last(): T | undefined;
};

export function createChannel<T>(): Channel<T> {
  const state = signal<T | undefined>(undefined);
  const subscribers = new Set<(payload: T) => void>();

  const publish = (payload: T) => {
    state.set(payload);
    subscribers.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    });
  };

  const subscribe = (fn: (payload: T) => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  const last = () => state.peek();

  return { publish, subscribe, last };
}

export type ServiceResponse<T> = {
  resource: Resource<T>;
  channel: Channel<T>;
};

export type ServiceOptions = {
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export function createService(options: ServiceOptions = {}) {
  const fetcher = options.fetcher ?? fetch;
  const base = options.baseUrl ?? '';

  const call = <T>(method: 'GET' | 'POST', path: string, body?: unknown, auto = true): ServiceResponse<T> => {
    const channel = createChannel<T>();
    const res = resource<T>(
      async () => {
        const url = `${base}${path}`;
        const init: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        if (body !== undefined) {
          init.body = JSON.stringify(body);
        }
        const resp = await fetcher(url, init);
        if (!resp.ok) {
          throw new Error(`Request failed: ${resp.status}`);
        }
        const data = (await resp.json()) as T;
        channel.publish(data);
        return data;
      },
      { auto }
    );
    return { resource: res, channel };
  };

  return {
    get: <T>(path: string, auto = true) => call<T>('GET', path, undefined, auto),
    post: <T>(path: string, body: unknown, auto = true) => call<T>('POST', path, body, auto)
  };
}

const componentRegistry = signal<Set<string>>(new Set());

export function registerComponent(name: string): void {
  const next = new Set(componentRegistry.peek());
  next.add(name);
  componentRegistry.set(next);
}

export function listComponents(): string[] {
  return Array.from(componentRegistry.get());
}

export function useComponentRegistry(): Signal<Set<string>> {
  return componentRegistry;
}

// Optional context helpers for channels and services
export function createChannelContext<T>() {
  const ChannelCtx = context<Channel<T> | null>(null);
  const Provider = (channel: Channel<T>, fn: () => any) => ChannelCtx.provide(channel, fn);
  const useChannel = () => ChannelCtx.use();
  return { Provider, useChannel };
}

export function createServiceContext(service: ReturnType<typeof createService>) {
  const ServiceCtx = context<typeof service | null>(null);
  const Provider = (fn: () => any) => ServiceCtx.provide(service, fn);
  const useService = () => ServiceCtx.use();
  return { Provider, useService };
}
