import { resource, signal, type Resource } from 'atomica';
import type { RepoSelection } from './RepoContext';

export type Comment = {
  id: number;
  user: { login: string };
  body: string;
  html_url: string;
};

export function createCommentsResource(repo: RepoSelection, issueNumber: () => number | null): Resource<Comment[]> {
  const inflight = signal(issueNumber());
  let version = 0;

  const comments = resource<Comment[]>(
    async () => {
      const currentVersion = ++version;
      const currentIssue = issueNumber();
      inflight.set(currentIssue);
      if (currentIssue == null) return [];
      const owner = repo.owner.get().trim();
      const name = repo.repo.get().trim();
      if (!owner || !name) return [];
      // Artificial delay to amplify race conditions
      await new Promise((res) => setTimeout(res, 200));
      const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        name
      )}/issues/${currentIssue}/comments?per_page=30`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'atomica-sample-app'
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        const text = await response.text();
        throw new Error(`Comments fetch failed with ${response.status}: ${text || response.statusText}`);
      }
      const data = (await response.json()) as Comment[];
      if (inflight.peek() !== currentIssue || currentVersion !== version) {
        return []; // stale
      }
      return data;
    },
    { auto: true }
  );

  return comments;
}
