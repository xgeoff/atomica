# Companion (Optional)

Companion is a tiny, opt-in helper layer built on Atomica primitives. It does not add new semantics; it packages a few common patterns: channels, a service wrapper over `resource()`, and a component registry for diagnostics or debug UI.

If you use it, import from the root to keep a single instance:
```ts
import { createChannel, createService, registerComponent } from 'atomica';
```

## Mental model
- Channels are a **typed broadcast stream**: publish a payload, every subscriber receives it.
- The service wrapper is a **thin convenience** around `resource()` that also publishes responses on a channel.
- The component registry is a **signal-backed set** for observability (not behavior).

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
you are registering a listener function. The parameter (`data`) is not something you pass in — it is the value that will be delivered later when someone calls `publish(...)`. Nothing runs on subscribe; it only fires on future publishes.

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
- `headers?: HeadersInit | (() => HeadersInit)`

It returns:
- `get<T>(path: string, auto = true): { resource: Resource<T>; channel: Channel<T> }`
- `post<T>(path: string, body: unknown, auto = true): { resource: Resource<T>; channel: Channel<T> }`
- `put<T>(path: string, body: unknown, auto = true): { resource: Resource<T>; channel: Channel<T> }`
- `delete<T>(path: string, body?: unknown, auto = true): { resource: Resource<T>; channel: Channel<T> }`

### How the service call works
Each call (like `api.get('/user')`) does two things:
- Creates a `resource()` that runs the request when you call `refresh()` (or when `auto: true`).
- Creates a `channel` that publishes each successful response.

So the flow is:
```
resource.refresh() -> fetcher(url, init) -> response JSON -> channel.publish(data)
```

### What the fetcher does
`fetcher` is just a function with the same signature as the standard Web `fetch` API:
```ts
fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
```
It is called **every time the resource runs**. Use it to:
- mock network calls in demos/tests
- use a custom HTTP client that still behaves like `fetch`

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

To attach auth headers (for example, a JWT), pass a function so the latest token is read at call time:
```ts
const api = createService({
  baseUrl: '/api',
  headers: () => ({
    Authorization: `Bearer ${token.get()}`
  })
});
```


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

See `docs/usage-patterns.md` for complete usage recipes.
