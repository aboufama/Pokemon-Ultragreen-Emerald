#!/usr/bin/env node
// Headless screenshot harness (Playwright + Chromium/SwiftShader WebGL).
//
// Single shot:
//   node tools/shots/shoot.mjs --url http://127.0.0.1:5173/lab.html?species=blaziken --out out.png
// Batch:
//   node tools/shots/shoot.mjs --plan plan.json
//   plan.json = { "base": "http://127.0.0.1:5173/", "size": "960x640",
//                 "shots": [{ "url": "lab.html?...", "out": "a.png", "eval": "window.lab.setTime(0.5)", "selector": "canvas" }] }
//
// Pages signal readiness by setting window.__ready = true. An optional `eval`
// expression runs after readiness (it may return a promise), then the page
// gets two animation frames to settle before the capture.

import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1]?.startsWith('--') ? true : argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
let plan;
if (args.plan) {
  plan = JSON.parse(await readFile(args.plan, 'utf8'));
} else {
  plan = { size: args.size, shots: [{ url: args.url, out: args.out, eval: args.eval, selector: args.selector, wait: args.wait }] };
}

const [w, h] = String(plan.size ?? '960x640').split('x').map(Number);
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

let lastUrl = null;
let failures = 0;
for (const shot of plan.shots) {
  const url = plan.base ? new URL(shot.url, plan.base).href : shot.url;
  try {
    if (url !== lastUrl || shot.reload) {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__ready === true, null, { timeout: Number(shot.timeout ?? 60000) });
      lastUrl = url;
    }
    if (shot.eval) await page.evaluate(`(async () => { ${shot.eval} })()`);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    if (shot.wait) await page.waitForTimeout(Number(shot.wait));
    const out = resolve(shot.out);
    await mkdir(dirname(out), { recursive: true });
    if (shot.selector) await page.locator(shot.selector).first().screenshot({ path: out });
    else await page.screenshot({ path: out });
    console.log(`saved ${out}`);
  } catch (err) {
    failures++;
    console.error(`FAILED ${url}: ${err.message}`);
  }
}
if (logs.length) console.log(logs.slice(-40).join('\n'));
await browser.close();
process.exit(failures ? 1 : 0);
