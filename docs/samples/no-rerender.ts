import { h } from 'atomica/dom';
import { signal } from 'atomica/signals';

const count = signal(0);
let renders = 0;

const Child = () => {
  renders += 1;
  return h('span', null, 'Static');
};

export const App = () =>
  h(
    'div',
    null,
    h(Child, {}),
    h('span', null, () => count.get())
  );

export const getRenderCount = () => renders;
