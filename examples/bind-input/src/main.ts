import { bindInput, h, mount, signal } from 'atomica';
import './style.css';

const name = signal('');

const View = () =>
  h('div', { class: 'card' },
    h('h1', null, 'bindInput demo'),
    h('label', null, 'Name'),
    h('input', { placeholder: 'Type here...', ...bindInput(name) }),
    h('p', { class: 'muted' }, 'Value: ', () => name.get())
  );

const root = document.getElementById('app');
if (root) {
  mount(h(View, {}), root);
}
