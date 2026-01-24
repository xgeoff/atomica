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
* `signal<T>(initial)` → `{ get(), set(), peek() }`
* `computed(fn)` → lazy subscriber with `{ get(), peek() }`
* `effect(fn)` → subscribes to signals, returns `dispose()`
* `batch(fn)` → batches signal updates before flushing effects
* `untrack(fn)` → runs without creating dependencies
* `resource(producer, options?)` → async state machine (`data`, `loading`, `error`, `refresh`, `clear`, `dispose`)

## atomica/dom
* `h(type, props, ...children)` → VNode creation
* `mount(vnode | Component, container, options?)` → renders DOM once and returns `dispose()`
* `Fragment`, `text`, `bindText`, `bindAttr`, `bindProp`, `bindPropEffect`, `bindInput`, `mountChild`, `context`
* Reactive props: any function prop becomes a binding (`() => value`)
* `bindInput(signal)` → convenience for text inputs (value + onInput)
* `bindProp(signal, 'value' | 'checked')` → generic binding helper for inputs

## atomica/companion
* `createChannel<T>()` → `{ publish(payload), subscribe(fn), last() }`
* `createService(options?)` → `{ get, post, put, delete }`, each returning `{ resource, channel }`
* `registerComponent(name)` / `listComponents()` / `useComponentRegistry()` → diagnostics registry
* `createChannelContext`, `createServiceContext` → lexical contexts for services/channels

## Diagnostics
* `window.__ATOMICA_DEV__` (dev builds only) exposes counts for component constructions, signal updates, computed runs.
* Diagnostics exports are stripped from production builds.

## Notes
* Everything is explicit: there is no render loop, scheduler, or magic lifecycle.
* The DOM runner updates only the expressions that read signals; components execute once.
* Optional helpers (like `bindInput`) are exported from `atomica/dom` so you can opt into the ergonomic surface without expanding the core primitives.
