import { h } from 'atomica';
import { type Signal, registerComponent } from 'atomica';

type Props = {
  messages: Signal<{ time: string; value: number; url: string }[]>;
};

export const ChannelViewer = ({ messages }: Props) => {
  registerComponent('ChannelViewer');

  return h(
    'div',
    { class: 'panel' },
    h('p', null, 'Channel subscribers receive broadcasts from the service.'),
    h('ul', null,
      () => {
        const list = messages.get();
        if (!list.length) return h('li', { class: 'muted' }, 'No messages yet.');
        return list.map((msg) =>
          h(
            'li',
            { key: msg.time },
            h('div', null, `Value: ${msg.value.toFixed(3)}`),
            h('div', { class: 'muted' }, msg.time)
          )
        );
      }
    )
  );
};
