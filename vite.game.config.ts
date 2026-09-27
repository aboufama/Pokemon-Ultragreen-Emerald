// Build of the compiled game's page (game.html) for the published site: one
// JS bundle, no public/ copy (tools/game/build_site.mjs copies what the page
// loads: the game, and the 3D Pokémon the remake layer draws).
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    target: 'es2022',
    outDir: 'build/game-dist',
    emptyOutDir: true,
    modulePreload: false,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 4096,
    rollupOptions: {
      input: 'game.html',
      output: { inlineDynamicImports: true, entryFileNames: 'game.js' },
    },
  },
});
