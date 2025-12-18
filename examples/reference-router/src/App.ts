import { h, computed } from 'atomica';
import { routes } from './routes';
import { Link } from './Link';
import { usePath } from './router';
import { DiagnosticsPanel } from './DiagnosticsPanel';

export const App = () => {
  const path = usePath();

  const activeRoute = computed(() => {
    const current = path.get();
    return routes.find((r) => r.path === current) || routes[0];
  });

  return h(
    'div',
    { class: 'page' },
    h(
      'header',
      { class: 'header' },
      h('h1', null, 'Reference Router (signals + expressions)'),
      h('nav', null,
        h(Link, { to: '/' }, 'Home'),
        h(Link, { to: '/issues' }, 'Issues'),
        h(Link, { to: '/async' }, 'Async')
      )
    ),
    h('main', { class: 'main' }, () => {
      const route = activeRoute.get();
      return h(route.View, {});
    }),
    h(
      'section',
      { class: 'panel diagnostics' },
      h(DiagnosticsPanel, {
        components: ['App', 'Link', 'Home', 'Issues', 'AsyncData']
      })
    ),
    h('footer', { class: 'muted' }, 'Routing is state. Components run once. Expressions do the work.')
  );
};
