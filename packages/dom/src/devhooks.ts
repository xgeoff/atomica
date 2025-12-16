import { __DEV__ } from '@atomica/shared';

export type DevHooks = {
  onComponentRender?: (component: (...args: any[]) => any) => void;
  onDomMutation?: (nodes: Node[], action: 'insert' | 'remove') => void;
};

let hooks: DevHooks | null = null;

export function setDevHooks(next: DevHooks | null): () => void {
  if (!__DEV__) return () => {};
  hooks = next;
  return () => {
    if (hooks === next) {
      hooks = null;
    }
  };
}

export function getDevHooks(): DevHooks | null {
  return __DEV__ ? hooks : null;
}
