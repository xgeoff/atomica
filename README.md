# Atomica

Signal-first, fine-grained UI toolkit with zero React baggage.

More details: xgeoff.github.io/atomica

## What is it?

Atomica is a tiny view library built on signals. Components are plain functions; DOM updates are localized through bindings, not full re-renders. The goal: predictable, fast updates with an API you can learn in minutes.

## Packages

- `atomica` — public entry that re-exports DOM + signals
- `atomica/signals` — `signal`, `computed`, `effect`, `batch`, `untrack`
- `atomica/dom` — `h`, `fragment/Fragment`, `text`, `mount`, `unmount`, bindings

## Quick start

```ts
import { h, mount, signal, computed } from 'atomica';

const count = signal(0);
const doubled = computed(() => count.get() * 2);

const Counter = () =>
  h('div', { class: 'counter' },
    h('p', null, 'Count: ', () => count.get()),
    h('p', null, 'Doubled: ', () => doubled.get()),
    h('button', { onClick: () => count.set(c => c + 1) }, 'Increment')
  );

mount(h(Counter, {}), document.getElementById('app')!);
```

## Key ideas

- **Signals**: `signal()`, `computed()`, and `effect()` form the reactive graph.
- **Fine-grained bindings**: Any prop/child function (`() => value`) becomes a live binding; only the touched node updates.
- **Plain functions**: Components are simple functions—no hooks or lifecycle soup.
- **Keyed lists**: `key` on VNodes preserves DOM identity in dynamic regions.
- **Dev mode**: Warnings for missing keys and component render errors; hydration API stubbed for future work.
- **JSX is optional**: Core uses `h()`; JSX, when used, compiles directly to `h()` via a tiny adapter—no runtime JSX logic.
- **Diagnostics-first**: Dev-only counters prove components run once, signals drive updates, and computeds stay lazy.

## Repo layout

- `packages/atomica` — barrel exports and entry points
- `packages/signals` — reactive core
- `packages/dom` — VNode + renderer + bindings
- `packages/shared` — utilities
- `examples/counter` — minimal demo (Vite)
- `examples/playground` — live playground proving invariants and bindings
- `docs` — short walkthrough + doctrine

## Scripts

- `pnpm build` — build all packages/examples
- `pnpm test` — run package tests (Vitest)
- `pnpm --filter @atomica/example-counter dev` — start the counter example
- `pnpm --filter @atomica/playground dev` — start the playground

## Status

Atomica v0.1 is a work-in-progress reference implementation. Public API is intentionally small; internals are kept private behind exports maps.
