import { h, effect, signal } from 'atomica';

type Props = {
  components: string[];
};

export const DiagnosticsPanel = ({ components }: Props) => {
  const tick = signal(0);

  effect(() => {
    const interval = setInterval(() => tick.set((t) => t + 1), 1000);
    return () => clearInterval(interval);
  });

  const dev = (globalThis as any).__ATOMICA_DEV__;

  const formatCount = (name: string) => {
    if (!dev?.components) return '-';
    return dev.components.get(name) ?? 0;
  };

  const totalSignals = () => dev?.signals?.updates ?? 0;

  const totalComputeds = () => {
    if (!dev?.computeds) return 0;
    return Array.from(dev.computeds.values()).reduce((a: number, b: number) => a + b, 0);
  };

  return h(
    'div',
    { class: 'diagnostics' },
    h('p', null, 'Live counters prove single-run components.'),
    h(
      'ul',
      null,
      components.map((name) =>
        h(
          'li',
          { key: name },
          h('strong', null, `${name}: `),
          () => {
            tick.get(); // track updates
            return `${formatCount(name)} constructions`;
          }
        )
      )
    ),
    h('p', null, () => {
      tick.get();
      return `Signal updates: ${totalSignals()} | Computed runs: ${totalComputeds()}`;
    }),
    h('p', { class: 'muted' }, 'If these counters grow without interaction, semantics are broken.')
  );
};
