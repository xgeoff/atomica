import type { Component } from 'atomica/dom';
import { Home } from './views/Home';
import { Issues } from './views/Issues';
import { AsyncData } from './views/AsyncData';

export type Route = {
  path: string;
  View: Component<any>;
};

export const routes: Route[] = [
  { path: '/', View: Home },
  { path: '/issues', View: Issues },
  { path: '/async', View: AsyncData }
];
