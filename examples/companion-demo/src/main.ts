import { h, mount } from 'atomica';
import { App } from './App';
import './style.css';

const root = document.getElementById('app');

if (root) {
  mount(h(App, {}), root, { dev: true });
}
