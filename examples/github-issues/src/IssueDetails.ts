import { h, computed, type Signal } from 'atomica';
import type { IssuesResource } from './issuesResource';

type Props = {
  issues: IssuesResource;
  selectedIssue: Signal<number | null>;
};

export const IssueDetails = ({ issues, selectedIssue }: Props) => {
  const active = computed(() => {
    const num = selectedIssue.get();
    if (num == null) return null;
    return (issues.data() || []).find((issue) => issue.number === num) || null;
  });

  return h('div', { class: 'issue-details' }, () => {
    if (issues.loading()) {
      return h('p', null, 'Loading issues…');
    }
    const issue = active.get();
    if (!issue) {
      return h('p', { class: 'muted' }, 'Select an issue to see details.');
    }
    return h(
      'div',
      null,
      h('h3', null, `#${issue.number} — ${issue.title}`),
      h('p', null, 'State: ', issue.state),
      h('p', null, 'Author: ', issue.user.login),
      h(
        'p',
        null,
        h(
          'a',
          { href: issue.html_url, target: '_blank', rel: 'noreferrer' },
          'View on GitHub'
        )
      )
    );
  });
};
