# Companion (Optional)

Companion is a tiny, opt-in helper layer built on Atomica primitives. It does not add new semantics; it packages a few common patterns: channels, a service wrapper over `resource()`, and a component registry for diagnostics or debug UI.

If you use it, you can import from the root to keep a single instance:
```ts
import { createChannel, createService, registerComponent } from 'atomica';
```

## Channels
Channels are explicit fan-out. They publish data to any number of subscribers.
```ts
import { createChannel } from 'atomica';

const channel = createChannel<{ value: number }>();

const unsubscribe = channel.subscribe((payload) => {
  // payload is the exact object passed to publish(...)
  console.log('received', payload.value);
});

channel.publish({ value: 1 });
unsubscribe();
```
`createChannel<T>()` returns:
- `publish(payload: T): void` — push a new payload to all subscribers
- `subscribe(fn: (payload: T) => void): () => void` — register a listener; returns `unsubscribe`
- `last(): T | undefined` — read the most recent payload without subscribing

When you call:
```ts
channel.subscribe((data) => {
  // data is the published payload (same shape as your T).
  console.log('fresh data', data);
});
```
you are registering a listener that runs every time `publish` is called. Nothing runs on subscribe; it only fires on future publishes.

## Service wrapper
The service wrapper is a thin helper around `resource()`. It has no lifecycle; calls are explicit.
```ts
import { createService } from 'atomica';

const api = createService({
  baseUrl: '/api',
  fetcher: fetch
});

type User = { id: string; name: string };
const { resource, channel } = api.get<User>('/user');

channel.subscribe((user) => {
  // user is a User, coming from the latest successful response body
  console.log('fresh data', user.name);
});

resource.refresh();
```
`createService(options?)` accepts:
- `baseUrl?: string`
- `fetcher?: typeof fetch`

It returns:
- `get<T>(path: string, auto = true): { resource: Resource<T>; channel: Channel<T> }`
- `post<T>(path: string, body: unknown, auto = true): { resource: Resource<T>; channel: Channel<T> }`

`resource` is the standard Atomica `resource()` result:
- `data(): T | undefined`
- `error(): unknown`
- `loading(): boolean`
- `state(): 'idle' | 'loading' | 'success' | 'error'`
- `refresh(): Promise<void>`
- `mutate(next: T | ((prev?: T) => T)): void`
- `clear(): void`
- `dispose(): void`

In the example above:
- `api.get<T>('/user')` defines the request and returns both a `resource` and a `channel`.
- `channel.subscribe(...)` listens for each successful response.
- `resource.refresh()` explicitly triggers the fetch.

## Component registry
The registry is a signal-backed set you can use for diagnostics panels.
```ts
import { registerComponent, listComponents, useComponentRegistry } from 'atomica';

registerComponent('App');
const names = listComponents();
const registry = useComponentRegistry(); // Signal<Set<string>>
```
`listComponents()` returns a snapshot; `useComponentRegistry()` gives you the live signal for reactive UIs:
```ts
const registry = useComponentRegistry();
const View = () =>
  h('ul', null, () => Array.from(registry.get()).map((name) => h('li', null, name)));
```

## What Companion is not
- Not a framework layer
- Not a router or data layer
- Not required to use Atomica

If you want a smaller surface, ignore it. Atomica remains fully usable without Companion.
