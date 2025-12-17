import { h } from 'atomica';
import { useRepo } from './RepoContext';

export const RepoSelector = () => {
  const repo = useRepo();

  return h(
    'div',
    { class: 'repo-selector' },
    h('label', null, 'Owner:', ' ',
      h('input', {
        value: () => repo.owner.get(),
        onInput: (e: Event) => repo.owner.set((e.target as HTMLInputElement).value)
      })
    ),
    h('label', null, 'Repo:', ' ',
      h('input', {
        value: () => repo.repo.get(),
        onInput: (e: Event) => repo.repo.set((e.target as HTMLInputElement).value)
      })
    )
  );
};
