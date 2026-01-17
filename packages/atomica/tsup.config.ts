import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'dom/index': 'src/dom/index.ts',
    'signals/index': 'src/signals/index.ts',
    'companion/index': 'src/companion/index.ts',
    'dom/jsx-runtime': 'src/dom-jsx-runtime.ts'
  },
  tsconfig: './tsconfig.tsup.json',
  format: ['esm', 'cjs'],
  dts: { resolve: false, tsconfig: './tsconfig.tsup.json' },
  sourcemap: true,
  clean: true,
  noExternal: ['@atomica/dom', '@atomica/signals', '@atomica/shared'],
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.esm.js' : '.cjs.js'
    };
  }
});
