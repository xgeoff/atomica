import { h, signal, createService, createChannel, registerComponent } from 'atomica';
import { ServiceView } from './ServiceView';
import { ChannelViewer } from './ChannelViewer';

const mockFetcher = async (url: string) => {
  // simulate backend with delay
  await new Promise((res) => setTimeout(res, 150));
  return new Response(JSON.stringify({ url, time: new Date().toISOString(), value: Math.random() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

const service = createService({ fetcher: mockFetcher });
const broadcast = createChannel<{ time: string; value: number; url: string }>();

export const App = () => {
  registerComponent('App');
  const messages = signal<{ time: string; value: number; url: string }[]>([]);

  broadcast.subscribe((payload) => {
    messages.set((prev) => [payload, ...prev].slice(0, 5));
  });

  return h(
    'div',
    { class: 'page' },
    h('header', { class: 'header' },
      h('h1', null, 'Companion demo (service + channel)')
    ),
    h(
      'div',
      { class: 'grid' },
      h(ServiceView, { service, broadcast }),
      h(ChannelViewer, { messages })
    ),
    h('footer', { class: 'muted' }, 'Service uses resource(); Channel broadcasts results to multiple consumers.')
  );
};
