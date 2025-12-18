import { h, computed } from 'atomica';
import type { IssuesResource } from './issuesResource';

type Props = {
  issues: IssuesResource;
};

export const IssueStats = ({ issues }: Props) => {
  const totals = computed(() => {
    const list = issues.data() || [];
    const open = list.filter((i) => i.state === 'open').length;
    const closed = list.filter((i) => i.state === 'closed').length;
    return {
      total: list.length,
      open,
      closed
    };
  });

  return h(
    'div',
    { class: 'issue-stats' },
    h('p', { class: 'muted' }, 'Stats are derived lazily via computed()'),
    h('ul', null,
      h('li', null, () => `Total: ${totals.get().total}`),
      h('li', null, () => `Open: ${totals.get().open}`),
      h('li', null, () => `Closed: ${totals.get().closed}`)
    )
  );
};
