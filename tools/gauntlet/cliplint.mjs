#!/usr/bin/env node
// Static checks on a species' clips for the mistakes that read as robotic,
// straight from the keys (no rendering):
//
//   node tools/gauntlet/cliplint.mjs --species sceptile,swampert
//
//   slide   the body travels (advance changes) between two keys while the
//           feet are planted: leap instead (TUCK/HOP, root.y arc)
//   pivot   the whole body yaws (root.yaw) on planted feet before travelling:
//           twist the spine instead (a coil into a spin later in the clip is fine)
//   aim     a bone is aimed in some keys and not others: it snaps halfway
//   hitch   a snap/fall key followed within 0.1 s by a big change: the curve
//           stops and restarts (make the next key a near-hold)
//   rush    the torso and head turn faster than 500°/s between two keys that
//           are not a strike (snap): an anticipation or recovery too quick to
//           read, which looks jerky (Blaziken's peak is ~470°/s, its median 70)
// Exit code 1 when anything is found; tools/gauntlet/check.mjs lists these as warnings.

import { loadProfile } from './species.mjs';

export function lintClips(clips) {
  const issues = [];
  for (const [name, clip] of Object.entries(clips)) {
    const keys = clip.keys;
    const spins = keys.some((k) => Math.abs(k.pose.root?.yaw ?? 0) >= 180);
    const aimed = new Map();
    keys.forEach((k, i) => {
      for (const b of Object.keys(k.pose.aim ?? {})) aimed.set(b, (aimed.get(b) ?? 0) + 1);
    });
    for (const [b, n] of aimed) {
      if (n !== keys.length) issues.push({ clip: name, kind: 'aim', what: `${b} aimed in ${n} of ${keys.length} keys` });
    }
    for (let i = 0; i + 1 < keys.length; i++) {
      const a = keys[i], b = keys[i + 1];
      const planted = (p) => (p.pose.plantFeet ?? 1) >= 0.5 && (p.pose.root?.y ?? 0) < 0.02;
      const adv = (p) => p.pose.advance ?? 0;
      if (Math.abs(adv(a) - adv(b)) > 0.02 && planted(a) && planted(b)) {
        issues.push({ clip: name, kind: 'slide', what: `advance ${adv(a)} -> ${adv(b)} between ${a.t}s and ${b.t}s with the feet planted` });
      }
      const yaw = (p) => p.pose.root?.yaw ?? 0;
      if (!spins && Math.abs(yaw(a) - yaw(b)) > 2 && Math.abs(yaw(b)) < 60 && Math.abs(yaw(a)) < 60 && planted(a) && planted(b) && adv(a) < 0.05 && adv(b) < 0.05) {
        issues.push({ clip: name, kind: 'pivot', what: `root.yaw ${yaw(a)} -> ${yaw(b)} between ${a.t}s and ${b.t}s on planted feet` });
      }
      if (name !== 'idle' && b.ease !== 'out') {
        let deg = 0;
        for (const bone of ['spine', 'chest', 'neck', 'neck2', 'head']) {
          const ra = a.pose.bones?.[bone] ?? {}, rb = b.pose.bones?.[bone] ?? {};
          deg += Math.hypot((rb.x ?? 0) - (ra.x ?? 0), (rb.y ?? 0) - (ra.y ?? 0), (rb.z ?? 0) - (ra.z ?? 0));
        }
        const speed = deg / (b.t - a.t);
        if (speed > 500) issues.push({ clip: name, kind: 'rush', what: `torso and head turn ${deg.toFixed(0)}° in ${(b.t - a.t).toFixed(2)} s (${speed.toFixed(0)}°/s) between ${a.t}s and ${b.t}s` });
      }
      if (a.ease && b.t - a.t < 0.1) {
        const big = Object.keys(b.pose.aim ?? {}).some((bone) => {
          const d1 = a.pose.aim?.[bone]?.dir, d2 = b.pose.aim[bone].dir;
          if (!d1) return false;
          const dot = d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2];
          return Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(...d1) * Math.hypot(...d2))))) * 180 / Math.PI > 25;
        });
        if (big) issues.push({ clip: name, kind: 'hitch', what: `${a.ease} key at ${a.t}s followed at ${b.t}s by a limb change over 25°` });
      }
    }
  }
  return issues;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const species = (argv[argv.indexOf('--species') + 1] ?? 'blaziken').split(',');
  let total = 0;
  for (const slug of species) {
    const issues = lintClips((await loadProfile(slug)).clips);
    total += issues.length;
    console.log(`${slug}: ${issues.length ? issues.length + ' issue(s)' : 'clean'}`);
    for (const i of issues) console.log(`  ${i.kind.padEnd(6)} ${i.clip.padEnd(24)} ${i.what}`);
  }
  process.exit(total ? 1 : 0);
}
