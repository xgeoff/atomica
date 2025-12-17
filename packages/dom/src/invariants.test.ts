import { describe, expect, it } from 'vitest';
import { context, h, mount } from './index';
import { signal } from '@atomica/signals';

const flush = () => Promise.resolve();

describe('core invariants', () => {
  it('constructs components once despite signal churn', async () => {
    const count = signal(0);
    let renders = 0;

    const App = () => {
      renders += 1;
      return h('div', null, h('p', null, () => `Count: ${count.get()}`));
    };

    const container = document.createElement('div');
    const dispose = mount(h(App, {}), container, { dev: true });

    for (let i = 0; i < 12; i += 1) {
      count.set((prev) => prev + 1);
    }

    await flush();

    expect(renders).toBe(1);
    expect(container.textContent).toContain('Count: 12');

    dispose();
  });

  it('resolves nearest context provider and snapshots non-reactive values', () => {
    const Theme = context('light');
    const resolved: string[] = [];

    Theme.provide('outer', () => {
      resolved.push(Theme.use());
      Theme.provide('inner', () => resolved.push(Theme.use()));
    });

    resolved.push(Theme.use());

    expect(resolved).toEqual(['outer', 'inner', 'light']);

    const themeValue = signal('forest');
    const snapshots: string[] = [];

    Theme.provide(themeValue.get(), () => {
      themeValue.set('night');
      snapshots.push(Theme.use());
    });

    expect(snapshots).toEqual(['forest']);

    const LiveTheme = context(signal('sea'));
    const liveReads: string[] = [];
    const live = signal('dusk');

    LiveTheme.provide(live, () => {
      const provided = LiveTheme.use();
      liveReads.push(provided.get());
      live.set('dawn');
      liveReads.push(provided.get());
    });

    expect(liveReads).toEqual(['dusk', 'dawn']);
  });
});
