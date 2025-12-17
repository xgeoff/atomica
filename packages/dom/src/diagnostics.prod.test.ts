import { describe, expect, it, vi } from 'vitest';
import { build } from 'vite';
import fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('diagnostics dev-only guard', () => {
  it('keeps diagnostics globals undefined in production mode', async () => {
    const prevEnv = process.env.NODE_ENV;
    const previousDev = (globalThis as any).__ATOMICA_DEV__;
    delete (globalThis as any).__ATOMICA_DEV__;
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    try {
      const { h, mount } = await import('./index');
      const container = document.createElement('div');
      const dispose = mount(h('div', null, 'prod'), container, { dev: true });

      expect((globalThis as any).__ATOMICA_DEV__).toBeUndefined();

      dispose();
    } finally {
      vi.resetModules();
      process.env.NODE_ENV = prevEnv;
      if (previousDev !== undefined) {
        (globalThis as any).__ATOMICA_DEV__ = previousDev;
      } else {
        delete (globalThis as any).__ATOMICA_DEV__;
      }
    }
  });

  it('omits diagnostics symbols from production bundles', async () => {
    const outDir = fs.mkdtempSync(join(tmpdir(), 'atomica-prod-'));

    try {
      await build({
        logLevel: 'error',
        define: {
          'process.env.NODE_ENV': '"production"'
        },
        build: {
          outDir,
          lib: {
            entry: new URL('./index.ts', import.meta.url).pathname,
            formats: ['es']
          },
          minify: false,
          sourcemap: false,
          rollupOptions: {
            treeshake: true
          }
        }
      });

      const files = fs.readdirSync(outDir).filter((file) => file.endsWith('.js'));
      const bundle = files
        .map((file) => fs.readFileSync(join(outDir, file), 'utf8'))
        .join('\n');

      expect(bundle.includes('__ATOMICA_DEV__')).toBe(false);
      expect(bundle.includes('initDevDiagnostics')).toBe(false);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });
});
