import { h, mount, resource, signal } from 'atomica';

type Result = { id: string; title: string };

const data: Result[] = [
  { id: '1', title: 'Signals' },
  { id: '2', title: 'Computed' },
  { id: '3', title: 'Resource' }
];

const search = async (query: string): Promise<Result[]> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return data.filter((item) => item.title.toLowerCase().includes(term));
};

const SearchWidget = () => {
  const query = signal('');
  const results = resource(() => search(query.get()), { auto: false });

  return h(
    'div',
    { class: 'search-widget' },
    h('input', {
      placeholder: 'Search...',
      value: () => query.get(),
      onInput: (event: Event) => query.set((event.target as HTMLInputElement).value)
    }),
    h('button', { onClick: () => results.refresh() }, 'Search'),
    h('ul', null, () =>
      (results.data() ?? []).map((item) => h('li', { key: item.id }, item.title))
    )
  );
};

const target = document.getElementById('search-widget');
if (target) mount(h(SearchWidget, {}), target);
