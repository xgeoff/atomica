# Usage Patterns

This page collects small, composable patterns built from Atomica primitives and Companion helpers.

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
