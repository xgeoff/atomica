# Search Widget Example

This example is a self-contained, drop-in component: it owns its HTML, CSS, and JS and mounts into a single DOM node.

## What to type
The example uses a mocked in-memory catalog, so only certain terms return results. Use one of these:
- `atomica`
- `components`
- `async`
- `context`
- `diagnostics`

Partial matches work (case-insensitive). For example, `comp` will match “Components as Factories”. A term like `test` will return no results because it is not in the mock data.

## How to run
```bash
pnpm --filter @atomica/example-search-widget dev
```
Open the local URL printed by Vite.

## What to verify
- Typing a query and pressing Enter or clicking “Search” triggers an explicit fetch.
- The results list updates without re-running the component.
- The widget styles stay scoped to the component markup.

## Build your own widget (pattern)
1) Pick a single mount point in existing HTML:
```html
<div id="my-widget"></div>
```
2) Create a component that owns its local state and bindings (inline comments explain the flow):
```ts
import { h, mount, signal } from 'atomica';

const MyWidget = () => {
  // Local signal holds widget state.
  const count = signal(0);
  // The component runs once; the () => expression is what updates.
  return h(
    'button',
    {
      onClick: () => count.set((c) => c + 1),
      // Inline css, reactive styles stay self-contained.
      style: () => ({
        font: '600 14px/1.2 system-ui',
        padding: '0.5rem 0.75rem',
        opacity: count.get() > 3 ? 0.6 : 1
      })
    },
    () => `Clicks: ${count.get()}`
  );
};

const target = document.getElementById('my-widget');
// Mount into a single DOM node; the widget owns its subtree.
if (target) mount(h(MyWidget, {}), target);
```
3) Inline styles directly on elements (reactive if needed).

That’s the entire pattern: one mount point, one component, local signals, and bindings.
