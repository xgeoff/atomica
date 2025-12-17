import { describe, expect, it } from 'vitest';
import { h, mount } from './index';
import { signal } from '@atomica/signals';
import { jsx, jsxs } from './jsx-runtime';
import { setDevHooks } from './devhooks';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('fine-grained DOM updates', () => {
  it('updates only the bound text node and avoids re-rendering components', () => {
    const count = signal(0);
    let renders = 0;
    const getTextNode = () => {
      const valueEl = container.querySelector('#value');
      if (!valueEl) return null;
      return Array.from(valueEl.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
    };

    const App = () => {
      renders += 1;
      return h(
        'div',
        null,
        h('span', { id: 'label' }, 'Label'),
        h('span', { id: 'value' }, () => count.get())
      );
    };

    const container = document.createElement('div');
    const dispose = mount(h(App, {}), container, { dev: true });

    const valueNode = getTextNode();
    expect(renders).toBe(1);
    expect(valueNode?.textContent).toBe('0');

    count.set(1);

    const updatedNode = getTextNode();
    expect(renders).toBe(1);
    expect(updatedNode?.textContent).toBe('1');
    expect(
      Array.from(container.querySelector('#value')!.childNodes).filter(
        (node) => node.nodeType === Node.TEXT_NODE
      ).length
    ).toBe(1);

    dispose();
  });

  it('updates only the targeted attribute without replacing nodes', () => {
    const theme = signal('light');

    const container = document.createElement('div');
    const dispose = mount(
      h('div', null, h('div', { id: 'box', class: () => theme.get() })),
      container,
      { dev: true }
    );

    const box = container.querySelector('#box') as HTMLElement;
    const initialNode = box;
    expect(box.className).toBe('light');

    theme.set('dark');
    const updatedBox = container.querySelector('#box') as HTMLElement;
    expect(updatedBox).toBe(initialNode);
    expect(updatedBox.className).toBe('dark');

    dispose();
  });

  it('keeps keyed list items stable across reorders', async () => {
    const items = signal([
      { id: 1, label: 'A' },
      { id: 2, label: 'B' }
    ]);

    const container = document.createElement('div');
    const dispose = mount(
      h('ul', null, () => items.get().map((item) => h('li', { key: item.id }, item.label))),
      container,
      { dev: true }
    );

    const initialItems = Array.from(container.querySelectorAll('li'));
    expect(initialItems.map((li) => li.textContent)).toEqual(['A', 'B']);

    items.set([
      { id: 2, label: 'B' },
      { id: 1, label: 'A' }
    ]);

    await flush();
    await flush();

    const markup = container.innerHTML;
    expect(markup).toContain('<li>B</li><li>A</li>');
    const liCount = (markup.match(/<li>/g) || []).length;
    expect(liCount).toBe(initialItems.length);

    dispose();
  });
});

describe('JSX neutrality', () => {
  it('renders JSX output identically to h()', () => {
    const containerA = document.createElement('div');
    const containerB = document.createElement('div');

    const vnodeFromH = h('div', { class: 'wrap' }, 'hello ', h('span', null, 'there'));

    const vnodeFromJsx = jsxs('div', {
      class: 'wrap',
      children: ['hello ', jsx('span', { children: 'there' })]
    });

    const disposeA = mount(vnodeFromH, containerA, { dev: true });
    const disposeB = mount(vnodeFromJsx, containerB, { dev: true });

    expect(containerA.innerHTML).toBe(containerB.innerHTML);

    disposeA();
    disposeB();
  });

  it('core renderer does not rely on JSX runtime', () => {
    const calls: string[] = [];
    const disposeHook = setDevHooks({
      onComponentRender: () => calls.push('render'),
      onDomMutation: () => calls.push('dom')
    });

    const container = document.createElement('div');
    const vnode = h('div', null, 'plain h');
    const dispose = mount(vnode, container, { dev: true });

    expect(container.textContent).toBe('plain h');
    expect(calls).toContain('dom');

    dispose();
    disposeHook();
  });
});
