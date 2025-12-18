import { h, effect, signal } from 'atomica';

type Props = {
  components: string[];
};

export const DiagnosticsPanel = ({ components }: Props) => {
  const tick = signal(0);
  const dev = (globalThis as any).__ATOMICA_DEV__;

  effect(() => {
    const id = setInterval(() => tick.set((t) => t + 1), 750);
    return () => clearInterval(id);
  });

  const count = (name: string) => dev?.components?.get(name) ?? 0;
  const signalUpdates = () => dev?.signals?.updates ?? 0;
  const computedRuns = () => {
    if (!dev?.computeds) return 0;
    return Array.from(dev.computeds.values()).reduce((a: number, b: number) => a + b, 0);
  };

  return h(
    'div',
    { class: 'diagnostics' },
    h('h3', null, 'Diagnostics'),
    h(
      'ul',
      null,
      components.map((name) =>
        h(
          'li',
          { key: name },
          h('strong', null, `${name}: `),
          () => {
            tick.get();
            return `${count(name)} constructions`;
          }
        )
      )
    ),
    h('p', null, () => {
      tick.get();
      return `Signals: ${signalUpdates()} | Computeds: ${computedRuns()}`;
    }),
    h('p', { class: 'muted' }, 'If these numbers rise without interaction, invariants are broken.')
  );
};
