import { __DEV__, Disposer, devWarn, isArray, isFunction } from '@atomica/shared';
import { effect } from '@atomica/signals';
import { initDevDiagnostics, getDevDiagnostics } from '@atomica/shared';
import { getDevHooks } from './devhooks.js';
// PUBLIC API — v0.2 LOCKED
export { context } from './context.js';

export type Component<P = {}> = (props: P & { children?: any }) => VNodeChild;

export type VNodeChild =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | VNodeChild[];

export interface VNode<P = any> {
  type: VNodeType<P>;
  props: (P & { children?: VNodeChild[] }) | null;
  key?: string | number;
}

export type VNodeType<P = any> = string | Component<P> | typeof Fragment | typeof TextNode;

export interface MountOptions {
  hydrate?: boolean;
  dev?: boolean;
}

const Fragment = Symbol('Atomica.Fragment');
const TextNode = Symbol('Atomica.Text');

type Key = string | number | undefined;

interface MountedChild {
  key?: Key;
  nodes: Node[];
  dispose: Disposer;
  value: VNodeChild;
}

interface RenderContext {
  dev: boolean;
}

const mountedContainers = new WeakMap<Element, Disposer>();

// PUBLIC API — v0.2 LOCKED
export function h<P>(
  type: VNodeType<P>,
  props: (P & { children?: VNodeChild[]; key?: Key }) | null,
  ...restChildren: VNodeChild[]
): VNode<P> {
  const key = props && 'key' in props ? (props as any).key : undefined;
  const normalizedProps: any = props ? { ...props } : {};

  if (key !== undefined) {
    delete normalizedProps.key;
  }

  const mergedChildren = [
    ...(normalizedProps.children ? normalizeChildList(normalizedProps.children) : []),
    ...flatten(restChildren)
  ];
  if (mergedChildren.length) {
    normalizedProps.children = mergedChildren;
  }

  return {
    type,
    props: normalizedProps,
    key
  };
}

export function text(value: string | number): VNode {
  return {
    type: TextNode,
    props: { value },
    key: undefined
  };
}

export function fragment(...children: VNodeChild[]): VNode {
  return {
    type: Fragment,
    props: { children },
    key: undefined
  };
}

export function component<P>(fn: Component<P>): Component<P> {
  return fn;
}

export function mount(
  root: Component | VNode,
  container: Element,
  options?: MountOptions
): Disposer {
  const devMode = __DEV__ && (options?.dev ?? __DEV__);
  const ctx: RenderContext = {
    dev: devMode
  };

  if (options?.hydrate) {
    devWarn('Hydration is not implemented yet; mounting normally.');
  }

  if (ctx.dev) {
    initDevDiagnostics();
  }

  const vnode = isFunction(root) ? h(root as Component, {}) : (root as VNode);
  container.textContent = '';
  const mounted = mountChild(vnode, ctx);
  mounted.nodes.forEach((node) => container.appendChild(node));

  const dispose = () => {
    mounted.dispose();
    mountedContainers.delete(container);
  };

  mountedContainers.set(container, dispose);
  return dispose;
}

export function unmount(target: Element | Disposer): void {
  if (isFunction(target)) {
    target();
    return;
  }
  const disposer = mountedContainers.get(target);
  if (disposer) {
    disposer();
    mountedContainers.delete(target);
  }
  target.textContent = '';
}

export function bindText(node: Text, expr: () => string): Disposer {
  return effect(() => {
    const value = expr();
    node.textContent = value == null ? '' : String(value);
  });
}

export function bindAttr(el: Element, name: string, expr: () => any): Disposer {
  return effect(() => {
    const value = expr();
    if (value === false || value === null || value === undefined) {
      el.removeAttribute(name);
    } else {
      el.setAttribute(name, value === true ? '' : String(value));
    }
  });
}

export function bindProp(el: any, name: string, expr: () => any): Disposer {
  return effect(() => {
    const value = expr();
    setProp(el, name, value);
  });
}

export function bindChildRange(
  parent: Node & ParentNode,
  start: Comment,
  end: Comment,
  expr: () => VNodeChild,
  ctx: RenderContext
): Disposer {
  let mounted: MountedChild[] = [];

  const disposeEffect = effect(() => {
    const nextChildren = normalizeChildList(expr());
    if (ctx.dev && shouldWarnForKeys(nextChildren)) {
      devWarn('Missing `key` in array of sibling VNodes inside dynamic region.');
    }
    if (isKeyedList(nextChildren)) {
      mounted = patchKeyedChildren(parent, start, end, nextChildren, mounted, ctx);
    } else {
      mounted = replaceChildren(parent, start, end, nextChildren, mounted, ctx);
    }
  });

  return () => {
    disposeEffect();
    mounted.forEach((child) => child.dispose());
    clearBetween(parent, start, end);
    removeNode(start);
    removeNode(end);
  };
}

function mountChild(child: VNodeChild, ctx: RenderContext): MountedChild {
  if (child === null || child === undefined || child === false || child === true) {
    return {
      key: undefined,
      nodes: [],
      dispose: () => {},
      value: child
    };
  }

  if (isArray(child)) {
    const parts = child.map((c) => mountChild(c, ctx));
    return combineMounted(parts);
  }

  if (isVNode(child)) {
    return mountVNode(child, ctx);
  }

  return mountText(String(child), ctx);
}

function mountVNode(vnode: VNode, ctx: RenderContext): MountedChild {
  if (vnode.type === Fragment) {
    return mountFragment(vnode, ctx);
  }
  if (vnode.type === TextNode) {
    return mountTextVNode(vnode, ctx);
  }
  if (typeof vnode.type === 'function') {
    return mountComponent(vnode, ctx);
  }
  return mountElement(vnode as VNode<any>, ctx);
}

function mountComponent(vnode: VNode, ctx: RenderContext): MountedChild {
  const componentFn = vnode.type as Component;
  let rendered: VNodeChild;
  try {
    if (ctx.dev) {
      getDevDiagnostics()?.component(componentFn.name || 'component');
      getDevHooks()?.onComponentRender?.(componentFn);
    }
    rendered = componentFn({ ...(vnode.props || {}), children: vnode.props?.children });
  } catch (err) {
    if (ctx.dev) {
      const name = componentFn.name || 'Anonymous';
      devWarn(`Error while rendering component <${name}>: ${String(err)}`);
    }
    throw err;
  }
  const mounted = mountChild(rendered, ctx);
  return {
    key: vnode.key,
    nodes: mounted.nodes,
    dispose: () => {
      mounted.dispose();
    },
    value: vnode
  };
}

function mountElement(vnode: VNode<any>, ctx: RenderContext): MountedChild {
  const el = document.createElement(vnode.type as string);
  if (ctx.dev) {
    getDevHooks()?.onDomMutation?.([el], 'insert');
  }
  const disposers: Disposer[] = [];
  applyProps(el, vnode.props || {}, ctx, disposers);
  const children = normalizeChildren(vnode.props?.children);
  children.forEach((child) => {
    if (isFunction(child)) {
      const start = document.createComment('atomica:child-start');
      const end = document.createComment('atomica:child-end');
      el.appendChild(start);
      el.appendChild(end);
      disposers.push(bindChildRange(el, start, end, child as () => VNodeChild, ctx));
    } else {
      const mounted = mountChild(child, ctx);
      mounted.nodes.forEach((node) => el.appendChild(node));
      disposers.push(mounted.dispose);
    }
  });

  const dispose = () => {
    for (let i = disposers.length - 1; i >= 0; i -= 1) {
      disposers[i]();
    }
    if (ctx.dev) {
      getDevHooks()?.onDomMutation?.([el], 'remove');
    }
    el.remove();
  };

  return {
    key: vnode.key,
    nodes: [el],
    dispose,
    value: vnode
  };
}

function mountFragment(vnode: VNode, ctx: RenderContext): MountedChild {
  const children = normalizeChildren(vnode.props?.children);
  const parts = children.map((child) => mountChild(child, ctx));
  const mounted = combineMounted(parts);
  return {
    key: vnode.key,
    nodes: mounted.nodes,
    dispose: mounted.dispose,
    value: vnode
  };
}

function mountTextVNode(vnode: VNode, ctx: RenderContext): MountedChild {
  const node = document.createTextNode('');
  const value = (vnode.props as any)?.value;
  let dispose: Disposer = () => {
    if (ctx.dev) {
      getDevHooks()?.onDomMutation?.([node], 'remove');
    }
    node.remove();
  };

  if (isFunction(value)) {
    const binding = bindText(node, value as () => string);
    dispose = () => {
      binding();
      if (ctx.dev) {
        getDevHooks()?.onDomMutation?.([node], 'remove');
      }
      node.remove();
    };
  } else {
    node.textContent = value == null ? '' : String(value);
  }

  return {
    key: vnode.key,
    nodes: [node],
    dispose,
    value: vnode
  };
}

function mountText(value: string, _ctx: RenderContext): MountedChild {
  const node = document.createTextNode(value);
  // No ctx here; dev hook only fires if globally configured.
  getDevHooks()?.onDomMutation?.([node], 'insert');
  return {
    key: undefined,
    nodes: [node],
    dispose: () => {
      getDevHooks()?.onDomMutation?.([node], 'remove');
      node.remove();
    },
    value
  };
}

function applyProps(
  el: HTMLElement,
  props: Record<string, any>,
  ctx: RenderContext,
  disposers: Disposer[]
): void {
  Object.keys(props).forEach((name) => {
    if (name === 'children' || name === 'key') {
      return;
    }
    const value = props[name];
    if (name === 'ref' && isFunction(value)) {
      value(el);
      disposers.push(() => value(null));
      return;
    }
    if (name === 'class' || name === 'className') {
      if (isFunction(value)) {
        disposers.push(
          bindAttr(el, 'class', () => value())
        );
      } else {
        setClass(el, value);
      }
      return;
    }
    if (name === 'style') {
      if (isFunction(value)) {
        disposers.push(
          effect(() => {
            setStyle(el, value());
          })
        );
      } else {
        setStyle(el, value);
      }
      return;
    }
    if (isEventProp(name) && isFunction(value)) {
      const eventName = name.slice(2).toLowerCase();
      el.addEventListener(eventName, value as EventListener);
      return;
    }
    if (isFunction(value)) {
      disposers.push(bindProp(el, name, value));
      return;
    }
    setProp(el, name, value);
  });
}

function setProp(el: any, name: string, value: any): void {
  if (value === undefined || value === null) {
    if (name in el) {
      el[name] = null;
    } else {
      el.removeAttribute(name);
    }
    return;
  }

  if (name === 'class' || name === 'className') {
    setClass(el, value);
    return;
  }
  if (name === 'style') {
    setStyle(el, value);
    return;
  }

  if (name in el) {
    el[name] = value;
  } else {
    el.setAttribute(name, value === true ? '' : String(value));
  }
}

function setClass(el: Element, value: any): void {
  if (value === undefined || value === null || value === false) {
    (el as HTMLElement).removeAttribute('class');
    return;
  }
  if (isArray(value)) {
    (el as HTMLElement).className = value.filter(Boolean).join(' ');
    return;
  }
  if (typeof value === 'object') {
    const classes: string[] = [];
    Object.keys(value).forEach((key) => {
      if (value[key]) classes.push(key);
    });
    (el as HTMLElement).className = classes.join(' ');
    return;
  }
  (el as HTMLElement).className = String(value);
}

function setStyle(el: HTMLElement, value: any): void {
  if (value === undefined || value === null || value === false) {
    el.removeAttribute('style');
    return;
  }
  if (typeof value === 'string') {
    el.setAttribute('style', value);
    return;
  }
  if (typeof value === 'object') {
    el.removeAttribute('style');
    const style = el.style;
    Object.keys(value).forEach((key) => {
      const v = value[key];
      if (v === undefined || v === null || v === false) {
        style.removeProperty(toKebab(key));
      } else {
        style.setProperty(toKebab(key), String(v));
      }
    });
  }
}

function isVNode(value: any): value is VNode {
  return value && typeof value === 'object' && 'type' in value;
}

function flatten(children: VNodeChild[]): VNodeChild[] {
  const result: VNodeChild[] = [];
  children.forEach((child) => {
    if (isArray(child)) {
      result.push(...child);
    } else {
      result.push(child);
    }
  });
  return result;
}

function normalizeChildren(children: VNodeChild[] | undefined): VNodeChild[] {
  if (!children) return [];
  return flatten(children);
}

function normalizeChildList(value: VNodeChild): VNodeChild[] {
  if (isArray(value)) {
    return value.flatMap((v) => normalizeChildList(v));
  }
  if (value === null || value === undefined || value === false || value === true) {
    return [];
  }
  return [value];
}

function combineMounted(children: MountedChild[]): MountedChild {
  const nodes: Node[] = [];
  const disposers: Disposer[] = [];
  children.forEach((child) => {
    nodes.push(...child.nodes);
    disposers.push(child.dispose);
  });

  return {
    key: undefined,
    nodes,
    dispose: () => {
      for (let i = disposers.length - 1; i >= 0; i -= 1) {
        disposers[i]();
      }
    },
    value: children.map((c) => c.value)
  };
}

function replaceChildren(
  parent: ParentNode,
  start: Comment,
  end: Comment,
  next: VNodeChild[],
  prevMounted: MountedChild[],
  ctx: RenderContext
): MountedChild[] {
  prevMounted.forEach((child) => child.dispose());
  clearBetween(parent, start, end);
  const nextMounted: MountedChild[] = [];
  next.forEach((child) => {
    const mounted = mountChild(child, ctx);
    mounted.nodes.forEach((node) => parent.insertBefore(node, end));
    nextMounted.push(mounted);
  });
  return nextMounted;
}

function patchKeyedChildren(
  parent: ParentNode,
  _start: Comment,
  end: Comment,
  next: VNodeChild[],
  prevMounted: MountedChild[],
  ctx: RenderContext
): MountedChild[] {
  void _start;
  const oldByKey = new Map<Key, MountedChild>();
  prevMounted.forEach((child) => {
    if (child.key !== undefined) {
      oldByKey.set(child.key, child);
    }
  });

  const nextMounted: MountedChild[] = [];

  next.forEach((child) => {
    const key = getKey(child);
    if (key === undefined) {
      const mounted = mountChild(child, ctx);
      mounted.nodes.forEach((node) => parent.insertBefore(node, end));
      nextMounted.push(mounted);
      return;
    }

    const existing = oldByKey.get(key);
    if (existing && canReuse(existing.value, child)) {
      oldByKey.delete(key);
      existing.value = child;
      existing.nodes.forEach((node) => parent.insertBefore(node, end));
      nextMounted.push(existing);
    } else {
      const mounted = mountChild(child, ctx);
      mounted.nodes.forEach((node) => parent.insertBefore(node, end));
      nextMounted.push(mounted);
      if (existing) {
        existing.dispose();
        oldByKey.delete(key);
      }
    }
  });

  oldByKey.forEach((child) => child.dispose());
  return nextMounted;
}

function isKeyedList(children: VNodeChild[]): boolean {
  return children.every((child) => {
    if (!isVNode(child)) return false;
    return child.key !== undefined;
  });
}

function shouldWarnForKeys(children: VNodeChild[]): boolean {
  let vnodeCount = 0;
  let keyedCount = 0;
  children.forEach((child) => {
    if (isVNode(child)) {
      vnodeCount += 1;
      if (child.key !== undefined) keyedCount += 1;
    }
  });
  return vnodeCount > 1 && keyedCount < vnodeCount;
}

function canReuse(prev: VNodeChild, next: VNodeChild): boolean {
  if (isVNode(prev) && isVNode(next)) {
    return prev.type === next.type;
  }
  return false;
}

function getKey(child: VNodeChild): Key {
  return isVNode(child) ? child.key : undefined;
}

function clearBetween(parent: ParentNode, start: Comment, end: Comment): void {
  let node = start.nextSibling;
  while (node && node !== end) {
    const next = node.nextSibling;
    parent.removeChild(node);
    node = next;
  }
}

function removeNode(node: Node): void {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function isEventProp(name: string): boolean {
  return name.startsWith('on') && name.length > 2 && name[2] === name[2].toUpperCase();
}

function toKebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// PUBLIC API — v0.2 LOCKED
export { Fragment, TextNode };
