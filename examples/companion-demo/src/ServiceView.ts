import { h, signal, registerComponent, type Channel, type createService } from 'atomica';

type Props = {
  service: ReturnType<typeof createService>;
  broadcast: Channel<{ time: string; value: number; url: string }>;
};

export const ServiceView = ({ service, broadcast }: Props) => {
  registerComponent('ServiceView');
  const endpoint = signal('/api/data');
  const { resource, channel } = service.get<{ time: string; value: number; url: string }>(endpoint.get());

  channel.subscribe((data) => broadcast.publish(data));

  return h(
    'div',
    { class: 'panel' },
    h('p', null, 'Call a service (mock fetch) and broadcast the result on a channel.'),
    h(
      'div',
      { class: 'row' },
      h('input', {
        value: () => endpoint.get(),
        onInput: (e: Event) => endpoint.set((e.target as HTMLInputElement).value)
      }),
      h('button', { class: 'btn', onClick: () => resource.refresh() }, 'Fetch')
    ),
    h('p', { class: 'muted' }, () => (resource.loading() ? 'Loading…' : 'Idle')),
    h(
      'div',
      { class: 'result' },
      () => {
        const data = resource.data();
        if (resource.error()) {
          return h('div', { class: 'error' }, 'Error: ', String(resource.error()));
        }
        if (!data) return h('div', { class: 'muted' }, 'No data yet.');
        return h('pre', null, JSON.stringify(data, null, 2));
      }
    )
  );
};
