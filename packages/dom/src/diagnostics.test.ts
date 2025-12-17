import { describe, expect, it } from 'vitest';
import { h, mount } from './index';
import { signal } from '@atomica/signals';
import { initDevDiagnostics } from '@atomica/shared';

const flush = () => Promise.resolve();

describe('diagnostics invariants', () => {
  it('components run once even with signal updates', async () => {
    (globalThis as any).__ATOMICA_DEV__?.reset?.();
    initDevDiagnostics();

    const count = signal(0);
    const App = () => h('div', null, () => count.get());
    const container = document.createElement('div');

    const dispose = mount(h(App, {}), container, { dev: true });

    for (let i = 0; i < 12; i += 1) {
      count.set((v) => v + 1);
    }
    await flush();

    const dev = (globalThis as any).__ATOMICA_DEV__;
    const total = dev?.components
      ? Array.from(dev.components.values()).reduce((a: number, b: number) => a + b, 0)
      : 0;
    const signalUpdates = dev?.signals?.updates ?? 0;

    expect(total).toBe(1);
    expect(signalUpdates).toBeGreaterThanOrEqual(0);

    dispose();
  });
});
