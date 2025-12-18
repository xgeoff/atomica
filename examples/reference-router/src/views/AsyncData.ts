import { h, resource, signal } from 'atomica';

const makeResource = () =>
  resource<{ time: string }>(
    async () => {
      await new Promise((res) => setTimeout(res, 150));
      return { time: new Date().toISOString() };
    },
    { auto: true }
  );

export const AsyncData = () => {
  const res = makeResource();
  const counter = signal(0);

  return h(
    'div',
    { class: 'view' },
    h('h2', null, 'Async route (resource-driven)'),
    h('p', null, 'Latest-wins applies; navigation does not cancel.'),
    h(
      'div',
      { class: 'row' },
      h('button', { onClick: () => res.refresh(), class: 'btn' }, 'Refresh'),
      h('button', { onClick: () => counter.set((c) => c + 1), class: 'btn secondary' }, 'Bump signal')
    ),
    h('p', null, () => (res.loading() ? 'Loading…' : `Timestamp: ${res.data()?.time ?? '-'}`)),
    h('p', { class: 'muted' }, () => `Counter: ${counter.get()}`)
  );
};
