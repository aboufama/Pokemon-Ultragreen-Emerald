#!/usr/bin/env node
// The animation fundamentals every clip is held to, read from its keys (no
// rendering): the gauntlet's gates call these (tools/gauntlet/check.mjs),
// and they run on their own:
//
//   node tools/gauntlet/fundamentals.mjs --species blaziken,treecko [--clip double_kick]
//
// travel        a contact move goes to the foe and strikes it there: it starts
//               at home (advance 0), is at the foe (advance >= 0.95) at every
//               impact, and ends at home, travelling through the air or in
//               steps, never sliding with its feet planted (a multi-hit move's
//               _first ends at the foe, its _next starts and ends there, its
//               _last starts there; 'return_home' goes from the foe to home). A
//               ranged move stays at home (advance <= 0.35: a step at most).
// anticipation  before its first effect (impact, release, emit, aura) a clip
//               winds up: at least 0.15 s and two keys, one of them a real
//               counter-move away from the stance
// strike        a contact clip's blow is fast: its impact key comes from the
//               key before in 0.12 s or less, or snaps ('out')
// follow-through  after its last effect a clip carries on at least 0.2 s over
//               two keys or more (the limb carries past, the body settles)
// moving holds  no two keys 0.25 s or more apart hold exactly the same pose
//               (a hold drifts 1-3 degrees)
// settles       a clip ends on its first pose (the stance), except where it
//               stays at the foe (_first, _next), underground (a _charge), or
//               is a faint; a loop's last key is its first
// distinct      no two clips of a species are the same animation (moves of
//               the same action, src/battle3d/actions.ts, may share one clip)

import { importTs } from './tsimport.mjs';

const { sampleClip } = await importTs('src/anim/clip.ts');
const { MOTIFS, motifOf } = await importTs('src/battle3d/motifs.ts');
const { moveClipName, sameAction } = await importTs('src/battle3d/actions.ts');
const { MULTI_HIT_EFFECTS, TWO_TURN_EFFECTS, EFFECT_EVENTS } = await importTs('src/battle3d/situations.ts');

export const LIMITS = {
  /** advance at an impact: at the foe. */
  atFoe: 0.95,
  /** advance a ranged move may step forward. */
  rangedStep: 0.35,
  /** Seconds and keys of wind-up before the first effect (a strike continuing a run of hits: 0.08 s). */
  anticipation: 0.15,
  anticipationNext: 0.08,
  anticipationKeys: 2,
  /** How far from the stance the wind-up must go (pose distance, degrees). */
  windUp: 10,
  /** Seconds from the key before an impact to the impact key. */
  strike: 0.12,
  followThrough: 0.2,
  followThroughKeys: 2,
  /** Keys this far apart must not hold the very same pose. */
  deadHold: 0.25,
  /** The pose distance under which two poses are the same (degrees). */
  same: 0.5,
  /** A clip ends this close to its first pose. */
  settle: 3,
  /** Two clips closer than this everywhere are the same animation. */
  distinct: 8,
};

const deg = (r) => (r * 180) / Math.PI;
const angle = (a, b) => {
  const d = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / ((Math.hypot(...a) * Math.hypot(...b)) || 1);
  return deg(Math.acos(Math.max(-1, Math.min(1, d))));
};

/**
 * How far apart two poses are, in degrees: the largest difference of any
 * rotation or aimed direction, with the body's offsets counted as degrees
 * (a hundredth of its height as 1.5 degrees, advance 0.1 as 6).
 */
export function poseDistance(a, b) {
  let worst = 0;
  const rot = (ra = {}, rb = {}) => {
    for (const k of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
      const x = ra[k] ?? {}, y = rb[k] ?? {};
      for (const ax of ['x', 'y', 'z']) worst = Math.max(worst, Math.abs((x[ax] ?? 0) - (y[ax] ?? 0)));
    }
  };
  rot(a.bones, b.bones);
  rot(a.post, b.post);
  for (const k of new Set([...Object.keys(a.aim ?? {}), ...Object.keys(b.aim ?? {})])) {
    const x = a.aim?.[k]?.dir, y = b.aim?.[k]?.dir;
    if (x && y) worst = Math.max(worst, angle(x, y), Math.abs((a.aim[k].twist ?? 0) - (b.aim[k].twist ?? 0)));
    else worst = Math.max(worst, 45);
  }
  for (const ax of ['x', 'y', 'z']) worst = Math.max(worst, Math.abs((a.pelvis?.[ax] ?? 0) - (b.pelvis?.[ax] ?? 0)) * 150);
  for (const ax of ['x', 'y', 'z']) worst = Math.max(worst, Math.abs((a.root?.[ax] ?? 0) - (b.root?.[ax] ?? 0)) * 150);
  // A turn all the way round ends where it started.
  for (const ax of ['yaw', 'pitch', 'roll']) {
    const d = Math.abs((a.root?.[ax] ?? 0) - (b.root?.[ax] ?? 0)) % 360;
    worst = Math.max(worst, Math.min(d, 360 - d));
  }
  worst = Math.max(worst, Math.abs((a.advance ?? 0) - (b.advance ?? 0)) * 60);
  return worst;
}

const advanceAt = (clip, t) => sampleClip(clip, t).advance ?? 0;
const effects = (clip) => (clip.events ?? []).filter((e) => EFFECT_EVENTS.has(e.name) && e.name !== 'charge').sort((a, b) => a.t - b.t);
const impacts = (clip) => (clip.events ?? []).filter((e) => e.name === 'impact').map((e) => e.t).sort((a, b) => a - b);
const airborne = (p) => (p.plantFeet ?? 1) < 0.5 || (p.root?.y ?? 0) > 0.02 || ((p.plantLeft ?? p.plantFeet ?? 1) < 0.5) !== ((p.plantRight ?? p.plantFeet ?? 1) < 0.5);
const underground = (p) => (p.root?.y ?? 0) < -0.3;

/**
 * What each clip of a species is for: the moves whose own clip it is (and
 * their variants), for the travel rules. `pool` is the species' movepool
 * (tools/gauntlet/brief.mjs moves), `moves` the game's move data.
 */
export function clipRoles(profile, pool, moves) {
  const roles = new Map();
  const note = (clip, role) => {
    if (profile.clips[clip] && !roles.has(clip)) roles.set(clip, role);
  };
  // A move goes to the foe when its action is a contact one (a claw, a
  // tackle...), or it makes contact and is no ranged action (Overheat makes
  // contact in Gen 3 but erupts from home).
  const kindOf = (move) => {
    const kind = MOTIFS[motifOf(move)].kind;
    const contact = kind === 'contact' || (move.flags.includes('FLAG_MAKES_CONTACT') && kind !== 'ranged');
    return { contact, ranged: kind === 'ranged' };
  };
  for (const m of pool) {
    const move = moves[m.const];
    const { contact, ranged } = kindOf(move);
    const motif = motifOf(move);
    for (const same of sameAction(m.const)) {
      const own = profile.moveClips?.[same] ?? moveClipName(same);
      if (!profile.clips[own]) continue;
      // A two-turn move's strike starts where its first turn left it (Dig: underground).
      const twoTurn = TWO_TURN_EFFECTS.has(move.effect);
      note(own, { move: m.const, motif, contact, ranged, part: 'whole', twoTurn });
      if (MULTI_HIT_EFFECTS.has(move.effect)) for (const v of ['first', 'next', 'last']) note(`${own}_${v}`, { move: m.const, motif, contact, ranged, part: v });
      if (twoTurn) note(`${own}_charge`, { move: m.const, motif, contact: false, ranged: false, part: 'charge' });
      break;
    }
  }
  note('return_home', { move: null, motif: null, contact: true, ranged: false, part: 'return' });
  // Clips for moves outside its movepool (Mimic, Mirror Move): by motif, and the category clips.
  for (const [key, clip] of Object.entries(profile.motifClips ?? {})) {
    const motif = key.replace(/@.*$/, '').replace(/_strong$/, '');
    const info = MOTIFS[motif];
    if (clip && info) note(clip, { move: null, motif, contact: info.kind === 'contact', ranged: info.kind === 'ranged', part: 'whole' });
  }
  for (const name of Object.keys(profile.clips)) {
    const motif = name.replace(/@.*$/, '').replace(/_strong$/, '');
    const info = MOTIFS[motif];
    if (info) note(name, { move: null, motif, contact: info.kind === 'contact', ranged: info.kind === 'ranged', part: 'whole' });
  }
  for (const c of ['physical_weak', 'physical_strong']) note(c, { move: null, motif: null, contact: true, ranged: false, part: 'whole' });
  for (const c of ['special_weak', 'special_strong']) note(c, { move: null, motif: null, contact: false, ranged: true, part: 'whole' });
  return roles;
}

/**
 * The fundamentals' problems with one clip: [{ rule, what }]. `stance` is
 * the species' stance (profile.poses.stance): where clips end.
 */
export function clipProblems(name, clip, role, stance = clip.keys?.[0]?.pose ?? {}) {
  const out = [];
  const add = (rule, what) => out.push({ rule, what });
  const keys = clip.keys ?? [];
  if (keys.length < 2) return [{ rule: 'keys', what: `${keys.length} keys` }];
  const first = keys[0].pose, last = keys.at(-1).pose;
  // Where it strikes the foe: a toss seizes it (grab) and its impact is the
  // foe landing where it was thrown; the rest strike on their impacts.
  const toss = (clip.events ?? []).some((e) => e.name === 'grab');
  const hits = toss ? (clip.events ?? []).filter((e) => e.name === 'grab').map((e) => e.t) : impacts(clip);
  // Bursting up out of the ground (Dig, Dive) takes a little longer than a blow.
  const burrow = (clip.events ?? []).some((e) => e.name === 'dig') || role?.motif === 'burrow';
  const fx = effects(clip);
  const part = role?.part ?? null;

  // Travel.
  if (role?.contact) {
    // A two-turn move's strike may start where its first turn left it (underground).
    const startsAt = part === 'next' || part === 'last' || part === 'return' ? 1 : role?.twoTurn ? null : 0;
    const endsAt = part === 'first' || part === 'next' ? 1 : 0;
    const a0 = first.advance ?? 0, a1 = last.advance ?? 0;
    if (startsAt === 0 && a0 > 0.02) add('travel', `starts at advance ${a0}: a contact move starts at home`);
    if (startsAt === null && a0 > 0.02 && !underground(first)) add('travel', `starts at advance ${a0} above ground: it starts at home, or underground where its first turn left it`);
    if (startsAt === 1 && a0 < LIMITS.atFoe) add('travel', `starts at advance ${a0}: ${part === 'return' ? "'return_home'" : `a _${part} hit`} starts at the foe`);
    if (endsAt === 0 && a1 > 0.02) add('travel', `ends at advance ${a1}: it must end at home`);
    if (endsAt === 1 && a1 < LIMITS.atFoe) add('travel', `ends at advance ${a1}: a _${part} hit stays at the foe for the next`);
    if (part !== 'return' && part !== 'charge') {
      if (!hits.length) add('travel', 'no impact: a contact move strikes the foe (an impact event)');
      for (const t of hits) {
        const a = advanceAt(clip, t);
        if (a < LIMITS.atFoe) add('travel', `${toss ? 'grab' : 'impact'} at ${t.toFixed(2)} s with advance ${a.toFixed(2)}: it must be at the foe (advance >= ${LIMITS.atFoe}), leaping or dashing in to strike it`);
      }
      if (['first', 'next', 'last'].includes(part) && hits.length !== 1) add('travel', `${hits.length} impacts: each hit of a multi-hit move is its own clip with one impact`);
    }
    for (let i = 0; i + 1 < keys.length; i++) {
      const a = keys[i], b = keys[i + 1];
      const d = Math.abs((b.pose.advance ?? 0) - (a.pose.advance ?? 0));
      if (d > 0.02 && !airborne(a.pose) && !airborne(b.pose) && !underground(a.pose) && !underground(b.pose)) {
        add('travel', `advance ${a.pose.advance ?? 0} -> ${b.pose.advance ?? 0} between ${a.t} s and ${b.t} s with both feet planted: that slides; leap (feet off, root.y arc) or step (one foot lifted)`);
      }
    }
  } else if (role?.ranged) {
    const most = Math.max(...keys.map((k) => k.pose.advance ?? 0));
    if (most > LIMITS.rangedStep) add('travel', `advance ${most}: a ranged move is fired from home (a step toward the foe at most, advance <= ${LIMITS.rangedStep})`);
  }

  // Anticipation, the strike, follow-through.
  if (fx.length && part !== 'return') {
    const t0 = fx[0].t;
    const cont = part === 'next' || part === 'last';
    const need = cont ? LIMITS.anticipationNext : LIMITS.anticipation;
    const before = keys.filter((k) => k.t > 0 && k.t < t0 - 1e-6);
    if (t0 < need) add('anticipation', `its first effect (${fx[0].name}) comes at ${t0.toFixed(2)} s: wind up for at least ${need} s first`);
    // A contact move winds up, then travels (or lands) before it strikes.
    const keysNeeded = cont || burrow ? 1 : role?.contact ? LIMITS.anticipationKeys : 1;
    if (before.length < keysNeeded) add('anticipation', `${before.length} key(s) before its first effect: ${role?.contact ? 'a wind-up key and the leap in' : 'a wind-up key'} before it`);
    if (!cont && !before.some((k) => poseDistance(k.pose, stance) >= LIMITS.windUp)) add('anticipation', `no key before its first effect moves ${LIMITS.windUp}° or more from the stance: wind up (crouch, draw back, inhale) against the action`);
    const tEnd = fx.at(-1).t;
    const after = keys.filter((k) => k.t > tEnd + 1e-6);
    if (clip.duration - tEnd < LIMITS.followThrough - 1e-6 && part !== 'first' && part !== 'next') add('follow-through', `ends ${(clip.duration - tEnd).toFixed(2)} s after its last effect: carry through and settle (${LIMITS.followThrough} s or more)`);
    if (after.length < LIMITS.followThroughKeys && part !== 'first' && part !== 'next') add('follow-through', `${after.length} key(s) after its last effect: follow-through and settle`);
    if (role?.contact) {
      const window = burrow ? LIMITS.strike * 2 : LIMITS.strike;
      for (const t of hits) {
        const at = keys.findIndex((k) => k.t >= t - 0.1);
        const k = keys[Math.max(1, at)];
        const prev = keys[Math.max(0, at - 1)];
        if (k && prev && k !== prev && k.ease !== 'out' && k.t - prev.t > window + 1e-6) add('strike', `the blow at ${t.toFixed(2)} s comes from its key ${prev.t} s over ${(k.t - prev.t).toFixed(2)} s: strike in ${window.toFixed(2)} s or less, or snap ('out')`);
      }
    }
  }

  // Moving holds.
  for (let i = 0; i + 1 < keys.length; i++) {
    const a = keys[i], b = keys[i + 1];
    if (b.t - a.t >= LIMITS.deadHold && poseDistance(a.pose, b.pose) < LIMITS.same && !(clip.loop && keys.length <= 2)) {
      add('moving holds', `the same pose from ${a.t} s to ${b.t} s: keep a hold moving (1-3°)`);
    }
  }

  // Settles.
  const staysAway = part === 'first' || part === 'next' || part === 'charge' || name === 'faint';
  if (clip.loop) {
    if (poseDistance(first, last) > LIMITS.settle) add('settles', `a loop whose last key is ${poseDistance(first, last).toFixed(0)}° from its first: it jumps as it loops`);
  } else if (!staysAway && poseDistance(stance, last) > LIMITS.settle) add('settles', `its last key is ${poseDistance(stance, last).toFixed(0)}° from the stance: end back on it`);
  return out;
}

/**
 * Pairs of clips that are the same animation: sampled over their length,
 * never further apart than LIMITS.distinct. `shared` says which pairs may be
 * (moves of the same action).
 */
export function duplicates(clips, shared = () => false) {
  const names = Object.keys(clips).filter((n) => (clips[n].keys ?? []).length > 1);
  const N = 24;
  const samples = new Map(names.map((n) => [n, Array.from({ length: N + 1 }, (_, i) => sampleClip(clips[n], (clips[n].duration * i) / N))]));
  const out = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      if (clips[a] === clips[b] || shared(a, b)) continue;
      let far = 0;
      for (let k = 0; k <= N && far < LIMITS.distinct; k++) far = Math.max(far, poseDistance(samples.get(a)[k], samples.get(b)[k]));
      if (far < LIMITS.distinct) out.push([a, b, far]);
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { loadProfile, gameData } = await import('./species.mjs');
  const { speciesBrief } = await import('./brief.mjs');
  const argv = process.argv.slice(2);
  const arg = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
  const data = await gameData();
  let total = 0;
  for (const slug of (arg('--species') ?? 'blaziken').split(',')) {
    const profile = await loadProfile(slug);
    const roles = clipRoles(profile, (await speciesBrief(slug)).moves, data.moves);
    const only = arg('--clip');
    let n = 0;
    for (const [name, clip] of Object.entries(profile.clips)) {
      if (only && name !== only) continue;
      for (const p of clipProblems(name, clip, roles.get(name), profile.poses?.stance)) {
        n++;
        console.log(`  ${slug.padEnd(10)} ${name.padEnd(22)} ${p.rule.padEnd(14)} ${p.what}`);
      }
    }
    for (const [a, b, far] of only ? [] : duplicates(profile.clips)) {
      n++;
      console.log(`  ${slug.padEnd(10)} ${`${a} = ${b}`.padEnd(22)} ${'distinct'.padEnd(14)} never more than ${far.toFixed(1)}° apart: the same animation`);
    }
    console.log(`${slug}: ${n ? `${n} problem(s)` : 'clean'}`);
    total += n;
  }
  process.exit(total ? 1 : 0);
}
