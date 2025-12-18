import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const fromRoot = (relative: string) => path.resolve(here, relative);

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 0
  },
  resolve: {
    alias: {
      atomica: fromRoot('../../packages/atomica/dist/index.js')
    }
  }
});
