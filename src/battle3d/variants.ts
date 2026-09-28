// The pieces of a clip the compiled game's battles call for, where a species
// has none of its own: a multi-hit move plays its animation once per hit
// (_first leaps in and stays at the foe, _next strikes again from there,
// _last strikes and goes home, _home goes home when the next hit doesn't
// come), and a two-turn move once per turn (_charge, then _turn2). A clip
// made as one piece (the first clips: Double Kick kicks twice, Dig dives and
// bursts up in one go) plays in those pieces unchanged: every cut falls on
// one of its own keys, so every pose is the clip's.

import type { Clip } from '../anim/clip';
import { CHARGE_VARIANT, HOME_VARIANT, MULTI_HIT_VARIANTS, SECOND_TURN_VARIANT } from './situations';

/** A key at the foe: its travel done. */
const AT_FOE = 0.99;
/** The shortest stay at the foe worth cutting into hits (a tackle that bounces straight off plays whole each hit). */
const MIN_STAY = 0.1;
/** How long before its release a gathered pose holds (the snap into the release comes after it). */
const BEFORE_RELEASE = 0.12;

const SUFFIXES = [...Object.values(MULTI_HIT_VARIANTS), CHARGE_VARIANT, SECOND_TURN_VARIANT, HOME_VARIANT];

/** The piece of `clip` from key time `from` to key time `to`, starting at 0. */
function piece(clip: Clip, from: number, to: number, name: string): Clip {
  const eps = 1e-6;
  const keys = clip.keys
    .filter((k) => k.t >= from - eps && k.t <= to + eps)
    .map((k, i) => {
      const moved = { ...k, t: +(k.t - from).toFixed(4) };
      // Where a piece starts, nothing eases into it.
      if (i === 0) delete moved.ease;
      return moved;
    });
  const events = (clip.events ?? []).filter((e) => e.t >= from - eps && e.t < to - eps).map((e) => ({ ...e, t: +(e.t - from).toFixed(4) }));
  return { ...clip, name, loop: false, duration: +(to - from).toFixed(4), keys, events, derived: clip.name };
}

/** The key time nearest `t` among `times`. */
function nearest(times: number[], t: number): number {
  return times.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a));
}

/** Adds the pieces the battles need to every clip that has none of its own (authored variants win). */
export function deriveVariants(clips: Record<string, Clip>): void {
  const { first, next, last } = MULTI_HIT_VARIANTS;
  for (const [name, clip] of Object.entries(clips)) {
    if (clip.loop || clip.derived || clip.generic || SUFFIXES.some((s) => name.endsWith(s))) continue;
    const add = (suffix: string, from: number, to: number) => {
      if (!clips[name + suffix] && to - from > 0.05) clips[name + suffix] = piece(clip, from, to, name + suffix);
    };
    const end = clip.duration;
    const at = clip.keys.filter((k) => (k.pose.advance ?? 0) >= AT_FOE).map((k) => k.t);
    const impacts = (clip.events ?? []).filter((e) => e.name === 'impact').map((e) => e.t);

    const dig = clip.events?.find((e) => e.name === 'dig');
    // A blow at the foe: the hits of a run, and the way home (not a burrow's: no move digs in a run).
    if (!dig && at.length && at[at.length - 1] - at[0] >= MIN_STAY && !clips[name + first]) {
      const arrive = at[0];
      const leave = at[at.length - 1];
      const blows = impacts.filter((t) => t >= arrive - 0.1 && t <= leave + 0.1);
      if (blows.length >= 2) {
        // A clip of several blows (Double Kick): a hit each, cut between them at the foe.
        const cuts = blows.slice(1).map((t, i) => nearest(at, (blows[i] + t) / 2));
        add(first, 0, cuts[0]);
        add(next, cuts.length > 1 ? cuts[0] : arrive, cuts.length > 1 ? cuts[1] : cuts[0]);
        add(last, cuts[cuts.length - 1], end);
      } else {
        add(first, 0, leave);
        add(next, arrive, leave);
        add(last, arrive, end);
      }
      add(HOME_VARIANT, leave, end);
    }

    // A two-turn move's turns.
    if (clips[name + CHARGE_VARIANT]) continue;
    const release = clip.events?.find((e) => e.name === 'release');
    const charge = clip.events?.find((e) => e.name === 'charge');
    let cut: number | undefined;
    if (dig) {
      // Burrowing: the first turn ends where it first reaches its deepest underground (out of sight: it
      // waits there for its second turn, which tunnels on and bursts up).
      const strike = impacts.find((t) => t > dig.t) ?? end;
      const under = clip.keys.filter((k) => k.t > dig.t && k.t < strike);
      if (under.length) cut = under.reduce((a, b) => ((b.pose.root?.y ?? 0) < (a.pose.root?.y ?? 0) ? b : a)).t;
    } else if (charge && release && release.t > charge.t) {
      // Gathering power: the first turn ends on the gathered pose, before the snap into the release.
      const gathered = clip.keys.filter((k) => k.t > charge.t && k.t <= release.t - BEFORE_RELEASE);
      if (gathered.length) cut = gathered[gathered.length - 1].t;
    }
    if (cut !== undefined) {
      add(CHARGE_VARIANT, 0, cut);
      add(SECOND_TURN_VARIANT, cut, end);
    }
  }
}
