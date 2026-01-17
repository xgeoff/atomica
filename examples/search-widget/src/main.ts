import { h, mount, resource, signal } from 'atomica';
import './style.css';

type Result = {
  id: string;
  title: string;
  summary: string;
};

const catalog: Result[] = [
  { id: 'a1', title: 'Atomica Basics', summary: 'Signals, bindings, and zero re-renders.' },
  { id: 'a2', title: 'Components as Factories', summary: 'DOM + bindings built once.' },
  { id: 'a3', title: 'Async Resources', summary: 'Explicit fetches with latest-wins.' },
  { id: 'a4', title: 'Context', summary: 'Lexical and synchronous by design.' },
  { id: 'a5', title: 'Diagnostics', summary: 'Observability without behavioral impact.' }
];

const searchCatalog = async (query: string): Promise<Result[]> => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return catalog.filter((item) => item.title.toLowerCase().includes(term));
};

const SearchWidget = () => {
  const query = signal('');
  const results = resource(() => searchCatalog(query.get()), { auto: false });

  const runSearch = () => {
    results.refresh();
  };

  return h(
    'section',
    { class: 'widget' },
    h('header', { class: 'widget__header' },
      h('h1', null, 'Search Library'),
      h('p', { class: 'muted' }, 'Encapsulated HTML + CSS + JS in a drop-in component.')
    ),
    h('div', { class: 'widget__controls' },
      h('input', {
        placeholder: 'Search topics...',
        value: () => query.get(),
        onInput: (event: Event) => query.set((event.target as HTMLInputElement).value),
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key === 'Enter') runSearch();
        }
      }),
      h('button', { class: 'btn', onClick: runSearch }, 'Search')
    ),
    h('div', { class: 'widget__status' }, () => {
      if (results.loading()) return 'Searching...';
      if (results.error()) return `Error: ${String(results.error())}`;
      return `Matches: ${results.data()?.length ?? 0}`;
    }),
    h('ul', { class: 'widget__results' }, () => {
      const list = results.data();
      if (!list || list.length === 0) {
        return h('li', { class: 'muted' }, 'No results yet.');
      }
      return list.map((item) =>
        h(
          'li',
          { key: item.id, class: 'widget__item' },
          h('h3', null, item.title),
          h('p', { class: 'muted' }, item.summary)
        )
      );
    })
  );
};

const target = document.getElementById('search-widget');
if (target) {
  mount(h(SearchWidget, {}), target, { dev: true });
}
