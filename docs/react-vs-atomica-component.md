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

## A more complex example (form + async)
Goal: a small profile editor that saves a name and shows status.

### React
```tsx
import { useState } from 'react';

export function ProfileEditor() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function save() {
    setStatus('saving');
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={save}>Save</button>
      <span>{status}</span>
    </section>
  );
}
```

### Atomica
```ts
import { h, resource, signal } from 'atomica';

export const ProfileEditor = () => {
  const name = signal('');
  const saveResource = resource(async () => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.get() })
    });
    if (!res.ok) throw new Error('Save failed');
    return true;
  }, { auto: false });

  return h(
    'section',
    null,
    h('input', {
      value: () => name.get(),
      onInput: (e: Event) => name.set((e.target as HTMLInputElement).value)
    }),
    h('button', { onClick: () => saveResource.refresh() }, 'Save'),
    h('span', null, () => {
      if (saveResource.loading()) return 'saving';
      if (saveResource.error()) return 'error';
      return saveResource.data() ? 'saved' : 'idle';
    })
  );
};
```

### Key differences in the complex case
- React stores all state in hooks and re-runs on each change.
- Atomica keeps state in signals and runs only the specific expressions.
- Async is explicit in both, but Atomica treats it as a resource, not a lifecycle.
