# Creating a Project with Atomica

This is a minimal, step-by-step setup for a new Atomica site using Vite and TypeScript.

## Prereqs
- Node.js 18+
- pnpm (or npm/yarn)

If you do not have pnpm:
```bash
npm install -g pnpm
```

## 1) Create a Vite project
```bash
pnpm create vite my-atomica-site --template vanilla-ts
cd my-atomica-site
```

## 2) Install Atomica
```bash
pnpm add atomica
```

## 3) Add a mount point
Edit `index.html`:
```html
<div id="app"></div>
```

## 4) Write your entry file
Create or edit `src/main.ts`:
```ts
import { h, mount, signal } from 'atomica';

const count = signal(0);

const App = () =>
  h('button', { onClick: () => count.set((c) => c + 1) }, () => `Count: ${count.get()}`);

const root = document.getElementById('app');
if (root) {
  mount(h(App, {}), root);
}
```

## 5) Run the dev server
```bash
pnpm dev
```

## Optional: JSX
If you want JSX, add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "atomica/dom"
  }
}
```

JSX compiles to `h(...)`; the mental model stays the same.

## Build output (what you deploy)
Vite builds a static folder, usually `dist/`, containing plain HTML/CSS/JS assets:
```
dist/
  index.html
  assets/
    index-7f3c1c2a.js
    index-3a8b9d7e.css
```

The generated `dist/index.html` will look like this (hashed filenames are normal):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Atomica Site</title>
    <link rel="stylesheet" href="/assets/index-3a8b9d7e.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/assets/index-7f3c1c2a.js"></script>
  </body>
</html>
```

You can deploy `dist/` to any static host or CDN.

## Custom output names and multiple entry points
Hashed filenames are the default because they are safe for long-term caching. If you want stable names, configure Vite’s Rollup output:
```ts
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/chunk-[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
```

For multiple entry points, add multiple HTML files. Each HTML file references its own entry module:
```html
<!-- index.html -->
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>

<!-- admin.html -->
<div id="admin"></div>
<script type="module" src="/src/admin.ts"></script>
```

Vite will build both pages into `dist/` with separate bundles.
