import { h } from 'atomica/dom';
import { signal } from 'atomica/signals';

const items = signal([
  { id: 1, label: 'First' },
  { id: 2, label: 'Second' }
]);

export const List = () =>
  h(
    'ul',
    null,
    () =>
      items.get().map((item) =>
        h('li', { key: item.id }, `${item.id}: ${item.label}`)
      )
  );

export const setItems = (next: { id: number; label: string }[]) => items.set(next);
