import { h } from 'atomica';

export const Home = () =>
  h(
    'div',
    { class: 'view' },
    h('h2', null, 'Home'),
    h('p', null, 'Routing is just a signal + expressions. Components stay single-run.')
  );
