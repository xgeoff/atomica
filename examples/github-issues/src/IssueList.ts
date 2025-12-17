import { h, computed, type ReadonlySignal, type Signal } from 'atomica';
import type { IssuesResource, Issue } from './issuesResource';

type Props = {
  issues: IssuesResource;
  filter: Signal<'all' | 'open' | 'closed'>;
  selectedIssue: Signal<number | null>;
};

export const IssueList = ({ issues, filter, selectedIssue }: Props) => {
  const filtered: ReadonlySignal<Issue[]> = computed(() => {
    const list = issues.data() || [];
    const mode = filter.get();
    if (mode === 'all') return list;
    return list.filter((issue) => issue.state === mode);
  });

  return h(
    'div',
    { class: 'issue-list' },
    () => {
      if (issues.error()) {
        const err = issues.error() as Error;
        return h('div', { class: 'error' }, 'Error: ', err?.message || String(err));
      }
      const list = filtered.get();
      if (!issues.loading() && list.length === 0) {
        return h('div', { class: 'empty' }, 'No issues for this repo / filter.');
      }
      return h(
        'ul',
        null,
        list.map((issue) =>
          h(
            'li',
            {
              key: issue.id,
              class: () => (selectedIssue.get() === issue.number ? 'selected' : ''),
              onClick: () => selectedIssue.set(issue.number)
            },
            h('div', { class: 'issue-title' }, `#${issue.number} — ${issue.title}`),
            h('div', { class: 'issue-meta' }, `${issue.state} by ${issue.user.login}`)
          )
        )
      );
    }
  );
};
