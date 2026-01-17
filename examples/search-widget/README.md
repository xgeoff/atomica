# Atomica Search Widget (Drop-in Component)

This example shows a self-contained component that bundles HTML, CSS, and JS into a reusable widget. It mounts into a single DOM node and manages its own reactive state.

## Run
```bash
pnpm --filter @atomica/example-search-widget dev
```

## What it demonstrates
- Encapsulated component with local signals
- Explicit async search via `resource()`
- DOM updates driven by expressions, not re-renders
