import { h } from 'atomica';
import { signal } from 'atomica';
import { provideRepo } from './RepoContext';
import { createIssuesResource } from './issuesResource';
import { RepoSelector } from './RepoSelector';
import { IssueList } from './IssueList';
import { IssueDetails } from './IssueDetails';
import { IssueStats } from './IssueStats';
import { DiagnosticsPanel } from './DiagnosticsPanel';

export const App = () => {
  const owner = signal('facebook');
  const repo = signal('react');
  const filter = signal<'all' | 'open' | 'closed'>('open');
  const selectedIssue = signal<number | null>(null);

  const { issues, state } = createIssuesResource({ owner, repo });

  const refresh = () => {
    issues.refresh();
  };

  return provideRepo({ owner, repo }, () =>
    h(
      'div',
      { class: 'page' },
      h('header', { class: 'header' },
        h('div', { class: 'title' },
          h('h1', null, 'Atomica GitHub Issues Viewer'),
          h('p', null, 'Pressure-test signals, context, and resources against real data.')
        ),
        h('div', { class: 'controls' },
          h(RepoSelector, {}),
          h('div', { class: 'filter' },
            h('label', null, 'Filter: '),
            h('select', {
              value: () => filter.get(),
              onChange: (e: Event) => {
                const value = (e.target as HTMLSelectElement).value as 'all' | 'open' | 'closed';
                filter.set(value);
              }
            },
            h('option', { value: 'open' }, 'Open'),
            h('option', { value: 'closed' }, 'Closed'),
            h('option', { value: 'all' }, 'All'))
          ),
          h('button', { class: 'btn', onClick: refresh }, 'Refresh')
        )
      ),
      h('main', { class: 'layout' },
        h('section', { class: 'panel list' },
          h('div', { class: 'panel-head' },
            h('h2', null, 'Issues'),
            h('p', { class: 'status' }, () => issues.loading() ? 'Loading…' : state.get())
          ),
          h(IssueList, { issues, filter, selectedIssue })
        ),
        h('section', { class: 'panel details' },
          h('div', { class: 'panel-head' }, h('h2', null, 'Details')),
          h(IssueDetails, { issues, selectedIssue })
        ),
        h('section', { class: 'panel stats' },
          h('div', { class: 'panel-head' }, h('h2', null, 'Stats')),
          h(IssueStats, { issues })
        ),
        h('section', { class: 'panel diagnostics' },
          h('div', { class: 'panel-head' }, h('h2', null, 'Diagnostics')),
          h(DiagnosticsPanel, {
            components: ['App', 'RepoSelector', 'IssueList', 'IssueDetails', 'IssueStats', 'DiagnosticsPanel']
          })
        )
      ),
      h('footer', { class: 'footer' },
        h('p', null, 'Latest-wins enforced by resource(); context drives repo selection; components stay single-run.')
      )
    )
  );
};
