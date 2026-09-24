#!/usr/bin/env node
// Prepare a git worktree for a gauntlet run while other agents work in their
// own: share the main checkout's node_modules (a symlink, which git ignores),
// copy the Draco decoder into public/libs, and find a free dev-server port.
// The decomp needs nothing: tools/gauntlet/brief.mjs reads the main checkout's.
//
//   node tools/gauntlet/setup_worktree.mjs [--port 5174]
//
// Prints the command that starts this worktree's dev server. In the main
// checkout it only reminds you to npm install.

import { execFileSync } from 'node:child_process';
import { existsSync, symlinkSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const want = argv.includes('--port') ? Number(argv[argv.indexOf('--port') + 1]) : 5174;

const common = resolve(ROOT, execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: ROOT, encoding: 'utf8' }).trim());
const main = dirname(common);
if (main === ROOT) {
  console.log('This is the main checkout: npm install, then npx vite --port 5173 --strictPort --host 127.0.0.1');
  process.exit(0);
}

const modules = join(ROOT, 'node_modules');
if (!existsSync(modules)) {
  if (!existsSync(join(main, 'node_modules'))) throw new Error(`run npm install in ${main} first`);
  symlinkSync(join(main, 'node_modules'), modules, 'dir');
  console.log(`linked node_modules -> ${join(main, 'node_modules')}`);
}
execFileSync(process.execPath, [join(ROOT, 'tools/prepare_libs.mjs')], { cwd: ROOT, stdio: 'inherit' });

const free = (port) => new Promise((done) => {
  const s = createServer();
  s.once('error', () => done(false));
  s.once('listening', () => s.close(() => done(true)));
  s.listen(port, '127.0.0.1');
});
let port = want;
while (!(await free(port))) port++;
console.log(`Start your dev server:  npx vite --port ${port} --strictPort --host 127.0.0.1 > /tmp/vite-${port}.log 2>&1 &`);
console.log(`and pass --base http://127.0.0.1:${port}/ to every browser tool. Stop it when you finish.`);
