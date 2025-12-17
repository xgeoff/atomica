# Atomica v0.2 — Overview and Map

Atomica is a tiny, signal-first view library with fine-grained DOM bindings. Components are plain functions; state changes update only the nodes that depend on that state. No renders, no lifecycles, no hooks.

Repository: https://github.com/xgeoff/atomica

## Core Doctrine
- No re-renders by default; components execute once at construction.
- No lifecycles/hooks; effects are explicit reactions.
- Reactivity is explicit (`() => expr`); no hidden subscriptions.
- JSX is optional, compile-time sugar only.
- Not a meta-framework (no router, data layer, styling system).
- Avoids magic; no scheduler/priorities you didn’t ask for.

## Document Map
- [What Atomica Refuses](what-atomica-refuses.html) — doctrine and non-goals.
- [v0.2 Design Contract](v0.2-design-contract.html) — authoritative invariants and upgrade policy.
- [How to Think in Atomica](how-to-think-in-atomica.html) — mental model for React-minded engineers.
- Sample code used in docs/playground (counter, no-rerender, keyed list): see `docs/samples/*.ts`.

## Packages
- `atomica` — public barrel, re-exporting DOM + signals
- `atomica/signals` — signals, computed, effect, batch, untrack, resource, diagnostics
- `atomica/dom` — VNode factory (`h`), renderer, bindings, context, mount/unmount
- `atomica/shared` — utilities and dev diagnostics plumbing

## Core APIs (v0.2)

### Signals
```ts
import { signal, computed, effect, batch, untrack, resource } from 'atomica/signals';
```
- `signal<T>(value)` → `{ get, set, peek }`
- `computed(fn)` → lazy memo `{ get, peek }`
- `effect(fn)` → runs immediately, re-runs on dependency changes; returns `dispose()`
- `batch(fn)` → coalesces effect flushes until `fn` finishes
- `untrack(fn)` → run without dependency collection
- `resource(producer, options?)` → async state machine (manual or `auto`), latest-wins, abortable

### DOM
```ts
import { h, mount, Fragment, context } from 'atomica/dom';
```
- `h(type, props, ...children)` creates a VNode (tag or component fn)
- `fragment(...children)` / `Fragment` groups children
- `text(value)` forces a text VNode
- `mount(vnode | Component, container, options?)` renders and returns `dispose()`
- `context(defaultValue, options?)` → lexical, synchronous context; not reactive unless you pass signals
- Any prop/child value that is a function `() => X` becomes a live binding

### Reactive bindings
- Attributes/props: `h('div', { class: () => theme.get() })`
- Text/children: `h('p', null, 'Value: ', () => count.get())`
- Keyed lists in dynamic regions use `key` to preserve DOM identity

### Diagnostics (dev-only)
- `window.__ATOMICA_DEV__` (dev builds) tracks:
  - component constructions
  - signal update count
  - computed run count
- Purely observational; no runtime influence. Absent in production.

## Playgrounds and Examples
- `examples/counter` — minimal signal + binding demo. Run: `pnpm --filter @atomica/example-counter dev`.
- `examples/playground` — living spec proving invariants. Run: `pnpm --filter @atomica/playground dev`.
- `examples/github-issues` — real app with resource/context/diagnostics under v0.2. Run: `pnpm --filter @atomica/example-github-issues dev`.

## Build/Test
- `pnpm build` — builds all packages and examples
- `pnpm test` — runs Vitest suites (signals, dom)

## Status (v0.1 locked)
- Components execute once; fine-grained updates only
- Signals/computed/effect/batch/untrack stable
- DOM renderer with bindings, keyed diff, mount/unmount
- Resource (async) and context (lexical) added under v0.2 scope
- Diagnostics prove invariants in dev mode

## Future (v0.2 semantics locked)
- Semantics are frozen per `docs/v0.2-design-contract.md`; ergonomic tweaks must not violate invariants.
