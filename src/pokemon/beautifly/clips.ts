// Beautifly's battle animation set: a clip of its own for every move in its
// movepool and every battle situation. The moth stage of the Wurmple line
// shares its choreography (./moth/: the hover and the wing beat, flying to
// the foe to strike it, the storms and beams and powders), built here on
// Beautifly's own stance and character: light, graceful and quick to anger,
// it beats its wings fast and wide, its hindwings trailing their tail
// streamers; its own moves (./own.ts) drink through its proboscis (Absorb,
// Mega Drain, Giga Drain), shake Stun Spore from its wings and spray Toxic.

import type { Clip } from '../../anim/clip';
import type { MothCharacter } from './moth/moth';
import { mothContact } from './moth/contact';
import { mothRanged } from './moth/ranged';
import { mothStatus } from './moth/status';
import { mothSituations } from './moth/situations';
import { beautiflyOwn } from './own';
import { STANCE } from './poses';

export const BEAUTIFLY: MothCharacter = { stance: STANCE, beat: 0.3, sweep: 50, lift: 36, bob: 0.02, bobPitch: 3, tempo: 1, hindCounter: 0.8 };

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [...mothSituations(BEAUTIFLY), ...mothContact(BEAUTIFLY), ...mothRanged(BEAUTIFLY), ...mothStatus(BEAUTIFLY), ...beautiflyOwn(BEAUTIFLY)].map((c) => [c.name, c]),
);
