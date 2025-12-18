# Atomica GitHub Issues Viewer

This sample app pressure-tests Atomica v0.2 semantics with real async data, shared state, derived filtering, and diagnostics proof of single-run components. It is intentionally constrained: no new primitives, no memo, no global stores, no router.

## What this app is testing
- `resource()` latest-wins behavior against the GitHub Issues API.
- Signal-driven context for repo selection (owner + repo as signals).
- Derived client-side filtering without re-rendering components.
- Diagnostics proving components construct once while signals/computeds churn.

## Validated guarantees
- Components execute exactly once; bindings handle all updates.
- Reactivity lives in expressions; changing signals does not re-run components.
- Context is lexical but reactive when you provide signals.
- `resource()` is pull-based; manual refresh is explicit, `auto` is opt-in.
- Diagnostics reflect reality: constructions stay at 1, counters move instead.

## Observed Friction / Surprises
- Diagnostics are dev-only; polling them requires manual wiring (timer in DiagnosticsPanel).
- Rapid repo switching relies on latest-wins in resources; there is no implicit cancellation.
- Comments fetching is a separate resource; wiring multiple resources without a shared store feels verbose but keeps boundaries explicit.
- Fetching nonexistent/private repos yields 404s; unauthenticated GitHub API is rate-limited.
- React instincts (waiting for re-renders, expecting context to update by itself) must be unlearned.

These friction points are intentional unless diagnostics demonstrate a correctness or performance issue.

## Running
```bash
pnpm --filter @atomica/example-github-issues dev
```
Open http://localhost:4174 (or the port Vite prints). Use the controls to change owner/repo, switch filters, select issues, and hit Refresh. GitHub’s unauthenticated API is rate-limited; if you hit limits or see 404s, use a public repo that exists (defaults use facebook/react) or wait for the limit window to reset.

## Diagnostics output examples
- Components: `App:1, RepoSelector:1, IssueList:1, IssueDetails:1, IssueStats:1, DiagnosticsPanel:1`
- Signals/computeds: `signal updates=12; computed runs=5` (these numbers grow with interaction, components do not)

## Known awkward or surprising parts
- Diagnostics polling is manual via a tiny timer because diagnostics are dev-only and not reactive.
- GitHub rate limits can surface errors; this is surfaced as resource error state.
- Filtering is purely client-side; large repos will still fetch all issues (to avoid adding new primitives).

If something here feels harder than React, that is intentional unless diagnostics prove otherwise.
