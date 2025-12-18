# Getting Started with Atomica (Without Scaffolding)

## 1. What This Guide Is (and Is Not)
- This guide shows how to add Atomica to an existing app you already control.
- Atomica does not require scaffolding and does not own your build, routing, or data layer.
- Atomica is designed to be pulled into your project, not to generate one for you.

## 2. Installing Atomica
```bash
pnpm add atomica
# or npm / yarn equivalent
```
- No peer dependencies, no required plugins, works with any modern bundler.

## 3. The Smallest Possible Atomica App
HTML:
```html
<div id="app"></div>
```
`main.ts`:
```ts
import { h, mount, signal } from 'atomica';

const count = signal(0);
const App = () =>
  h('button', { onClick: () => count.set((c) => c + 1) }, () => `Count: ${count.get()}`);

const root = document.getElementById('app');
if (root) {
  mount(h(App, {}), root);
}
```
- `App` runs once; the `() =>` expression is reactive; `count.set` updates the DOM directly.

## 4. Mounting Atomica Into an Existing Page
- Atomica does not assume it owns the entire page; mount into any element.
Example (server-rendered page sidebar):
```html
<div id="sidebar-widget"></div>
```
```ts
import { h, mount, signal } from 'atomica';

const online = signal(true);
const Widget = () =>
  h('div', null, h('p', null, 'Status: ', () => (online.get() ? 'Online' : 'Offline')));

const target = document.getElementById('sidebar-widget');
if (target) mount(h(Widget, {}), target);
```
Atomica does not assume it owns the entire page.

## 5. Where State Lives
- Signals are just values; you choose scope. No global store required.
Examples:
```ts
// Local signal inside a component factory
const Toggle = () => {
  const on = signal(false);
  return h('button', { onClick: () => on.set((v) => !v) }, () => (on.get() ? 'On' : 'Off'));
};

// Module-level signal shared by imports
export const theme = signal<'light' | 'dark'>('light');

// Context passing (lexical, synchronous)
import { context } from 'atomica';
const Theme = context(theme);
```

## 6. Async Data (Explicit, Not Magical)
```ts
import { h, resource, signal } from 'atomica';

const userId = signal(1);
const user = resource(async () => {
  const res = await fetch(`/api/users/${userId.get()}`);
  return res.json();
});

const View = () =>
  h('div', null,
    h('button', { onClick: () => user.refresh() }, 'Refresh'),
    () => (user.loading() ? 'Loading…' : JSON.stringify(user.data()))
  );
```
- Manual refresh is explicit; `auto` is opt-in (`resource(fn, { auto: true })`).
- No fetch-on-mount magic, no suspense, no lifecycle hooks.
- Async work in Atomica is explicit by design.

## 7. Styling and CSS
- Atomica does not care about styling. Use plain CSS, CSS modules, Tailwind, inline styles—your choice.
Examples:
```ts
h('div', { class: 'card' }, 'Hello');
h('div', { style: () => ({ color: 'tomato' }) }, () => `Count: ${count.get()}`);
```

## 8. Routing (What Atomica Does and Doesn’t Do)
- Atomica does not ship a router; routing is state + expressions.
- A reference router example lives in `examples/reference-router` (built from signals/computed/expressions).
- Using Atomica does not imply using any particular router.

## 9. How to Grow From Here
- Add more signals where you need them.
- Add derived state with `computed`.
- Add async resources where data is needed.
- Integrate with your existing router or backend.

## 10. What Atomica Refuses to Do (Short Recap)
- No render loop, no lifecycle hooks, no meta-framework behavior, no ownership of your architecture.
- Atomica gives you primitives, not a project.
