import { bindInput, h, mount, signal } from 'atomica';

const name = signal('');

const View = () =>
  h('div', null,
    h('label', null, 'Name:'),
    h('input', { placeholder: 'Type here...', ...bindInput(name) }),
    h('p', null, 'Value: ', () => name.get())
  );

const target = document.getElementById('bind-input');
if (target) {
  mount(h(View, {}), target);
}
