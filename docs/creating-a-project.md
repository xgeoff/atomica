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

## Base project layout (what this looks like on disk)
Here is a minimal layout with a few TypeScript modules and a CSS file:
```
my-atomica-site/
  index.html
  tsconfig.json
  vite.config.ts
  src/
    main.ts
    widgets/
      CounterWidget.ts
    pages/
      home.ts
    style.css
```

Example `index.html` (source):
```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

Example `src/main.ts`:
```ts
import { h, mount } from 'atomica';
import { Home } from './pages/home';
import './style.css';

const root = document.getElementById('app');
if (root) mount(h(Home, {}), root);
```

Example `src/pages/home.ts`:
```ts
import { h } from 'atomica';
import { CounterWidget } from '../widgets/CounterWidget';

export const Home = () =>
  h('main', null,
    h('h1', null, 'Welcome'),
    h(CounterWidget, {})
  );
```

Example `src/widgets/CounterWidget.ts`:
```ts
import { h, signal } from 'atomica';

export const CounterWidget = () => {
  const count = signal(0);
  return h('button', { onClick: () => count.set((c) => c + 1) }, () => `Count: ${count.get()}`);
};
```

Example `src/style.css`:
```css
body { font-family: system-ui, sans-serif; }
main { padding: 2rem; }
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

For multiple entry points, add multiple HTML files in your source. Each HTML file references its own entry module:
```html
<!-- index.html -->
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>

<!-- admin.html -->
<div id="admin"></div>
<script type="module" src="/src/admin.ts"></script>
```

Vite will build both pages into `dist/` with separate bundles and replace the script tags with built asset paths.

## CSS preprocessing (optional)
Vite supports preprocessors out of the box. Install what you need and import the file.

Sass/SCSS:
```
pnpm add -D sass
```
```ts
import './style.scss';
```

Less:
```
pnpm add -D less
```
```ts
import './style.less';
```

PostCSS (autoprefixer example):
```
pnpm add -D postcss autoprefixer
```
```js
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {}
  }
};
```

CSS Modules:
```ts
import styles from './widget.module.css';
h('button', { class: styles.button }, 'Click');
```
