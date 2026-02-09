# Framework Examples

Use this page to collect quick compare-and-contrast notes between Atomica patterns and other front-end frameworks. Each section should include the original framework snippet plus any observations worth capturing.

## Svelte

The snippet below comes straight from the official Svelte demo. It tracks an array of numbers and displays both the expression and its running total; every button click pushes a new number and re-renders the view automatically.

```svelte
<script>
    let numbers = $state([1, 2, 3, 4]);
    let total = $derived(numbers.reduce((t, n) => t + n, 0));

    function addNumber() {
        numbers.push(numbers.length + 1);
        console.log(numbers);
    }
</script>

<p>{numbers.join(' + ')} = {total}</p>

<button onclick={addNumber}>
    Add a number
</button>
```

Notes:

- `$state` produces a reactive array. Mutating `numbers` (even with `push`) signals the template to re-render.
- `$derived` automatically recomputes `total` whenever `numbers` changes, so you never call a setter by hand.
- Handlers remain plain functions; the DOM binding (`onclick={addNumber}`) wires reactivity back into the component.

### Atomica rewrite

Atomica models the same idea using `signal()`/`computed()` plus explicit DOM bindings. Components run once, so reactivity lives in the arrow expressions you pass as children.

```ts
import { Fragment, h, mount, signal, computed } from 'atomica';

const numbers = signal([1, 2, 3, 4]);
const total = computed(() => numbers.get().reduce((sum, n) => sum + n, 0));

function addNumber() {
  numbers.set((list) => [...list, list.length + 1]);
}

const nodes = h(Fragment, null,
  h('p', null, () => numbers.get().join(' + '), ' = ', () => total.get()),
  h('button', { onClick: addNumber }, 'Add a number')
);

mount(nodes, document.getElementById('app')!);
```
### Atomica with JSX rewrite
```ts
/** @jsxImportSource atomica/dom */
  import { Fragment, mount, signal, computed } from 'atomica';

  const numbers = signal([1, 2, 3, 4]);
  const total = computed(() => numbers.get().reduce((sum, n) => sum + n, 0));

  function addNumber() {
    numbers.set((list) => [...list, list.length + 1]);
  }

  const nodes = () => (
    <>
      <p>{() => numbers.get().join(' + ')} = {() => total.get()}</p>
      <button onClick={addNumber}>Add a number</button>
    </>
  );

  mount(<nodes/>, document.getElementById('app')!);
```
Key contrasts:

- Signals hold plain values. To publish a change you must call `set()` with a new array (mutating in place, as Svelte does, would be ignored because the reference does not change).
- Derived state comes from `computed()`; it stays lazy until `total.get()` is read inside a binding.
- Even though the signals live inside the component, the function still runs once. DOM updates are scoped to the arrow expressions passed as children (`() => numbers.get()`), so only the text nodes mutate.
- Svelte leans on a compiler so the source looks like HTML with special syntax—imports and helpers are injected at build time. Atomica skips a compiler, so you import the primitives directly and see exactly where reactivity lives.
- JSX optionality: Atomica can slim down to a Svelte-like shape with JSX/fragments, but the explicit `() =>` bindings and `signal`/`computed` calls remain so you keep full control over updates.

Use the same structure for other frameworks: show their idiomatic snippet, then the Atomica take with the behavioral differences called out.

Add sections for React, Vue, Solid, Atomica, etc., so we can highlight where data flow or ergonomics differ.

## React

A minimal React hook-based version of the same counter list:

```tsx
import { useState, useMemo } from 'react';

export function Demo() {
  const [numbers, setNumbers] = useState([1, 2, 3, 4]);
  const total = useMemo(() => numbers.reduce((sum, n) => sum + n, 0), [numbers]);

  function addNumber() {
    setNumbers((list) => [...list, list.length + 1]);
  }

  return (
    <>
      <p>{numbers.join(' + ')} = {total}</p>
      <button onClick={addNumber}>Add a number</button>
    </>
  );
}
```

### Atomica rewrite

Use the same signal-based component from the Svelte example:

```ts
import { Fragment, h, mount, signal, computed } from 'atomica';

const Demo = () => {
  const numbers = signal([1, 2, 3, 4]);
  const total = computed(() => numbers.get().reduce((sum, n) => sum + n, 0));

  function addNumber() {
    numbers.set((list) => [...list, list.length + 1]);
  }

  return h(Fragment, null,
    h('p', null, () => numbers.get().join(' + '), ' = ', () => total.get()),
    h('button', { onClick: addNumber }, 'Add a number')
  );
};
```

Key contrasts:

- React re-renders the component whenever state changes; Atomica runs the component once and only re-evaluates the bound expressions.
- React needs `useMemo` to avoid re-calculating `total` on every render; Atomica’s `computed` is lazy and only runs when `total.get()` is read.
- JSX looks similar, but React JSX compiles to `React.createElement` (vDOM), while Atomica JSX compiles directly to `h()` with fine-grained bindings.

## Vue

Vue’s `<script setup>` version:

```vue
<script setup>
import { ref, computed } from 'vue';

const numbers = ref([1, 2, 3, 4]);
const total = computed(() => numbers.value.reduce((sum, n) => sum + n, 0));

function addNumber() {
  numbers.value = [...numbers.value, numbers.value.length + 1];
}
</script>

<template>
  <p>{{ numbers.join(' + ') }} = {{ total }}</p>
  <button @click="addNumber">Add a number</button>
</template>
```

### Atomica rewrite

Same as above; signals map closely to Vue refs:

```ts
import { Fragment, h, signal, computed } from 'atomica';

const Demo = () => {
  const numbers = signal([1, 2, 3, 4]);
  const total = computed(() => numbers.get().reduce((sum, n) => sum + n, 0));

  function addNumber() {
    numbers.set((list) => [...list, list.length + 1]);
  }

  return [
    h('p', null, () => numbers.get().join(' + '), ' = ', () => total.get()),
    h('button', { onClick: addNumber }, 'Add a number')
  ];
};
```

Key contrasts:

- Vue has a compiler and template syntax; Atomica stays in plain JS/TS, so the reactivity is explicit in `signal`/`computed` and `() =>` bindings.
- Vue refs need `.value` when read/written; Atomica uses `get()/set()` to keep dependencies precise.
- Updates in Vue trigger component re-renders (scope is optimized but still driven by the template); Atomica updates only the nodes whose bindings read the changed signals.
