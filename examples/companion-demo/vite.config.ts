import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fromRoot = (relative: string) => path.resolve(here, relative);

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 0
  },
  resolve: {
    alias: [
      {
        find: /^atomica$/,
        replacement: fromRoot('../../packages/atomica/dist/index.esm.js')
      },
      {
        find: /^atomica\/companion$/,
        replacement: fromRoot('../../packages/atomica/dist/companion/index.esm.js')
      }
    ]
  }
});
