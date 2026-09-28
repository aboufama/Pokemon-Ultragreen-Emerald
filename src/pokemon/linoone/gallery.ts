// TEMPORARY: test poses for the rig lab (?pose=g1...), to verify the deltas.
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';
import { bend, ears, fore, hind, rump, tail } from './set';

const p = (...d: Pose[]): Pose => compose(STANCE, ...d);
const HUG = fore([0.1, -0.3, 0.95], [-0.45, 0.35, 0.82], [-0.1, -0.3, 0.95], [0.45, 0.35, 0.82]);

export const GALLERY: Record<string, Pose> = {
  b4: p({ root: { y: 0.35 } }, bend(70, 30, 20, 40), rump(-70), tail(0, 0, -90), ears(-30), hind(-90, 80), HUG),
  b5: p({ root: { y: 0.3 } }, bend(60, 30, 40, 50), rump(-60), tail(10, 0, -100), ears(-30), hind(-80, 70), HUG),
  b6: p({ root: { y: 0.35 } }, bend(80, 20, 30, 50), rump(-80), tail(-10, 0, -90), ears(-30), hind(-90, 90), HUG),
};
