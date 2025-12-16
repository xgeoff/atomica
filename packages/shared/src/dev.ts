import { __DEV__ } from './index.js';

type CounterMap = Map<string, number>;

export interface AtomicaDev {
  components: CounterMap;
  signals: { updates: number };
  computeds: CounterMap;
  component(name?: string): void;
  signalUpdate(): void;
  computedRun(name?: string): void;
  summary(): string;
  reset(): void;
}

const DEV_KEY = '__ATOMICA_DEV__';

export function initDevDiagnostics(): AtomicaDev | null {
  if (!__DEV__) return null;
  const g = globalThis as any;
  if (!g[DEV_KEY]) {
    const components: CounterMap = new Map();
    const computeds: CounterMap = new Map();
    const signals = { updates: 0 };

    g[DEV_KEY] = {
      components,
      computeds,
      signals,
      component(name = 'component') {
        const next = (components.get(name) || 0) + 1;
        components.set(name, next);
      },
      signalUpdate() {
        signals.updates += 1;
      },
      computedRun(name = 'computed') {
        const next = (computeds.get(name) || 0) + 1;
        computeds.set(name, next);
      },
      summary() {
        const compEntries = Array.from(components.entries())
          .map(([k, v]) => `${k}:${v}`)
          .join(', ');
        const compText = compEntries || 'components:none';
        const sigText = `signal updates=${signals.updates}`;
        const compRuns = Array.from(computeds.entries())
          .map(([k, v]) => `${k}:${v}`)
          .join(', ');
        const compRunText = compRuns || 'computeds:none';
        return `${compText}; ${sigText}; ${compRunText}`;
      },
      reset() {
        components.clear();
        computeds.clear();
        signals.updates = 0;
      }
    } as AtomicaDev;
  }
  return g[DEV_KEY] as AtomicaDev;
}

export function getDevDiagnostics(): AtomicaDev | null {
  if (!__DEV__) return null;
  const g = globalThis as any;
  return (g && g[DEV_KEY]) || null;
}
