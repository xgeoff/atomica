import { describe, expect, it } from 'vitest';
import { h, mount } from './index';
import { signal } from '@atomica/signals';

const flush = () => Promise.resolve();

describe('diagnostics invariants', () => {
  it('components run once even with signal updates', async () => {
    (globalThis as any).__ATOMICA_DEV__?.reset?.();

    const count = signal(0);
    const App = () => h('div', null, () => count.get());
    const container = document.createElement('div');

    const dispose = mount(h(App, {}), container, { dev: true });

    count.set(1);
    count.set(2);
    await flush();

    const dev = (globalThis as any).__ATOMICA_DEV__;
    const total = dev?.components
      ? Array.from(dev.components.values()).reduce((a: number, b: number) => a + b, 0)
      : 0;

    expect(total).toBe(1);

    dispose();
  });
});
