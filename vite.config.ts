import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  // Agent worktrees (.claude/worktrees) are separate checkouts: don't watch them.
  server: { host: '127.0.0.1', port: 5173, watch: { ignored: ['**/.claude/worktrees/**'] } },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lab: resolve(__dirname, 'lab.html'),
      },
    },
  },
});
