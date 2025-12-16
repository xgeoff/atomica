# Atomica v0.1 (WIP)

Atomica is a tiny signals-driven view library with fine-grained DOM bindings. This snapshot follows the public API spec used by the Codex tasks.

## Packages
- `atomica` – public entry that re-exports `signals` and `dom` helpers
- `atomica/signals` – signals, computed values, effects, batching utilities
- `atomica/dom` – VNode factory (`h`), DOM renderer, and bindings

## Core APIs

### Signals
```ts
import { signal, computed, effect, batch, untrack } from 'atomica/signals';
```
- `signal<T>(value)` returns `{ get, set, peek }`
- `computed(fn)` returns memoized `{ get, peek }`
- `effect(fn)` runs immediately, re-runs on dependency changes, and returns `dispose()`
- `batch(fn)` coalesces effect flushes until `fn` finishes
- `untrack(fn)` executes without dependency collection

### DOM
```ts
import { h, mount, Fragment } from 'atomica/dom';
```
- `h(type, props, ...children)` creates a VNode (type is tag or component function)
- `fragment(...children)`/`Fragment` groups children
- `text(value)` forces a text VNode
- `mount(vnode | Component, container, options?)` renders into a container and returns `dispose()`
- Any prop/child value that is a function `() => X` becomes a live binding

## Reactive bindings
- Attributes/props: `h('div', { class: () => theme.get() })`
- Text/children: `h('p', null, 'Value: ', () => count.get())`
- Keyed lists inside dynamic regions use `key` to preserve DOM nodes.

## Development notes
- `options.dev` on `mount` enables extra warnings (missing keys, component stack hints)
- Hydration is defined on the API but currently mounts normally.
