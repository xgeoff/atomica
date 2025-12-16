import { computed, h, mount, signal } from 'atomica';
import './style.css';

const count = signal(0);
const doubled = computed(() => count.get() * 2);

const Counter = () =>
  h(
    'div',
    { class: 'counter' },
    h('h1', null, 'Atomica Counter'),
    h('p', null, 'Count: ', () => count.get()),
    h('p', null, 'Doubled: ', () => doubled.get()),
    h(
      'div',
      { class: 'controls' },
      h('button', { onClick: () => count.set((c) => c + 1) }, 'Increment'),
      h('button', { onClick: () => count.set((c) => c - 1) }, 'Decrement'),
      h('button', { onClick: () => count.set(0) }, 'Reset')
    ),
    h(
      'p',
      {
        style: () => ({
          color: count.get() % 2 === 0 ? 'teal' : 'tomato',
          fontWeight: 700
        })
      },
      () => (count.get() % 2 === 0 ? 'Even' : 'Odd')
    ),
    h('ul', { class: 'list' }, () =>
      Array.from({ length: (count.get() % 5) + 1 }, (_, idx) =>
        h(
          'li',
          { key: `item-${idx}`, class: () => (idx === 0 ? 'first' : '') },
          `Item ${idx + 1}: `,
          () => count.get() + idx
        )
      )
    )
  );

const root = document.getElementById('app');
if (root) {
  mount(h(Counter, {}), root);
}
