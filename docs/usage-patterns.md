# Usage Patterns

This page collects small, composable patterns built from Atomica primitives and Companion helpers.

## Drop-in component (self-contained widget)
A component can be a self-contained widget that owns its HTML, CSS, and JS and mounts into a single DOM node.
```ts
import { h, mount, signal } from 'atomica';

const MyWidget = () => {
  const count = signal(0);
  return h(
    'button',
    {
      onClick: () => count.set((c) => c + 1),
      style: () => ({
        font: '600 14px/1.2 system-ui',
        padding: '0.5rem 0.75rem',
        opacity: count.get() > 3 ? 0.6 : 1
      })
    },
    () => `Clicks: ${count.get()}`
  );
};

const target = document.getElementById('my-widget');
if (target) mount(h(MyWidget, {}), target);
```

## Create a model from multiple fields
When you have multiple inputs bound to a single model, build the payload at click time and send it through the service. The response can update a shared signal:
```ts
import { createService, h, signal } from 'atomica';

type User = { name: string; email: string };

const name = signal('');
const email = signal('');
const user = signal<User | null>(null);

const api = createService({ baseUrl: '/api' });

const createUser = () => {
  const payload: User = { name: name.get(), email: email.get() };
  const { resource, channel } = api.post<User>('/users', payload, false);

  channel.subscribe((created) => {
    user.set(created);
  });

  resource.refresh();
};

const View = () =>
  h('div', null,
    h('input', {
      placeholder: 'Name',
      value: () => name.get(),
      onInput: (e: Event) => name.set((e.target as HTMLInputElement).value)
    }),
    h('input', {
      placeholder: 'Email',
      value: () => email.get(),
      onInput: (e: Event) => email.set((e.target as HTMLInputElement).value)
    }),
    h('button', { onClick: createUser }, 'Create User'),
    () => (user.get() ? `Created: ${user.get()!.name}` : 'No user yet')
  );
```
