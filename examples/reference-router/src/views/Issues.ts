import { h, signal } from 'atomica';

export const Issues = () => {
  const selection = signal<string | null>(null);

  const items = [
    { id: '1', title: 'Renderless routing' },
    { id: '2', title: 'Signals update nodes directly' },
    { id: '3', title: 'Diagnostics prove once-only components' }
  ];

  return h(
    'div',
    { class: 'view' },
    h('h2', null, 'Issues (static list)'),
    h(
      'ul',
      null,
      items.map((item) =>
        h(
          'li',
          {
            key: item.id,
            class: () => (selection.get() === item.id ? 'selected' : ''),
            onClick: () => selection.set(item.id)
          },
          item.title
        )
      )
    ),
    h('p', { class: 'muted' }, () => `Selected: ${selection.get() ?? 'none'}`)
  );
};
