import { h } from 'atomica/dom';
import { signal } from 'atomica/signals';

const count = signal(0);

export const App = () =>
  h(
    'button',
    { onClick: () => count.set((c) => c + 1) },
    () => `Count: ${count.get()}`
  );
