import { computed, effect, signal } from 'atomica/signals';
import { Fragment, h, mount } from 'atomica/dom';
import './style.css';

interface Example {
  id: string;
  title: string;
  summary: string;
  code: string;
  View: () => any;
}

const CounterExample: Example = {
  id: 'counter',
  title: 'Counter (baseline)',
  summary: 'signal + event + reactive child',
  code: `const count = signal(0)

const App = () =>
  h('button', { onClick: () => count.set(c => c + 1) },
    () => \"Count: \", () => count.get())`,
  View: () => {
    const count = signal(0);
    return h(
      'div',
      { class: 'stack' },
      h(
        'button',
        { class: 'btn', onClick: () => count.set((c) => c + 1) },
        () => `Count: ${count.get()}`
      ),
      h('div', { class: 'note' }, 'Component renders: 1 (stays 1)')
    );
  }
};

const NoRerenderExample: Example = {
  id: 'no-rerender',
  title: 'No Re-render Proof',
  summary: 'Signal updates do not re-run components',
  code: `let renders = 0
const count = signal(0)

const Child = () => { renders++; return h('span', null, 'Static') }

const App = () => h('div', null,
  h(Child, {}),
  h('span', null, () => count.get())
)`,
  View: () => {
    const count = signal(0);
    const renders = signal(0);

    const Child = () => {
      renders.set((r) => r + 1);
      return h('span', null, 'Static child');
    };

    return h(
      'div',
      { class: 'stack' },
      h(
        'div',
        { class: 'row' },
        h('button', { class: 'btn', onClick: () => count.set((c) => c + 1) }, 'Tick'),
        h('span', { class: 'pill' }, () => `count = ${count.get()}`)
      ),
      h(
        'div',
        { class: 'note' },
        h('strong', null, 'Renders: '),
        () => renders.get()
      ),
      h('div', { class: 'box' }, h(Child, {}), ' | value: ', () => count.get())
    );
  }
};

const KeyedListExample: Example = {
  id: 'keyed',
  title: 'Dynamic List with Keys',
  summary: 'Add/remove/reorder with DOM identity',
  code: `const items = signal([{ id: 1 }, { id: 2 }])

const List = () => h('ul', null,
  () => items.get().map(item =>
    h('li', { key: item.id }, item.id)
  )
)`,
  View: () => {
    const palette = ['#22d3ee', '#a855f7', '#f97316', '#10b981', '#ef4444'];
    let nextId = 3;
    const items = signal([
      { id: 1, label: 'First', color: palette[0] },
      { id: 2, label: 'Second', color: palette[1] }
    ]);

    const reorder = () => {
      const list = items.peek();
      items.set([list[1], list[0], ...list.slice(2)].filter(Boolean));
    };

    const add = () => {
      const color = palette[nextId % palette.length];
      items.set((prev) => [...prev, { id: nextId++, label: `Item ${nextId - 1}`, color }]);
    };

    const removeFirst = () => {
      items.set((prev) => prev.slice(1));
    };

    return h(
      'div',
      { class: 'stack' },
      h('div', { class: 'row' },
        h('button', { class: 'btn', onClick: add }, 'Add'),
        h('button', { class: 'btn', onClick: reorder }, 'Reorder first two'),
        h('button', { class: 'btn', onClick: removeFirst }, 'Remove first')
      ),
      h('ul', { class: 'list' }, () =>
        items.get().map((item) =>
          h(
            'li',
            { key: item.id, style: { borderColor: item.color } },
            h('span', { class: 'dot', style: { background: item.color } }),
            `${item.id}: ${item.label}`
          )
        )
      )
    );
  }
};

const DerivedStateExample: Example = {
  id: 'derived',
  title: 'Derived State (computed)',
  summary: 'Chained computeds and laziness',
  code: `const count = signal(1)
const doubled = computed(() => count.get() * 2)
const tripled = computed(() => doubled.get() + count.get())

h('div', null,
  h('button', { onClick: () => count.set(c => c + 1) }, 'inc'),
  h('p', null, () => doubled.get()),
  h('p', null, () => tripled.get())
)`,
  View: () => {
    const count = signal(1);
    const computeHits = signal(0);
    const doubled = computed(() => {
      computeHits.set((v) => v + 1);
      return count.get() * 2;
    });
    const tripled = computed(() => doubled.get() + count.get());

    const effects = signal(0);
    effect(() => {
      tripled.get();
      effects.set((e) => e + 1);
    });

    return h(
      'div',
      { class: 'stack' },
      h('div', { class: 'row' },
        h('button', { class: 'btn', onClick: () => count.set((c) => c + 1) }, 'Increment'),
        h('span', { class: 'pill' }, () => `count = ${count.get()}`)
      ),
      h('p', null, 'doubled = ', () => doubled.get()),
      h('p', null, 'tripled = ', () => tripled.get()),
      h('div', { class: 'note' }, () => `computed runs: ${computeHits.get()}`),
      h('div', { class: 'note' }, () => `effect runs: ${effects.get()}`)
    );
  }
};

const examples: Example[] = [
  CounterExample,
  NoRerenderExample,
  KeyedListExample,
  DerivedStateExample
];

const App = () =>
  h(
    'main',
    { class: 'page' },
    h('header', { class: 'hero' },
      h('p', { class: 'eyebrow' }, 'Atomica Playground'),
      h('h1', null, 'Feel the model before v0.2'),
      h('p', { class: 'lede' }, 'Each example shows fine-grained updates without re-renders. Code is read-only; output is live.')
    ),
    h('section', { class: 'grid' },
      examples.map((example) =>
        h('article', { class: 'card', key: example.id },
          h('div', { class: 'card-head' },
            h('div', { class: 'titles' },
              h('p', { class: 'eyebrow' }, example.summary),
              h('h2', null, example.title)
            )
          ),
          h('div', { class: 'card-body' },
            h('div', { class: 'code' }, h('pre', null, example.code)),
            h('div', { class: 'live' }, example.View())
          )
        )
      )
    )
  );

const root = document.getElementById('app');
if (root) {
  mount(h(App, {}), root, { dev: true });
}
