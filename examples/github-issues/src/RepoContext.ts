import { context, signal } from 'atomica';

export type RepoSelection = {
  owner: ReturnType<typeof signal<string>>;
  repo: ReturnType<typeof signal<string>>;
};

const RepoContext = context<RepoSelection>({
  owner: signal('solidjs'),
  repo: signal('solid')
});

export function provideRepo<R>(value: RepoSelection, fn: () => R): R {
  return RepoContext.provide(value, fn);
}

export function useRepo(): RepoSelection {
  return RepoContext.use();
}
