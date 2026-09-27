// The moths of the Wurmple line (Beautifly, Dustox): their shared
// choreography. A moth hovers (its calibration lifts it off the ground) and
// its wings never stop: every clip here is written as its acting (the body's
// keys) plus a wing-beat plan (how fast and how wide the wings beat through
// the clip), and `flutter` merges them into one clip: the acting sampled at
// every one of its keys and at every stroke's top and bottom, with the beat
// and the body's bob on each stroke added on top. Each species builds these
// clips on its own stance and character (its beat, its weight and temper,
// its own touches: Beautifly's coiled proboscis reaching out to drain,
// Dustox's antennae and its powder) and reviews them on its own model.
//
// The wing beat: at the top of a stroke the wings are raised and swept back
// over its back (wingL y +, z +; mirrored on the right), at the bottom they
// are spread and lowered; each downstroke lifts the body a little and tips
// it forward (the bob). A clip starts and ends at the middle of a stroke,
// where the beat adds nothing: on the stance.
//
// Channels:
//   root     y rises and dips, x darts aside, z lunges, pitch leans the body
//            into its flight (+ forward), roll banks it (+ to its right)
//   bones    head, spine, hips bend the body; wingL/wingR the wings (the
//            beat); antennae, proboscis, arms and legs where it has them
//   advance  0 at home, 1 in front of the foe (contact moves): it flies there
//   plantFeet  0 in the stance: it never stands (the travel is always flight)

import type { Clip, ClipEvent, Ease, Keyframe } from '../../../anim/clip';
import { sampleClip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';

export interface MothCharacter {
  stance: Pose;
  /** Seconds per wing beat while it hovers. */
  beat: number;
  /** Degrees the wings sweep back (y) and lift (z) from the bottom of a stroke to its top, at amplitude 1. */
  sweep: number;
  lift: number;
  /** How much each downstroke lifts (heights) and tips (degrees) the body. */
  bob: number;
  bobPitch: number;
  /**
   * How much of the wings' lift the hind parts take back (0..1): Beautifly's
   * hindwings, with their long tail streamers, hang and trail while the
   * forewings beat; Dustox's single fan bends a little at its lower half.
   */
  hindCounter: number;
  /** Time scale of the acting: 1 for Beautifly, more for a heavier moth. */
  tempo: number;
}

/** A stretch of a clip's wing beat: from `t` on, `rate` times its hovering beat (faster > 1) at `amp` (0 folds the wings still). */
export interface BeatStep {
  t: number;
  rate: number;
  amp: number;
}

/**
 * The wings at a phase of their beat, at an amplitude: phase 0 is the middle
 * of the upstroke (nothing added), a quarter the top of the stroke (raised
 * and swept back), a half the middle of the downstroke, three quarters the
 * bottom (spread and lowered). The body dips as the wings rise and is lifted
 * (and tipped forward a touch) by each downstroke.
 */
function beatDelta(c: MothCharacter, phase: number, amp: number): Pose {
  const s = Math.sin(2 * Math.PI * phase);
  const y = (c.sweep / 2) * amp * s;
  const z = (c.lift / 2) * amp * s;
  const h = z * c.hindCounter;
  return {
    bones: { wingL: { y, z }, wingR: { y: -y, z: -z }, hindL: { z: -h }, hindR: { z: h } },
    root: { y: -c.bob * amp * s * 0.5, pitch: -c.bobPitch * amp * s * 0.5 },
  };
}

/**
 * The moth kit for a species: key helpers on its stance and in its time,
 * and `flutter`, which builds a clip from its acting and its beat.
 */
export function mothKit(c: MothCharacter) {
  const T = (t: number) => Math.round(t * c.tempo * 1000) / 1000;
  const key = (t: number, ...d: Pose[]): Keyframe => ({ t: T(t), pose: compose(c.stance, ...d) });
  const snap = (t: number, ...d: Pose[]): Keyframe => ({ ...key(t, ...d), ease: 'out' });
  const fall = (t: number, ...d: Pose[]): Keyframe => ({ ...key(t, ...d), ease: 'in' });

  /**
   * A clip from its acting (keys on the stance) and its wing beat: `beats`
   * lists from which time (in the clip's own seconds, before the tempo) the
   * beat runs at which rate and amplitude (default: its hover, full). The
   * beat is stretched a little so the clip ends (or a loop closes) at the
   * middle of a stroke.
   */
  const flutter = (name: string, duration: number, acting: Keyframe[], events: ClipEvent[] = [], beats: BeatStep[] = [{ t: 0, rate: 1, amp: 1 }], loop = false): Clip => {
    const D = T(duration);
    const body: Clip = { name, duration: D, keys: acting, loop };
    const steps = beats.map((s) => ({ ...s, t: T(s.t) })).sort((a, b) => a.t - b.t);
    const stepAt = (t: number) => steps.filter((s) => s.t <= t + 1e-9).at(-1) ?? { t: 0, rate: 1, amp: 1 };
    // The amplitude ramps from one step's to the next over a tenth of a second.
    const ampAt = (t: number) => {
      let a = steps[0]?.amp ?? 1;
      for (let i = 0; i < steps.length && steps[i].t <= t + 1e-9; i++) {
        const from = i > 0 ? steps[i - 1].amp : steps[i].amp;
        a = from + (steps[i].amp - from) * Math.min(1, (t - steps[i].t) / 0.1);
      }
      return a;
    };
    // Phase by integrating the rate; then scaled so the whole clip holds a whole number of half beats.
    const dt = 1 / 240;
    const raw: number[] = [0];
    for (let t = dt; t <= D + 1e-9; t += dt) raw.push(raw.at(-1)! + (stepAt(t - dt).rate / c.beat) * dt);
    const total = raw.at(-1)!;
    const whole = loop ? Math.max(1, Math.round(total)) : Math.max(0.5, Math.round(total * 2) / 2);
    const k = total > 0 ? whole / total : 1;
    const phaseAt = (t: number) => raw[Math.min(raw.length - 1, Math.round(t / dt))] * k;
    // Key times: the acting's keys, and each stroke's top and bottom (phase at a quarter).
    const times = new Map<number, Ease | undefined>();
    for (const a of acting) times.set(a.t, a.ease);
    for (let i = 1; i < raw.length; i++) {
      const p0 = raw[i - 1] * k, p1 = raw[i] * k;
      const q0 = Math.floor(p0 * 2 - 0.5), q1 = Math.floor(p1 * 2 - 0.5);
      if (q1 > q0) {
        const t = Math.round(i * dt * 1000) / 1000;
        if (t > 0.02 && t < D - 0.02 && ![...times.keys()].some((u) => Math.abs(u - t) < 0.035)) times.set(t, undefined);
      }
    }
    const keys: Keyframe[] = [...times.entries()].sort((a, b) => a[0] - b[0]).map(([t, ease]) => {
      const own = acting.find((a) => a.t === t);
      const pose = own ? own.pose : sampleClip(body, t);
      return { t, pose: compose(pose, beatDelta(c, phaseAt(t), ampAt(t))), ...(ease ? { ease } : {}) };
    });
    return { name, duration: D, keys, events: events.map((e) => ({ ...e, t: T(e.t) })), ...(loop ? { loop } : {}) };
  };

  /** The wings posed (on top of the beat): swept back (+) and raised (+), both alike; the hind parts take back their share of the lift. */
  const wings = (sweep: number, lift: number): Pose => ({
    bones: { wingL: { y: sweep, z: lift }, wingR: { y: -sweep, z: -lift }, hindL: { z: -lift * c.hindCounter }, hindR: { z: lift * c.hindCounter } },
  });

  return { T, key, snap, fall, flutter, wings };
}

// Deltas ---------------------------------------------------------------------------------

/** Where it is: advance toward the foe, and the root: height, lunge (heights), lean. */
export const at = (advance: number, y = 0, z = 0, pitch = 0, roll = 0, x = 0): Pose => ({ advance, root: { x, y, z, pitch, roll } });
/** The root alone: x aside (+ its left), y up, z toward the foe (heights), pitch (+ forward), roll (+ to its right), yaw. */
export const move = (x = 0, y = 0, z = 0, pitch = 0, roll = 0, yaw = 0): Pose => ({ root: { x, y, z, pitch, roll, yaw } });
/** The body bent: head (x nods forward, y turns to its left, z tilts to its right), spine forward. */
export const body = (spine: number, head: number, headY = 0, headZ = 0): Pose => ({ bones: { spine: { x: spine }, head: { x: head, y: headY, z: headZ } } });
/** A swell (breath, puffing up) or a shrink. */
export const swell = (s: number): Pose => ({ scale: s });

// Expressions: Dustox's mouth atlas (Beautifly's face is painted on and has none).
/** The mouth open wide (a cry, a shout, spitting). */
export const GAPE: Pose = { expression: 'gape' };
/** The mouth shut in a line (asleep, straining, wincing). */
export const SHUT: Pose = { expression: 'shut' };
/** A pained, downturned mouth (hurt, sick, spent). */
export const FROWN: Pose = { expression: 'frown' };
