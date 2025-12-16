import { VNode } from './index';

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
