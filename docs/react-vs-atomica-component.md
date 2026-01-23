# React vs Atomica Component (Compare & Contrast)

This page contrasts a single component in React and Atomica and explains what changes in the mental model.

## The same UI in both
Goal: a button that increments a counter and displays the current value.

### React
```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### Atomica
```ts
import { h, signal } from 'atomica';

export const Counter = () => {
  const count = signal(0);

  return h(
    'button',
    { onClick: () => count.set((c) => c + 1) },
    () => `Count: ${count.get()}`
  );
};
```

## What is different
- React re-runs the component function when state changes; Atomica does not.
- React makes the whole return value a render; Atomica updates only the expressions (`() => ...`).
- React state is tied to the component lifecycle; Atomica signals are just values and can live anywhere.
- React updates DOM through reconciliation; Atomica binds expressions to specific DOM nodes directly.

## What is similar
- Both use plain functions to define UI.
- Both use explicit event handlers (`onClick`).
- Both are declarative about “what the UI should show.”

## Key mental shift
If you expect the component to run again, you are thinking in React.
In Atomica, the component runs once to build DOM + bindings; the bindings re-run.
