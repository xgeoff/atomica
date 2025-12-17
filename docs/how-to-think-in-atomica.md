# How to Think in Atomica

Atomica is a reactive DOM binding system, not a rendering framework.

## 1. There Is No Render Loop
Atomica has no render phase, no re-run cycle, and no reconciliation. Components run once to produce DOM + bindings, and signals drive the bindings directly. Components run once to produce DOM + bindings. After that point, no code path exists that would re-enter the component function. If you are waiting for a component to re-run, you are thinking in React.

React thinking: “state changes cause the component to render again, diff, and commit.”

Atomica thinking: “state changes re-evaluate only the bound expressions; the component never runs again.”

## 2. Components Are Construction-Time Only
Components are factories that run once to create DOM nodes and wire reactive bindings. They are not reactive and never re-enter.

```ts
const Counter = () => {
  console.log('runs once');
  return h('button', { onClick: () => count.set((c) => c + 1) }, () => count.get());
};
```

Component functions are not reactive.
Any logic placed directly in a component function will never respond to signal updates.

## 3. Reactivity Lives in Expressions, Not Functions
The reactive unit is the expression wrapper `() => expr`. Expressions re-run when their dependencies change; plain functions (including components) do not. The wrapper exists to give Atomica a precise, minimal unit of re-execution.

| Thing                | Runs once | Runs many times |
| -------------------- | --------- | --------------- |
| Component            | ✅         | ❌               |
| Reactive expression  | ❌         | ✅               |
| Computed (when read) | ❌         | ✅               |

## 4. Signals Update Nodes, Not Trees
Signals drive bindings that mutate DOM nodes in place—no virtual DOM, no tree diff, no parent involvement.

Once created, DOM nodes are never replaced unless you explicitly do so.

```ts
const count = signal(0);
const App = () =>
  h('div', null, h('span', null, 'Count: '), h('span', { id: 'value' }, () => count.get()));
// Clicking updates only the text node under #value; nothing above the node is involved.
```

Nothing above the node is involved.

## 5. Context Is Lexical, Not Reactive
Context resolves at construction time. It only changes if the provided value itself is reactive. Context values are resolved during component construction, not during reactive updates.

Snapshot context:
```ts
const Theme = context('light');
const View = () => Theme.provide('dark', () => h('p', null, Theme.use())); // always "dark" here
```

Reactive context:
```ts
const Theme = context(signal('light'));
const View = () =>
  Theme.provide(Theme.use(), () => h('p', null, () => Theme.use().get())); // follows signal reads
```

If you expect context to update the tree, you are reintroducing render thinking.

## 6. Async Is Pull-Based, Not Lifecycle-Based
`resource()` does not run “on mount.” Data is fetched explicitly; auto mode is explicit and opt-in. Latest refresh wins. There is no implicit fetch tied to component creation.

Manual:
```ts
const user = resource(async () => fetchUser());
await user.refresh(); // triggers fetch
```

Opt-in auto:
```ts
const query = signal('a');
const results = resource(async () => search(query.get()), { auto: true });
// changes to query trigger refresh; newest resolution replaces older ones
```

## 7. Diagnostics Are the Truth
Atomica exposes diagnostics so you can verify behavior.

```ts
const dev = (__ATOMICA_DEV__ as any);
console.log(dev.summary()); // e.g., "App:1; signal updates=3; computed:2"
```

If diagnostics say a component ran once, that is the ground truth.
If your mental model disagrees with diagnostics, the mental model is wrong.

## 8. If You Think You Need Memo, Stop
React memo exists to avoid re-rendering components. Atomica components do not re-render, so memo is usually unnecessary. Memoization is not banned; it is simply rarely needed when components never re-run. Hoist expensive work into plain scope and reuse it.

```ts
const formatter = new Intl.NumberFormat('en-US');
const Price = ({ amount }: { amount: number }) =>
  h('span', null, () => formatter.format(amountSignal.get()));
```

## 9. How to Know You’re Thinking Correctly
- You no longer ask “when does this re-render?”
- You look for `() =>` to find reactivity.
- You treat components as setup code.
- You trust diagnostics over intuition.
