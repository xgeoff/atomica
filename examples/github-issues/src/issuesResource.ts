import { resource, signal, type ReadonlySignal, type Resource } from 'atomica';
import type { RepoSelection } from './RepoContext';

export type Issue = {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  user: { login: string };
};

export type IssuesResource = Resource<Issue[]>;

export function createIssuesResource(repo: RepoSelection): { issues: IssuesResource; state: ReadonlySignal<string> } {
  const stateText = signal('idle');

  const issues = resource<Issue[]>(
    async () => {
      const owner = repo.owner.get().trim();
      const name = repo.repo.get().trim();
      if (!owner || !name) return [];
      const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/issues?state=all&per_page=50`;
      stateText.set(`loading ${owner}/${name}`);
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      });
      if (!response.ok) {
        throw new Error(`GitHub responded ${response.status}`);
      }
      const data = (await response.json()) as Issue[];
      stateText.set(`loaded ${data.length} issues`);
      return data;
    },
    { auto: true }
  );

  return { issues, state: { get: () => stateText.get(), peek: () => stateText.peek() } };
}
