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
