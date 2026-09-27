// Tackles, rams and shoves (the whole body, the shoulder, the head, the
// elbow, both hands): every one goes to the foe and strikes it there, then
// hops home. Each is its own action: a blur of a shoulder dash (Quick Attack),
// a stalk and an elbow from the shadows (Pursuit), a stamping tantrum and a
// double-fisted pounding (Frustration), a glad bound and a full-body tackle
// (Return), a puffed-up headbutt (Facade), a gathered double palm thrust
// (Secret Power), a heave from below (Strength), a reckless headlong ram
// with its recoil (Double-Edge), a gritty straining shove (Endeavor) and a
// clumsy, spent flail (Struggle). Written in Sceptile's time.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/**
 * Quick Attack: barely a crouch and it's gone: a long, low, flat dash, the
 * right shoulder driven into the foe, and it springs straight back home off
 * it. The fastest clip it has.
 */
export function quickAttack(L: Line): Clip {
  const k = L.k;
  return L.clip('quick_attack', 1.0, [
    L.key(0),
    // A flick of a crouch, leaning into the dash, arms swept back.
    L.key(0.1, L.pelvis(0, -0.06), k.bend(22, 6, 0, -10), k.FOCUS, k.tail(10), L.both('back')),
    // The dash: low and flat, the body stretched forward.
    L.key(0.2, L.at(0.6), L.air(0.04), L.legs('tuck'), k.twist(12), k.bend(30, 8, 0, -14), k.ANGRY, k.tail(20), L.both('back')),
    // The right shoulder slams in.
    L.snap(0.27, L.at(1), L.air(0.02), L.legs('drop'), k.twist(34, -6), k.bend(24, 6, 0, -10, -8), k.ANGRY, k.tail(14, 14), L.arms('crossedLow', 'back')),
    // Springs straight back off it and home.
    L.key(0.4, L.at(0.55), L.air(0.09), L.legs('hop'), k.twist(8), k.bend(4, 0, 0, -4), k.ANGRY, k.tail(16), L.both('guard')),
    L.key(0.52, L.at(0), k.LAND, k.twist(2), k.ANGRY, k.tail(4, -6), L.both('guard')),
    L.key(0.68, L.pelvis(0, -0.02), k.bend(4, 0, 0, -2), k.FOCUS, k.tail(2, 4), L.both('guard')),
    L.key(1.0, k.OPEN),
  ], [{ t: 0.3, name: 'impact' }]);
}

/**
 * Pursuit: it slinks low, head down and eyes narrowed, stalking; then a
 * sudden dart from the shadows and the right elbow driven into the foe.
 */
export function pursuit(L: Line): Clip {
  const k = L.k;
  return L.clip('pursuit', 1.44, [
    L.key(0),
    // Slink down low, head level with the shoulders, eyes narrowed.
    L.key(0.18, L.pelvis(0, -0.08), k.bend(24, 8, 4, -8), k.FOCUS, k.tail(-6, 6), L.arms('crossedLow', 'guardLow')),
    // Stalking: the weight creeps forward, the elbow cocked across the chest.
    L.key(0.34, L.pelvis(0, -0.085), k.twist(-18), k.bend(28, 8, 4, -10, 8), k.FOCUS, k.tail(-8, -6), L.arms('backhandCock', 'guardLow')),
    // The dart.
    L.key(0.44, L.at(0.6), L.air(0.05), L.legs('tuck'), k.twist(-22), k.bend(26, 8, 2, -10, 8), k.ANGRY, k.tail(6, -8), L.arms('backhandCock', 'guardLow')),
    L.key(0.52, L.at(1), k.LAND, L.legs('lungeR'), k.twist(-22), k.bend(26, 8, 2, -10, 8), k.ANGRY, k.tail(0, -8), L.arms('backhandCock', 'guardLow')),
    // The elbow: the chest whips round and drives the right elbow into it.
    L.snap(0.58, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.07), k.twist(30, -4), k.bend(22, 6, 0, -8, -10), k.ANGRY, k.tail(0, 16), L.arms('elbow', 'guardLow')),
    L.key(0.72, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.072), k.twist(34, -5), k.bend(23, 6, 0, -8, -12), k.FOCUS, k.tail(-2, 20), L.arms('elbow', 'guardLow')),
    L.key(0.88, L.at(1), L.pelvis(0, -0.04), k.twist(6), k.bend(12, 2, 0, -2), k.FOCUS, k.tail(2, 6), L.both('guard')),
    L.key(1.02, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.FOCUS, k.tail(10), L.both('guard')),
    L.key(1.14, L.at(0), k.LAND, k.LIGHT, k.FOCUS, k.tail(2), L.both('guard')),
    L.key(1.44, k.OPEN),
  ], [{ t: 0.64, name: 'impact' }]);
}

/**
 * Frustration: a tantrum. It stamps one foot, then the other, shaking its
 * head, fists clenched; then it flings itself at the foe and pounds it with
 * both fists, twice.
 */
export function frustration(L: Line): Clip {
  const k = L.k;
  return L.clip('frustration', 1.84, [
    L.key(0),
    // Stamp: the right foot up, fists clenched low, head shaking.
    L.key(0.12, L.plant(1, 0), L.pelvis(0.01, -0.02), k.bend(10, 2, 0, -4, 12), k.ANGRY, k.jaw(14), k.tail(6, 10), L.both('low'), k.FISTS),
    L.key(0.22, L.pelvis(0, -0.055), k.bend(16, 4, 0, -2, -12), k.ANGRY, k.jaw(6), k.tail(-4, -8), L.both('low'), k.FISTS),
    // ... and the left.
    L.key(0.32, L.plant(0, 1), L.pelvis(-0.01, -0.02), k.bend(10, 2, 0, -4, 12), k.ANGRY, k.jaw(16), k.tail(6, -10), L.both('low'), k.FISTS),
    L.key(0.42, L.pelvis(0, -0.06), k.bend(16, 4, 0, -4, -8), k.ANGRY, k.jaw(8), k.tail(-4, 8), L.both('hammerHigh'), k.FISTS),
    // Flings itself at the foe, both fists up.
    L.key(0.54, L.at(0.6), L.air(0.09), L.legs('tuck'), k.bend(-2, -2, 0, -10), k.ANGRY, k.jaw(20), k.tail(20), L.both('hammerHigh'), k.FISTS),
    L.key(0.64, L.at(1), k.LAND, k.bend(2, 0, 0, -10), k.ANGRY, k.jaw(20), k.tail(12), L.both('hammerHigh'), k.FISTS),
    // Pound!
    L.snap(0.7, L.at(1), L.pelvis(0, -0.06), k.bend(28, 10, 2, 2), k.ANGRY, k.jaw(4), k.tail(0), L.both('hammerDown'), k.FISTS),
    L.key(0.8, L.at(1), L.pelvis(0, -0.035), k.bend(6, 0, 0, -8, 6), k.ANGRY, k.jaw(18), k.tail(6, 6), L.both('hammerHigh'), k.FISTS),
    // ... pound!
    L.snap(0.88, L.at(1), L.pelvis(0, -0.065), k.bend(30, 11, 2, 4, -4), k.ANGRY, k.jaw(4), k.tail(-2, -6), L.both('hammerDown'), k.FISTS),
    L.key(1.04, L.at(1), L.pelvis(0, -0.07), k.bend(32, 12, 2, 6), k.ANGRY, k.jaw(10), k.tail(-4), L.both('hammerDown'), k.FISTS),
    L.key(1.2, L.at(1), L.pelvis(0, -0.035), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.34, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.46, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.84, k.OPEN),
  ], [{ t: 0.76, name: 'impact' }, { t: 0.94, name: 'impact' }]);
}

/**
 * Return: a glad look back over its shoulder (at its trainer), then a big,
 * bounding leap and a full-body tackle with the left shoulder, arms tucked;
 * it bounces off it, lands light and hops home.
 */
export function returnMove(L: Line): Clip {
  const k = L.k;
  return L.clip('return', 1.7, [
    L.key(0),
    // A happy glance back over its shoulder, the tail swishing.
    L.key(0.16, L.pelvis(0, -0.01), k.twist(20), k.bend(-4, -2, 0, -6, 44, 6), k.HAPPY, k.tail(8, 16), L.both('palmsUp')),
    L.key(0.3, L.pelvis(0, -0.02), k.twist(22), k.bend(-4, -2, 0, -6, 48, 8), k.HAPPY, k.tail(8, -16), L.both('palmsUp')),
    // Round to the foe: a crouch to bound.
    L.key(0.44, L.pelvis(0, -0.075), k.bend(16, 4, 0, -8), k.FOCUS, k.tail(6), L.both('back')),
    // A big bound, arcing high.
    L.key(0.58, L.at(0.5), L.air(0.17), L.legs('hop'), k.bend(4, 0, 0, -8), k.ANGRY, k.tail(26), L.both('back')),
    L.key(0.7, L.at(0.9), L.air(0.1), L.legs('tuck'), k.twist(-26), k.bend(14, 4, 0, -8, -10), k.ANGRY, k.tail(20, -10), L.both('crossed')),
    // The tackle: the left shoulder drives into the foe with the whole body.
    L.snap(0.77, L.at(1), L.air(0.03), L.legs('drop'), k.twist(-40, 6), k.bend(20, 6, 0, -8, -12), k.ANGRY, k.tail(10, -18), L.both('crossed')),
    // Bounce off it.
    L.key(0.9, L.at(0.88), L.air(0.1), L.legs('hop'), k.twist(-12), k.bend(-6, -2, 0, -4), k.HAPPY, k.tail(18, 8), L.both('spread')),
    L.key(1.02, L.at(0.84), k.LAND, k.twist(-4), k.HAPPY, k.tail(6), L.both('guard')),
    L.key(1.18, L.at(0.84), L.pelvis(0, -0.03), k.bend(8, 2, 0, -2), k.HAPPY, k.tail(4, 6), L.both('guard')),
    L.key(1.3, L.at(0.4), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.HAPPY, k.tail(10), L.both('guard')),
    L.key(1.42, L.at(0), k.LAND, k.LIGHT, k.HAPPY, k.tail(2), L.both('guard')),
    L.key(1.7, k.OPEN),
  ], [{ t: 0.8, name: 'impact' }]);
}

/**
 * Facade: it puffs itself up, chest out and arms flexed (a brave front),
 * then lowers its head and rams its forehead into the foe; it rebounds a
 * little dazed, shakes its head clear and hops home.
 */
export function facade(L: Line): Clip {
  const k = L.k;
  return L.clip('facade', 1.66, [
    L.key(0),
    // Puffed up: chest out, arms flexed, chin up.
    L.key(0.16, L.pelvis(0, 0.01), k.bend(-10, -6, 0, -10), k.ANGRY, k.tail(12, 6), L.both('flex'), k.FISTS),
    L.key(0.3, L.pelvis(0, 0.012), k.bend(-12, -6, 0, -12, 0, 4), k.ANGRY, k.tail(14, -6), L.both('flex'), k.FISTS),
    // Head down for the ram.
    L.key(0.42, L.pelvis(0, -0.07), k.bend(24, 8, 10, 18), k.FOCUS, k.tail(6), L.both('back'), k.FISTS),
    L.key(0.52, L.at(0.6), L.air(0.08), L.legs('tuck'), k.bend(28, 8, 12, 20), k.ANGRY, k.tail(18), L.both('back'), k.FISTS),
    // The ram: the forehead into the foe.
    L.snap(0.6, L.at(1), L.air(0.02), L.legs('drop'), k.bend(34, 10, 14, 24), k.ANGRY, k.tail(10), L.both('back'), k.FISTS),
    // Rebounds, a little dazed.
    L.key(0.72, L.at(1), k.LAND, k.bend(8, 2, -4, -8, 0, 6), k.HURT, k.tail(10), L.both('wide')),
    L.key(0.84, L.at(1), L.pelvis(0, -0.03), k.bend(8, 2, 0, -2, 14, -4), k.HURT, k.tail(4, 8), L.both('wide')),
    L.key(0.94, L.at(1), L.pelvis(0, -0.03), k.bend(8, 2, 0, -2, -12, 4), k.ANGRY, k.tail(4, -8), L.both('guard')),
    L.key(1.06, L.at(1), L.pelvis(0, -0.035), k.bend(10, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.2, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.32, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.66, k.OPEN),
  ], [{ t: 0.66, name: 'impact' }]);
}

/**
 * Secret Power: it gathers a hidden power, hands cupped together low in
 * front, eyes shut; draws both hands back to its hips; springs in and thrusts
 * both palms into the foe, the power bursting out of them.
 */
export function secretPower(L: Line): Clip {
  const k = L.k;
  return L.clip('secret_power', 1.62, [
    L.key(0),
    // Gather: hands together low in front, eyes shut, a stillness.
    L.key(0.18, L.pelvis(0, -0.04), k.bend(10, 2, 0, 8), k.SHUT, k.tail(4), L.both('crossedLow'), k.FLAT),
    L.key(0.32, L.pelvis(0, -0.05), k.bend(12, 2, 0, 10, 0, 2), k.SHUT, k.tail(3, 4), L.both('crossedLow'), k.FLAT),
    // Draw both hands back to the hips, eyes open on the foe.
    L.key(0.42, L.pelvis(0, -0.065), k.bend(12, 4, 0, -6), k.FOCUS, k.tail(6), L.both('fistHip'), k.FLAT),
    L.key(0.52, L.at(0.6), L.air(0.07), L.legs('tuck'), k.bend(8, 2, 0, -8), k.FOCUS, k.tail(16), L.both('fistHip'), k.FLAT),
    L.key(0.62, L.at(1), k.LAND, L.legs('lungeR'), k.bend(12, 2, 0, -8), k.FOCUS, k.tail(8), L.both('fistHip'), k.FLAT),
    // The double palm thrust.
    L.snap(0.68, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.05), k.bend(18, 6, 0, -8), k.ANGRY, k.tail(0), L.both('palm'), k.FLAT),
    L.key(0.84, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.052), k.bend(19, 6, 0, -8, 0, 2), k.ANGRY, k.tail(-2, 4), L.both('palm'), k.SPLAYED),
    L.key(1.0, L.at(1), L.pelvis(0, -0.035), k.bend(10, 2, 0, -2), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.14, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.FOCUS, k.tail(10), L.both('guard')),
    L.key(1.26, L.at(0), k.LAND, k.LIGHT, k.FOCUS, k.tail(2), L.both('guard')),
    L.key(1.62, k.OPEN),
  ], [{ t: 0.75, name: 'impact' }]);
}

/**
 * Strength: a heave. It springs in and drops into a deep squat against the
 * foe, both arms scooping in low under it, then drives up out of the squat,
 * shoulder in and arms heaving up, lifting the foe; it holds it there,
 * straining, then lets go and hops home.
 */
export function strength(L: Line): Clip {
  const k = L.k;
  return L.clip('strength', 1.84, [
    L.key(0),
    // Brace: a deep breath and a crouch, arms low and wide.
    L.key(0.2, L.pelvis(0, -0.07), k.bend(18, 4, 0, -6), k.FOCUS, k.tail(4), L.both('low'), k.FISTS),
    L.key(0.36, L.at(0.6), L.air(0.07), L.legs('tuck'), k.bend(12, 2, 0, -8), k.ANGRY, k.tail(14), L.both('low'), k.FISTS),
    // Down into a deep squat against it, arms scooping in under it.
    L.key(0.48, L.at(1), k.LAND, L.legs('squat'), L.pelvis(0, -0.1), k.bend(30, 8, 0, -10), k.ANGRY, k.tail(-4), L.both('scoop'), k.SPLAYED),
    L.key(0.58, L.at(1), L.legs('squat'), L.pelvis(0, -0.115), k.bend(32, 9, 0, -12), k.SHUT, k.tail(-6), L.both('scoop'), k.FISTS),
    // The heave: up out of the squat, shoulder in, arms driving up.
    L.snap(0.68, L.at(1), L.pelvis(0, 0.005), k.bend(4, 0, 0, -14), k.ANGRY, k.jaw(18), k.tail(10), L.both('hoist'), k.FISTS),
    // Holds it up, straining.
    L.key(0.84, L.at(1), L.pelvis(0, 0.01), k.bend(-4, -2, 0, -16, 0, 3), k.ANGRY, k.jaw(20), k.tail(14, 4), L.both('hoist'), k.FISTS),
    L.key(1.0, L.at(1), L.pelvis(0, 0.006), k.bend(-2, -2, 0, -14, 0, -3), k.SHUT, k.jaw(14), k.tail(12, -4), L.both('hoist'), k.FISTS),
    L.key(1.14, L.at(1), L.pelvis(0, -0.035), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.28, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.4, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.84, k.OPEN),
  ], [{ t: 0.72, name: 'impact' }]);
}

/**
 * Double-Edge: reckless. A deep, loaded crouch, a yell, and a headlong
 * launch with the whole body behind it like a missile, arms swept back; the
 * recoil throws it back off the foe, it lands staggering, hurt, shakes it off
 * and hops home.
 */
export function doubleEdge(L: Line): Clip {
  const k = L.k;
  return L.clip('double_edge', 1.9, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.07), k.bend(22, 6, 0, -10), k.ANGRY, k.jaw(18), k.tail(8), L.both('back'), k.FISTS),
    L.key(0.36, L.pelvis(0, -0.1), k.bend(30, 8, 2, -12), k.ANGRY, k.jaw(24), k.tail(4), L.both('back'), k.FISTS),
    // The launch: flat out, head first.
    L.key(0.48, L.at(0.55), L.air(0.1), L.legs('tuck'), k.bend(36, 8, 4, 8), k.ANGRY, k.jaw(10), k.tail(24), L.both('back'), k.FISTS),
    L.snap(0.57, L.at(1), L.air(0.04), L.legs('drop'), k.bend(40, 10, 8, 18), k.ANGRY, k.tail(18), L.both('back'), k.FISTS),
    // The recoil throws it back off the foe.
    L.key(0.7, L.at(0.8), L.air(0.12), L.legs('hop'), k.bend(-12, -4, 0, -10, 0, 8), k.HURT, k.tail(26), L.both('flinch')),
    L.key(0.84, L.at(0.74), k.LAND, L.pelvis(0, -0.07), k.bend(18, 4, 0, 6, 0, -6), k.HURT, k.tail(6), L.both('droop')),
    // Staggering, it shakes the hurt off.
    L.key(1.0, L.at(0.74), L.plant(1, 0), L.pelvis(-0.02, -0.04), k.bend(12, 2, 0, 2, 14, 6), k.HURT, k.tail(4, 12), L.arms('flinch', 'droop')),
    L.key(1.14, L.at(0.74), L.pelvis(0, -0.04), k.bend(10, 2, 0, -2, -12, -4), k.ANGRY, k.tail(4, -8), L.both('guard')),
    L.key(1.28, L.at(0.74), L.pelvis(0, -0.035), k.bend(10, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.42, L.at(0.35), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.54, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.9, k.OPEN),
  ], [{ t: 0.6, name: 'impact' }]);
}

/**
 * Endeavor: hurt and panting, it gathers its resolve, springs in and drives
 * its shoulder into the foe with everything it has left, digging in its
 * heels, straining and trembling; then pushes off and hops home.
 */
export function endeavor(L: Line): Clip {
  const k = L.k;
  return L.clip('endeavor', 1.9, [
    L.key(0),
    // Hunched and panting, hurt.
    L.key(0.16, L.pelvis(0, -0.05), k.bend(18, 4, 0, 6), k.HURT, k.jaw(12), k.tail(-4), L.both('droop')),
    L.key(0.3, L.pelvis(0, -0.04), k.bend(14, 3, 0, 4), k.HURT, k.jaw(4), k.tail(-2), L.both('droop')),
    // Resolve: it straightens, fists clenched.
    L.key(0.42, L.pelvis(0, -0.06), k.bend(12, 4, 0, -8), k.ANGRY, k.tail(6), L.both('fistHip'), k.FISTS),
    L.key(0.54, L.at(0.6), L.air(0.08), L.legs('tuck'), k.twist(-20), k.bend(18, 4, 0, -8), k.ANGRY, k.tail(16, -6), L.both('crossedLow'), k.FISTS),
    // The shoulder drives in, the heels dig.
    L.snap(0.64, L.at(1), L.legs('lungeL'), L.pelvis(0, -0.06), k.twist(-34, 5), k.bend(28, 8, 0, -8, -8), k.ANGRY, k.tail(4, -14), L.both('crossedLow'), k.FISTS),
    // Straining, trembling, eyes screwed shut.
    L.key(0.76, L.at(1), L.legs('lungeL'), L.pelvis(0, -0.07), k.twist(-36, 6), k.bend(32, 9, 0, -8, -9), k.SHUT, k.jaw(10), k.tail(2, -16), L.both('crossedLow'), k.FISTS),
    L.key(0.86, L.at(1), L.legs('lungeL'), L.pelvis(0, -0.066), k.twist(-33, 4), k.bend(31, 9, 0, -8, -7, 2), k.SHUT, k.jaw(14), k.tail(2, -12), L.both('crossedLow'), k.FISTS),
    L.key(0.96, L.at(1), L.legs('lungeL'), L.pelvis(0, -0.072), k.twist(-37, 6), k.bend(33, 9, 0, -8, -9, -2), k.ANGRY, k.jaw(18), k.tail(2, -16), L.both('crossedLow'), k.FISTS),
    // Pushes off.
    L.key(1.1, L.at(1), L.pelvis(0, -0.04), k.twist(-6), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.24, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.36, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.9, k.OPEN),
  ], [{ t: 0.68, name: 'impact' }]);
}

/**
 * Struggle: spent, it has nothing left: a heavy, clumsy hop at the foe, a
 * wild flailing swipe with both arms, and the effort hurts it; it stumbles
 * and drags itself home.
 */
export function struggle(L: Line): Clip {
  const k = L.k;
  return L.clip('struggle', 1.84, [
    L.key(0),
    // Sagging, panting.
    L.key(0.18, L.pelvis(0, -0.05), k.bend(16, 4, 0, 6, 0, 6), k.DROWSY, k.jaw(12), k.tail(-6), L.both('droop')),
    L.key(0.34, L.pelvis(0, -0.07), k.bend(20, 6, 0, 2), k.ANGRY, k.jaw(16), k.tail(-4), L.arms('wide', 'droop')),
    // A heavy, clumsy hop.
    L.key(0.48, L.at(0.6), L.air(0.05), L.legs('tuck'), k.bend(10, 2, 0, -4, 0, -6), k.ANGRY, k.jaw(20), k.tail(8), L.both('wide')),
    L.key(0.58, L.at(1), k.LAND, L.pelvis(0, -0.03), k.bend(14, 4, 0, -6, 0, 6), k.ANGRY, k.jaw(20), k.tail(6), L.arms('rakeWide', 'wide')),
    // A wild swipe, the arm flung on past as the body lurches after it...
    L.snap(0.64, L.at(1), L.pelvis(0, -0.05), k.twist(26, -6), k.bend(22, 6, 0, -4, -10), k.ANGRY, k.jaw(10), k.tail(0, 16), L.arms('slashEnd', 'wide')),
    L.key(0.74, L.at(1), L.pelvis(0, -0.058), k.twist(30, -8), k.bend(26, 7, 0, -2, -12, 6), k.HURT, k.jaw(14), k.tail(-2, 20), L.arms('slashFollow', 'wide')),
    // ... and it stumbles on into the foe, butting it with its head, arms flailing.
    L.snap(0.84, L.at(1), L.pelvis(0, -0.06), k.twist(-6, 4), k.bend(26, 8, 8, 14, 0, 6), k.HURT, k.jaw(8), k.tail(0, -10), L.both('wide')),
    // The effort hurts it: it doubles over.
    L.key(0.98, L.at(1), L.pelvis(0, -0.08), k.bend(30, 8, 0, 10, 0, 8), k.HURT, k.jaw(16), k.tail(-6), L.both('hug')),
    L.key(1.14, L.at(1), L.pelvis(0, -0.06), k.bend(24, 6, 0, 6, 0, -4), k.HURT, k.jaw(8), k.tail(-4), L.both('droop')),
    L.key(1.3, L.at(0.5), L.air(0.05), L.legs('hop'), k.bend(12, 2, 0, 2), k.DROWSY, k.tail(6), L.both('droop')),
    L.key(1.44, L.at(0), k.LAND, L.pelvis(0, -0.05), k.bend(12, 2, 0, 4), k.DROWSY, k.tail(0), L.both('droop')),
    L.key(1.62, L.pelvis(0, -0.02), k.bend(4, 0, 0, 2), k.DROWSY, k.tail(1), L.both('guardLow')),
    L.key(1.84, k.OPEN),
  ], [{ t: 0.7, name: 'impact' }, { t: 0.9, name: 'impact' }]);
}

export const TACKLES = {
  quick_attack: quickAttack, pursuit, frustration, return: returnMove, facade, secret_power: secretPower,
  strength, double_edge: doubleEdge, endeavor, struggle,
};
