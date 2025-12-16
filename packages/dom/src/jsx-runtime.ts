import { Fragment, h, VNode } from './index.js';

type PropsWithKey = Record<string, any> & { key?: any };

export function jsx(type: any, props: PropsWithKey, key?: any): VNode {
  const finalProps = key === undefined ? props : { ...props, key };
  return h(type, finalProps);
}

export const jsxs = jsx;
export const jsxDEV = jsx;

export { Fragment };
