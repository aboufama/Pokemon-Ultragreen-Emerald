// Swampert's fists and arms: the punches (Mega Punch, Focus Punch,
// DynamicPunch, Ice Punch, Counter), the chops and clubs (Brick Break, Rock
// Smash) and the grapples (Strength, Seismic Toss). Each hops in low and
// heavy, lands deep in the knees in front of the foe and throws the whole
// mass behind the arm: the fist drives into the foe's body, the hips and
// spine turning into it and the body lunging in (root.z), then it hops home.
// Hands trail the hips by ~0.06-0.08 s: impacts sit that far after the
// strike's key.

import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_DOWN_FRONT, CHAMBER_R, CROSSED_GUARD, ELBOWS_OUT, FISTS, GUARD_RISING, HAMMER_DOWN, HOP, LAND, LAND_DEEP, LAND_HOME,
  FOCUS_GUARD, MOUTH_SHUT, NARROW, OPEN_EYES, PUNCH_R, PUNCH_R_THROUGH, PUSH, PUSH_LOW, SPLAY, SQUINT, SUMO_GUARD, arms, atFoe, bend, body, clip,
  fall, flying, hopHome, jaw, key, landed, pelvis, sink, snap, twist,
} from './kit';

// Arm shapes for these clips ------------------------------------------------------

/** The right fist wound further back as it lands (the haymaker's last coil). */
const CHAMBER_R_DEEP = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.45, 0.4, -0.8], [-0.4, 0.3, 0.87], [-0.2, 0.1, 0.97]]);
/** Dynamic Punch's coil: the right arm swung back and up behind the head, the left reaching at the foe. */
const WINDMILL = arms([0.55, -0.1, 0.83], [0.2, 0.1, 0.97], [0.05, 0.1, 0.99], [[-0.45, 0.62, -0.64], [-0.15, 0.9, -0.4], [0.0, 0.92, -0.38]]);
/** In the air, the right fist raised high for an overhand, the left pulled back. */
const OVERHAND_UP = arms([0.7, -0.3, -0.64], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.35, 0.82, -0.2], [-0.1, 0.94, 0.33], [0.0, 0.88, 0.47]]);
/** The overhand driven down and through the foe. */
const OVERHAND_DOWN = arms([0.72, -0.35, -0.6], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.12, -0.12, 0.99], [-0.02, -0.38, 0.93], [0.0, -0.48, 0.88]]);
/** Ice Punch's set: the left fist drawn back by the shoulder, the right arm low across the belly. */
const JAB_SET = arms([0.5, -0.7, -0.5], [0.1, 0.45, 0.89], [0.0, 0.35, 0.94], [[-0.55, -0.6, 0.58], [0.55, -0.1, 0.83], [0.6, -0.1, 0.79]]);
/** The jab locked out dead straight at the foe, the right fist pulled back to the hip. */
const JAB_L = arms([0.1, 0.02, 0.99], [0.04, 0.02, 1], [0.02, 0.04, 1], [[-0.62, -0.62, -0.48], [-0.2, -0.3, 0.93], [-0.05, -0.2, 0.98]]);
/** Counter: the right arm drawn across the chest for a backhand, the left guarding. */
const BACKHAND_COCK = arms([0.6, -0.35, 0.72], [-0.1, 0.5, 0.86], [-0.2, 0.6, 0.77], [[0.3, -0.05, 0.95], [0.85, 0.2, 0.49], [0.9, 0.25, 0.36]]);
/** The backhand swung out through the foe. */
const BACKHAND_OUT = arms([0.7, -0.4, 0.59], [0.2, -0.3, 0.93], [0.0, -0.3, 0.95], [[-0.35, 0.02, 0.94], [-0.55, 0.05, 0.83], [-0.65, 0.05, 0.76]]);
/** ... carried on past it. */
const BACKHAND_THROUGH = arms([0.7, -0.4, 0.59], [0.2, -0.3, 0.93], [0.0, -0.3, 0.95], [[-0.82, 0.0, 0.57], [-0.9, -0.05, 0.43], [-0.92, -0.1, 0.37]]);
/** Brick Break: the right hand raised high behind the head, edge ready; the left guarding. */
const CHOP_RAISED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.55, 0.6, -0.58], [-0.1, 0.95, 0.3], [0.0, 0.95, 0.3]]);
/** ... cocked further back as it lands, so the chop starts from a turnaround. */
const CHOP_COCKED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.5, 0.64, -0.58], [-0.06, 0.97, -0.2], [0.02, 0.9, -0.42]]);
/** The chop straight down through the foe in front. */
const CHOP_STRAIGHT = arms([0.7, -0.5, -0.5], [0.3, -0.4, 0.87], [0.1, -0.5, 0.86], [[-0.18, -0.2, 0.96], [-0.04, -0.72, 0.69], [0.0, -0.84, 0.54]]);
/** ... following through low. */
const CHOP_LOW = arms([0.7, -0.5, -0.5], [0.3, -0.4, 0.87], [0.1, -0.5, 0.86], [[-0.18, -0.45, 0.87], [-0.04, -0.9, 0.43], [0.0, -0.96, 0.28]]);
/** Rock Smash: both fists clasped high over the head. */
const CLUB_UP = arms([0.3, 0.9, 0.3], [-0.35, 0.86, 0.36], [-0.45, 0.8, 0.4]);
/** ... drawn back behind the head for the swing. */
const CLUB_BACK = arms([0.3, 0.86, -0.4], [-0.3, 0.75, -0.59], [-0.4, 0.65, -0.65]);
/** The club brought down onto the foe in front. */
const CLUB_DOWN = arms([0.25, -0.12, 0.96], [-0.28, -0.45, 0.85], [-0.38, -0.55, 0.74]);
/** ... following through low. */
const CLUB_LOW = arms([0.25, -0.45, 0.86], [-0.28, -0.75, 0.6], [-0.38, -0.8, 0.46]);
/** Strength: palms set on the foe, elbows bent (loading). */
const PALMS_ON = arms([0.6, -0.32, 0.73], [0.25, 0.18, 0.95], [0.08, 0.5, 0.86]);

/** A tremor on a held pose (moving holds). */
const tremor = (k: number): Pose => bend(0, 0, 0, 0.8 * k, 0.6 * k, 1.2 * k);

// Clips ------------------------------------------------------------------------------

/**
 * Mega Punch: the haymaker. Sinks and winds the right fist far back with the
 * shoulders turned away, a lumbering hop in with it cocked, lands deep and
 * coils once more, then the hips and shoulders unwind and the fist drives
 * straight into the foe's middle as it steps in; it leans over its front
 * foot in the follow-through and hops home.
 */
export const megaPunch = clip('mega_punch', [
  key(0),
  key(0.24, sink(-0.06, -0.01), bend(8, 2, 0, 6), twist(-24), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
  key(0.42, flying(0.55, 0.09), bend(6, 2, 0, 2), twist(-24), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
  key(0.56, landed(1, true), bend(12, 2, 0, 4), twist(-30), CHAMBER_R_DEEP, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.66, atFoe(0.14), pelvis(0, -0.045, 0.03), bend(16, 4, 0, 4), twist(26), PUNCH_R, FISTS, jaw(8), ANGRY),
  key(0.82, atFoe(0.16), pelvis(0, -0.05, 0.035), bend(18, 5, 0, 5), twist(33), PUNCH_R_THROUGH, FISTS, jaw(4), ANGRY),
  key(1.0, atFoe(0.05), pelvis(0, -0.035), bend(8, 2, 0, 1), twist(8), ELBOWS_OUT, ANGRY),
  ...hopHome(1.16, ELBOWS_OUT, ANGRY),
  key(1.5, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.71, 'impact']]);

/**
 * Focus Punch: the most powerful punch it has, from a still, focused stance
 * (the 'focus' situation has already tightened it): it sinks low with the
 * right fist chambered at its hip and the left hand held out, utterly still
 * but for a tremor, then a low, fast hop in and an explosive straight right
 * from the hip with a big step, held locked out a beat as the blow lands.
 */
export const focusPunch = clip('focus_punch', [
  key(0),
  key(0.24, sink(-0.06), bend(6, 2, 0, 4), twist(-14), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(0.46, sink(-0.066), bend(6.5, 2, 0, 4.5), twist(-15), tremor(1), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(0.6, flying(0.6, 0.06), bend(10, 3, 0, 4), twist(-16), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(0.7, landed(), bend(12, 3, 0, 4), twist(-19), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  snap(0.78, atFoe(0.18), pelvis(0, -0.05, 0.035), bend(15, 4, 0, 3), twist(24), PUNCH_R, FISTS, jaw(18), ANGRY),
  key(0.94, atFoe(0.2), pelvis(0, -0.052, 0.036), bend(16, 4, 0, 3), twist(27), tremor(1), PUNCH_R, FISTS, jaw(16), ANGRY),
  key(1.1, atFoe(0.19), pelvis(0, -0.05, 0.034), bend(15, 4, 0, 3), twist(26), tremor(-1), PUNCH_R, FISTS, jaw(14), ANGRY),
  key(1.26, atFoe(0.05), pelvis(0, -0.035), bend(6, 2, 0, 0), twist(6), ELBOWS_OUT, ANGRY),
  ...hopHome(1.42, ELBOWS_OUT, ANGRY),
  key(1.76, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.1, OPEN_EYES),
], [[0.83, 'impact']]);

/**
 * DynamicPunch: a slow, huge wind-up, the whole body coiling away from the
 * foe with the right arm swung back and up behind its head and the knees
 * deep, trembling with it; a heavy leap in, the fist raised, and it comes
 * down on the foe driving the overhand down through it with everything. The
 * impact rocks both: a beat of stillness in the follow-through, then home.
 */
export const dynamicPunch = clip('dynamic_punch', [
  key(0),
  key(0.3, sink(-0.05), bend(4, 2, 0, 4), twist(-20), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
  key(0.56, sink(-0.1, -0.02), bend(-6, -2, 0, 2), twist(-40), WINDMILL, FISTS, MOUTH_SHUT, NARROW),
  key(0.72, sink(-0.106, -0.022), bend(-7, -2, 0, 1), twist(-42), tremor(1), WINDMILL, FISTS, MOUTH_SHUT, NARROW),
  key(0.9, flying(0.55, 0.15), bend(-6, -2, 0, -4), twist(-34), OVERHAND_UP, FISTS, jaw(12), ANGRY),
  snap(1.02, atFoe(0.22), LAND_DEEP, pelvis(0, -0.02, 0.03), bend(12, 4, 1, 4), twist(26), OVERHAND_DOWN, FISTS, jaw(22), ANGRY),
  key(1.16, atFoe(0.23), LAND_DEEP, pelvis(0, -0.03, 0.032), bend(13, 4, 1, 5), twist(29), tremor(1), OVERHAND_DOWN, FISTS, jaw(18), ANGRY),
  key(1.36, atFoe(0.21), LAND_DEEP, pelvis(0, -0.024, 0.03), bend(12.5, 4, 1, 4.5), twist(28), tremor(-1), OVERHAND_DOWN, FISTS, jaw(14), ANGRY),
  key(1.54, atFoe(0.04), pelvis(0, -0.04), bend(8, 2, 0, 1), twist(8), ELBOWS_OUT, ANGRY),
  ...hopHome(1.7, ELBOWS_OUT, ANGRY),
  key(2.02, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.4, OPEN_EYES),
], [[1.07, 'impact']]);

/**
 * Ice Punch: a stiff jab-straight. It sets itself with the left fist drawn
 * back by its shoulder, hops in, and the left arm snaps out dead straight at
 * the foe and locks there, cold and hard, trembling a beat before it pulls
 * back and hops home.
 */
export const icePunch = clip('ice_punch', [
  key(0),
  key(0.2, sink(-0.04), bend(6, 2, 0, 4), twist(14), JAB_SET, FISTS, MOUTH_SHUT, NARROW),
  key(0.38, flying(0.55, 0.08), bend(6, 2, 0, 2), twist(15), JAB_SET, FISTS, MOUTH_SHUT, NARROW),
  key(0.5, landed(), bend(8, 2, 0, 3), twist(18), JAB_SET, FISTS, MOUTH_SHUT, NARROW),
  snap(0.58, atFoe(0.13), pelvis(0, -0.035, 0.025), bend(12, 3, 0, 3), twist(-18), JAB_L, FISTS, MOUTH_SHUT, ANGRY),
  key(0.74, atFoe(0.14), pelvis(0, -0.036, 0.026), bend(12.5, 3, 0, 3), twist(-19), tremor(1), JAB_L, FISTS, MOUTH_SHUT, ANGRY),
  key(0.9, atFoe(0.05), pelvis(0, -0.03, 0.01), bend(6, 2, 0, 1), twist(-4), JAB_SET, FISTS, MOUTH_SHUT, ANGRY),
  ...hopHome(1.04, ELBOWS_OUT, ANGRY),
  key(1.34, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.7, OPEN_EYES),
], [[0.63, 'impact']]);

/**
 * Counter: it takes the blow first, braced behind its forearms and rocked
 * back by it, then springs at the foe in a fury, the right arm drawn across
 * its chest, and pays it back with a huge backhand swat out through the foe.
 */
export const counter = clip('counter', [
  key(0),
  key(0.14, sink(-0.04), bend(8, 2, 0, 8), GUARD_RISING, MOUTH_SHUT, SQUINT),
  snap(0.26, sink(-0.06, -0.03), body(0, 0, -0.04), bend(-4, -2, 0, -6), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.4, sink(-0.07, -0.03), body(0, 0, -0.05), bend(-5, -2, 0, -7), CROSSED_GUARD, MOUTH_SHUT, ANGRY),
  key(0.54, flying(0.6, 0.08), bend(10, 3, 0, 2), twist(22), BACKHAND_COCK, FISTS, jaw(10), ANGRY),
  key(0.64, landed(), bend(12, 3, 0, 3), twist(26), BACKHAND_COCK, FISTS, jaw(12), ANGRY),
  snap(0.72, atFoe(0.14), pelvis(0, -0.04, 0.02), bend(14, 4, 0, 2), twist(-22), BACKHAND_OUT, FISTS, jaw(20), ANGRY),
  key(0.88, atFoe(0.14), pelvis(0, -0.04, 0.02), bend(14, 4, 0, 2), twist(-31), BACKHAND_THROUGH, FISTS, jaw(16), ANGRY),
  key(1.04, atFoe(0.04), pelvis(0, -0.035), bend(8, 2, 0, 1), twist(-6), ELBOWS_OUT, ANGRY),
  ...hopHome(1.2, ELBOWS_OUT, ANGRY),
  key(1.52, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.78, 'impact']]);

/**
 * Brick Break: the right hand raised high behind its head, edge-on; it hops
 * in, cocks it once more as it lands, and chops straight down through the
 * foe, the whole body dropping into the chop, the hand following through low.
 */
export const brickBreak = clip('brick_break', [
  key(0),
  key(0.22, sink(-0.04), bend(6, 2, 0, 2), twist(-14), CHOP_RAISED, SPLAY, MOUTH_SHUT, ANGRY),
  key(0.4, flying(0.55, 0.08), bend(4, 1, 0, 0), twist(-14), CHOP_RAISED, SPLAY, MOUTH_SHUT, ANGRY),
  key(0.52, landed(), bend(6, 1, 0, 0), twist(-18), CHOP_COCKED, SPLAY, MOUTH_SHUT, ANGRY),
  snap(0.6, atFoe(0.13), sink(-0.08, 0.02), bend(26, 8, 0, 8), twist(4), CHOP_STRAIGHT, SPLAY, jaw(12), ANGRY),
  key(0.76, atFoe(0.14), sink(-0.09, 0.02), bend(28, 8, 0, 8), twist(6), CHOP_LOW, SPLAY, jaw(8), ANGRY),
  key(0.94, atFoe(0.04), sink(-0.04), bend(10, 2, 0, 0), twist(2), ELBOWS_OUT, ANGRY),
  ...hopHome(1.1, ELBOWS_OUT, ANGRY),
  key(1.42, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.8, OPEN_EYES),
], [[0.66, 'impact']]);

/**
 * Rock Smash: a hammer blow as onto a boulder. It hops in raising both fists
 * clasped high, draws them back behind its head as it lands, and clubs them
 * down onto the foe with its whole weight, sinking into the blow.
 */
export const rockSmash = clip('rock_smash', [
  key(0),
  key(0.22, sink(-0.04), bend(6, 2, 0, 4), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
  key(0.4, flying(0.55, 0.1), bend(-6, -3, -2, -8), CLUB_UP, FISTS, jaw(6), ANGRY),
  key(0.54, landed(), bend(-10, -4, -2, -10), CLUB_BACK, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.64, atFoe(0.18), sink(-0.08, 0.02), bend(14, 5, 1, 4), CLUB_DOWN, FISTS, jaw(16), ANGRY),
  key(0.8, atFoe(0.19), sink(-0.095, 0.02), bend(16, 5, 1, 5), CLUB_LOW, FISTS, jaw(10), ANGRY),
  key(0.98, atFoe(0.04), sink(-0.045), bend(10, 3, 0, 2), ARMS_DOWN_FRONT, ANGRY),
  ...hopHome(1.14, ELBOWS_OUT, ANGRY),
  key(1.46, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.85, OPEN_EYES),
], [[0.7, 'impact']]);

/**
 * Strength: it plants itself against the foe and heaves. A heavy hop in with
 * the arms spread for it, both palms set on the foe as it lands, a deep sumo
 * squat to load, then the legs drive and the arms straighten in one mighty
 * two-handed shove, the body stretching out behind it.
 */
export const strength = clip('strength', [
  key(0),
  key(0.24, sink(-0.06), bend(10, 3, 0, 6), SUMO_GUARD, SPLAY, MOUTH_SHUT, ANGRY),
  key(0.42, flying(0.55, 0.08), bend(8, 2, 0, 4), SUMO_GUARD, SPLAY, MOUTH_SHUT, ANGRY),
  key(0.54, landed(), bend(14, 4, 0, 4), PALMS_ON, SPLAY, MOUTH_SHUT, SQUINT),
  key(0.72, atFoe(0.05), sink(-0.1), bend(18, 5, 0, 5), PALMS_ON, SPLAY, MOUTH_SHUT, SQUINT),
  snap(0.84, atFoe(0.26), pelvis(0, -0.02, 0.04), bend(14, 4, 0, 2), PUSH, SPLAY, jaw(18), ANGRY),
  key(1.0, atFoe(0.3), pelvis(0, -0.02, 0.05), bend(15, 4, 0, 2), PUSH_LOW, SPLAY, jaw(16), ANGRY),
  key(1.18, atFoe(0.08), pelvis(0, -0.035), bend(10, 2, 0, 1), ELBOWS_OUT, ANGRY),
  ...hopHome(1.34, ELBOWS_OUT, ANGRY),
  key(1.66, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.0, OPEN_EYES),
], [[0.88, 'impact']]);

// Seismic Toss ------------------------------------------------------------------------

/** Arms flung wide at chest height, reaching round the foe (a bear hug about to close). */
const HUG_OPEN = arms([0.85, 0.05, 0.52], [0.5, 0.05, 0.86], [0.05, 0.0, 1.0]);
/** The hug closing (a breakdown between HUG_OPEN and HUG). */
const HUG_MID = arms([0.7, -0.03, 0.72], [0.0, 0.05, 1.0], [-0.45, 0.05, 0.89]);
/** Arms locked round the foe's waist, the hands meeting in front of the chest. */
const HUG = arms([0.45, -0.1, 0.89], [-0.55, 0.05, 0.83], [-0.8, 0.1, 0.6]);
/** Hoisting it up against the chest (overhead would carry the foe off the screen). */
const HOIST = arms([0.42, 0.14, 0.9], [-0.4, 0.3, 0.87], [-0.62, 0.3, 0.72]);

/**
 * Seismic Toss: a sumo's bear hug and a slam. Squares up with the arms flung
 * wide, a low heavy hop in, and the arms close round the foe as it lands
 * (grab: from here it rides in the grip). Sinks deep with it, straining, then
 * heaves it up against its chest (overhead, the foe would leave the screen)
 * and leaps straight up with it, spinning round once in the air; at the top
 * it folds forward and hurls it down into its own place (throw), dropping
 * after it to land crouched right over it as it crashes (impact), arms still
 * driving down. It straightens, watching it get up, and hops home.
 */
export const seismicToss = clip('seismic_toss', [
  key(0),
  key(0.22, pelvis(0, -0.075, -0.01), bend(6, 2, 0, 2), HUG_OPEN, MOUTH_SHUT, ANGRY),
  key(0.4, flying(0.6, 0.06), bend(6, 2, 0, 0), HUG_OPEN, MOUTH_SHUT, ANGRY),
  key(0.52, landed(), body(0, 0, 0.18), bend(0, 1, 0, 2), HUG_MID, MOUTH_SHUT, ANGRY),
  key(0.64, atFoe(0.22), pelvis(0, -0.09), bend(2, 2, 0, -2), HUG, MOUTH_SHUT, ANGRY),
  key(0.8, atFoe(0.21), pelvis(0, -0.12), bend(4, 2, 0, 0), HUG, MOUTH_SHUT, SQUINT),
  key(0.94, atFoe(0.19), pelvis(0, -0.135), bend(1, 1, 0, 2), HUG, MOUTH_SHUT, SQUINT),
  key(1.08, atFoe(0.06), body(0, 0.12, 0, 0, 0, 110), HOP, pelvis(0, 0.01), bend(-10, -6, -2, -10), HOIST, jaw(10), ANGRY),
  key(1.2, atFoe(0.0), body(0, 0.18, 0, 0, 0, 250), HOP, pelvis(0, 0.01), bend(-12, -6, -2, -12), HOIST, jaw(12), ANGRY),
  key(1.3, atFoe(0.02), body(0, 0.19, 0, 0, 0, 360), HOP, pelvis(0, 0.01), bend(-16, -8, -3, -14), HOIST, jaw(14), ANGRY),
  snap(1.38, atFoe(0.14), body(0, 0.13, 0, 0, 0, 360), HOP, pelvis(0, -0.02), bend(18, 6, 1, 5), HAMMER_DOWN, jaw(20), ANGRY),
  fall(1.52, atFoe(0.28), body(0, 0, 0, 0, 0, 360), LAND, pelvis(0, -0.11), bend(18, 6, 1, 5), HAMMER_DOWN, jaw(16), ANGRY),
  key(1.62, atFoe(0.29), body(0, 0, 0, 0, 0, 360), LAND, pelvis(0, -0.125), bend(19, 6, 1, 5), HAMMER_DOWN, jaw(20), ANGRY),
  key(1.84, atFoe(0.2), body(0, 0, 0, 0, 0, 360), pelvis(0, -0.085), bend(14, 4, 0, 3), HAMMER_DOWN, jaw(22), ANGRY),
  key(2.02, atFoe(0.04), body(0, 0, 0, 0, 0, 360), pelvis(0, -0.04), bend(8, 2, 0, 0), jaw(6), ANGRY),
  key(2.18, { advance: 0.5, root: { y: 0.06, yaw: 360 } }, HOP, ANGRY),
  key(2.34, { advance: 0, root: { yaw: 360 } }, LAND_HOME, ANGRY),
  key(2.7, { root: { yaw: 360 } }, OPEN_EYES),
], [[0.7, 'grab'], [1.41, 'throw'], [1.6, 'impact']]);

export const FIST_CLIPS = [megaPunch, focusPunch, dynamicPunch, icePunch, counter, brickBreak, rockSmash, strength, seismicToss];

