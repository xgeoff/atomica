import { h, computed, type Signal } from 'atomica';
import type { IssuesResource } from './issuesResource';
import { createCommentsResource } from './commentsResource';
import { useRepo } from './RepoContext';

type Props = {
  issues: IssuesResource;
  selectedIssue: Signal<number | null>;
};

export const IssueDetails = ({ issues, selectedIssue }: Props) => {
  const repo = useRepo();
  const active = computed(() => {
    const num = selectedIssue.get();
    if (num == null) return null;
    return (issues.data() || []).find((issue) => issue.number === num) || null;
  });
  const comments = createCommentsResource(repo, () => selectedIssue.get());

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
      ),
      h('div', { class: 'comments' },
        h('h4', null, 'Comments'),
        () => {
          if (comments.loading()) return h('p', null, 'Loading comments…');
          if (comments.error()) {
            const err = comments.error() as Error;
            return h('p', { class: 'error' }, `Error loading comments: ${err?.message || err}`);
          }
          const list = comments.data() || [];
          if (!list.length) return h('p', { class: 'muted' }, 'No comments (or comments not visible unauthenticated).');
          return h(
            'ul',
            null,
            list.map((comment) =>
              h(
                'li',
                { key: comment.id },
                h('div', { class: 'comment-head' }, comment.user.login),
                h('div', { class: 'comment-body' }, comment.body)
              )
            )
          );
        }
      )
    );
  });
};
