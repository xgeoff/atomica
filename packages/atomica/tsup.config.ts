import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'dom/index': 'src/dom/index.ts',
    'signals/index': 'src/signals/index.ts',
    'dom/jsx-runtime': 'src/dom-jsx-runtime.ts'
  },
  tsconfig: './tsconfig.tsup.json',
  format: ['esm', 'cjs'],
  dts: { resolve: false, tsconfig: './tsconfig.tsup.json' },
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.esm.js' : '.cjs.js'
    };
  }
});
