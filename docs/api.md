# API Reference

Atomica exposes three primary packages plus Companion helpers. All exports are intentionally minimal and tree-shakable.

## atomica (root barrel)
```ts
import {
  h,
  mount,
  Fragment,
  context,
  signal,
  computed,
  effect,
  batch,
  untrack,
  resource,
  bindInput,
  bindProp,
  createChannel,
  createService,
  registerComponent
} from 'atomica';
```
`atomica` re-exports the DOM renderer, signal primitives, and Companion helpers to keep the runtime surface stable.

## atomica/signals

### `signal(initial)`
Creates a piece of reactive state. `get()` reads the value and registers dependencies, `set()` publishes a new value (use a functional setter to derive from the previous value), and `peek()` reads without tracking.

```ts
const count = signal(0);
count.set((current) => current + 1);
console.log(count.get()); // 1
```

Signals hold plain JS values: replace arrays/objects with new references when updating so subscribers are notified.

### `computed(fn)`
Declares a memoized derivation. The callback runs on demand the first time `get()` is called, and re-runs only when one of the signals it read changes. `peek()` bypasses dependency tracking.

```ts
const numbers = signal([1, 2, 3]);
const total = computed(() => numbers.get().reduce((sum, n) => sum + n, 0));

numbers.set((list) => [...list, 4]);
console.log(total.get()); // 10
```

### `effect(fn)`
Runs a side effect whenever the signals read inside `fn` change. Returns a disposer. Use this for imperative work (logging, DOM APIs outside Atomica, etc.).

```ts
const name = signal('Ada');
const stop = effect(() => {
  console.log('hello', name.get());
});

name.set('Alan'); // effect logs again
stop(); // further updates no longer run the effect
```

### `batch(fn)`
Wrap multiple `set()` calls so dependent effects/computeds flush once at the end. Helpful when updating several signals in response to one event.

```ts
batch(() => {
  first.set('a');
  last.set('b');
}); // triggers effects once instead of twice
```

### `untrack(fn)`
Runs `fn` without registering dependencies on the current computed/effect. Use sparingly when you need the current value but do not want to be notified about future updates.

```ts
const noisy = computed(() => {
  const silent = untrack(() => debugSignal.get());
  return base.get() + silent;
});
```

### `resource(producer, options?)`
Thin async state primitive. Call `resource.refresh()` to run `producer` (or set `{ auto: true }` to tie it to signal reads). Exposes `data`, `loading`, `error`, `refresh()`, `clear()`, and `dispose()`.

```ts
const userId = signal('1');
const user = resource(async () => fetch(`/api/users/${userId.get()}`).then((r) => r.json()), {
  auto: true
});

await user.refresh();
console.log(user.data(), user.loading());
```

## atomica/dom

### `h(type, props?, ...children)`
Builds a virtual node. `type` can be a string tag (`'div'`) or a component function. Props are plain objects; any prop whose value is a function is treated as a live binding.

```ts
h('button', { onClick: increment }, () => `Count: ${count.get()}`);
```

### `mount(node, container, options?)`
Instantiates the node tree once and attaches it to a DOM container. Returns a disposer that unmounts the tree.

```ts
const dispose = mount(h(App, {}), document.getElementById('app')!);
// dispose(); // later, detach everything
```

### Reactive props and children
Any function you pass as a prop or child becomes a binding. Atomica evaluates it immediately to produce the initial value, then re-runs it whenever the signals it reads change. Components never re-execute; only these bindings update.

```ts
h('p', null, 'Total: ', () => total.get());
h('input', {
  value: () => name.get(),
  onInput: (event) => name.set((event.target as HTMLInputElement).value)
});
```

### `Fragment` and array returns
Use `Fragment` (or return an array of nodes) when you want multiple siblings without an extra DOM wrapper.

```ts
return [h('span', null, 'A'), h('span', null, 'B')];
// or h(Fragment, null, h('span', null, 'A'), h('span', null, 'B'))
```

### `context(key, defaultValue?)`
Creates a lexical context. `provide(value, fn)` supplies the value for all descendants rendered by `fn`; `use()` reads it (and can be reactive if the value is a signal).

```ts
const Theme = context('light');
const View = () =>
  Theme.provide('dark', () => h('p', null, Theme.use()));
```

### Binding helpers
Atomica ships ergonomic helpers for common DOM bindings; under the hood they all produce tiny functions that keep props in sync with signals.

#### `bindInput(signal)`
Spreads into text inputs to wire `value` and `onInput` at once.

```ts
h('input', { placeholder: 'Name', ...bindInput(name) });
```

#### `bindProp(signal, prop)`
Generic helper to sync any DOM property (e.g., `checked`, `value`, `disabled`).

```ts
h('input', { type: 'checkbox', ...bindProp(done, 'checked') });
```

#### Low-level bindings
When you need direct control, import the raw binders:

- `bindText(fn)` → keeps a text node in sync with a function.
- `bindAttr(element, name, fn)` → updates an attribute whenever `fn()` changes.
- `bindPropEffect(element, prop, fn)` → runs `fn` and assigns the result to a property.

These are the same primitives Atomica uses internally; reach for them when building custom abstractions.

## atomica/companion
Utilities that sit next to the core runtime.

### `createChannel<T>()`
Lightweight pub/sub. Useful for decoupling services from views or broadcasting diagnostics.

```ts
const channel = createChannel<number>();
const stop = channel.subscribe((value) => console.log('received', value));

channel.publish(42);
console.log(channel.last()); // 42
stop();
```

### `createService(options?)`
HTTP helper built on `fetch`. Configure a `baseUrl` or headers once, then call `get/post/put/delete`. Each call returns `{ resource, channel }`: the `resource` exposes the async state, while `channel` emits each resolved payload.

```ts
const api = createService({ baseUrl: '/api' });

const loadUsers = () => {
  const { resource, channel } = api.get<User[]>('/users', true);
  channel.subscribe((users) => console.log('users', users));
  return resource; // call refresh() if auto=false
};
```

### Component registry helpers
`registerComponent(name)` records a component in the dev registry so diagnostics can show how many instances were constructed. `listComponents()` returns the registry map, and `useComponentRegistry()` provides a signal-friendly view.

### Service/channel contexts
`createServiceContext` and `createChannelContext` wrap services/channels in Atomica contexts so you can provide them near the root and consume them without prop drilling.

## Diagnostics
Available only in dev builds via `window.__ATOMICA_DEV__`. Use them to confirm your mental model:

```ts
const dev = window.__ATOMICA_DEV__;
console.log(dev.summary()); // e.g., "App:1; signal updates=3; computed:2"
dev.inspectSignals(); // optional detailed view
```

- `summary()` reports component constructions, signal updates, computed runs.
- `trackComponent(name)` pairs with `registerComponent` to count instances.
- Diagnostics objects are tree-shakable; nothing ships in production bundles.

## Notes
* Everything is explicit: there is no render loop, scheduler, or magic lifecycle.
* The DOM runner updates only the expressions that read signals; components execute once.
* Optional helpers (like `bindInput`) are exported from `atomica/dom` so you can opt into the ergonomic surface without expanding the core primitives.
