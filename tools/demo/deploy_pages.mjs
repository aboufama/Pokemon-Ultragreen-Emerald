#!/usr/bin/env node
// Publish the battle playtest to GitHub Pages: build the static site
// (tools/demo/build_demo.mjs) and push it as the only commit of the gh-pages
// branch, which GitHub serves at https://<owner>.github.io/<repo>/.
//
//   node tools/demo/deploy_pages.mjs [--no-build] [--remote origin] [--branch gh-pages] [--dry]
//
// The branch holds nothing but the built site and is replaced on every
// deploy (no history to grow). --dry builds and commits in a temporary
// repository without pushing. The first time, if GitHub doesn't turn Pages
// on by itself for the gh-pages branch: repository Settings → Pages →
// Build and deployment → Deploy from a branch → gh-pages, / (root).

import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
}
const remote = String(args.remote ?? 'origin');
const branch = String(args.branch ?? 'gh-pages');

function git(cwd, ...a) {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr || r.stdout}`);
  return r.stdout.trim();
}

if (!args['no-build']) {
  const b = spawnSync(process.execPath, [join(ROOT, 'tools/demo/build_demo.mjs')], { cwd: ROOT, stdio: 'inherit' });
  if (b.status !== 0) process.exit(b.status ?? 1);
}

const url = git(ROOT, 'remote', 'get-url', remote);
const source = git(ROOT, 'rev-parse', '--short', 'HEAD');
const dirty = git(ROOT, 'status', '--porcelain', '--untracked-files=no') ? ' (with uncommitted changes)' : '';
const name = git(ROOT, 'config', 'user.name');
const email = git(ROOT, 'config', 'user.email');
const m = url.match(/github\.com[/:]([^/]+)\/(.+?)(\.git)?$/);
const site = m ? `https://${m[1].toLowerCase()}.github.io/${m[2]}/` : '(not a GitHub remote)';

const dir = await mkdtemp(join(tmpdir(), 'pages-'));
try {
  await cp(join(ROOT, 'build/demo/pages'), dir, { recursive: true });
  await writeFile(join(dir, 'README.md'), `Built battle playtest, published by tools/demo/deploy_pages.mjs from ${source}${dirty}.\nPlay it at ${site}\n`);
  git(dir, 'init', '-q', '-b', branch);
  git(dir, 'config', 'user.name', name);
  git(dir, 'config', 'user.email', email);
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', `Battle playtest built from ${source}${dirty}`);
  if (args.dry) {
    console.log(`dry run: committed the site in ${dir}; not pushed. It would be served at ${site}`);
    process.exit(0);
  }
  const push = spawnSync('git', ['push', '--force', url, `HEAD:refs/heads/${branch}`], { cwd: dir, stdio: 'inherit' });
  if (push.status !== 0) throw new Error(`push to ${branch} failed`);
  console.log(`published ${branch}: ${site} (GitHub Pages takes a minute or two to update)`);
} finally {
  if (!args.dry) await rm(dir, { recursive: true, force: true });
}
