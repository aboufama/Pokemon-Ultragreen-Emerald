// Build of the standalone battle demo: one JS bundle, no public/ copy (the
// demo ships only the assets a battle loads; see tools/demo/build_demo.mjs).
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'build/demo-dist',
    emptyOutDir: true,
    modulePreload: false,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 4096,
    rollupOptions: {
      input: 'demo.html',
      output: { inlineDynamicImports: true, entryFileNames: 'demo.js' },
    },
  },
});
