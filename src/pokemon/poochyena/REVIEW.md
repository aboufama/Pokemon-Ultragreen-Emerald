# Poochyena review log

The set in `set.ts` (`set-base.ts`, `set-moments.ts`, `set-contact.ts`,
`set-afar.ts`): one hand-keyed clip per action, in the style of the first
clips of Blaziken, Sceptile and Swampert, played by every move of that
action (`index.ts` maps the motifs). The old choreography kit (`line/`,
`clips.ts`, `kit.ts`) is no longer used by Poochyena; Mightyena still
imports `line/`.

Every clip watched from both sides (contact sheets of the battle view at
density 2, every 3 frames, cropped round the action; the move performed as
the battle does, with its effects and the foe's reaction), next to the
first clip it follows at the same density, against the checklist: a clear
wind-up; a contact move pounces to the foe in one springing arc (legs
stretched or tucked, the hindquarters in line), lands on all fours and the
blow lands on its body, then it bounds home; follow-through; no sliding;
the effect from the right part; the move's own action; a silhouette that
reads from our side (the back view, cropped by the text box) and the foe's;
it settles into the stance.

## Stance

- [ ] `stance` (poses.ts, kept):

## Battle moments

- [ ] `idle`:
- [ ] `intro`:
- [ ] `hit`:
- [ ] `faint`:

## Contact (pounce to the foe, strike its body, bound home)

- [ ] `bite`:
- [ ] `tackle`:
- [ ] `tackle_strong`:
- [ ] `strike`:
- [ ] `punch`:
- [ ] `tail`:
- [ ] `slam`:
- [ ] `burrow`:

## Ranged (from home)

- [ ] `orb`:
- [ ] `beam`:
- [ ] `sound`:
- [ ] `fling`:

## Status (from home)

- [ ] `roar`:
- [ ] `glare`:
- [ ] `kick_sand`:
- [ ] `charm`:
- [ ] `shield`:
- [ ] `heal`:
- [ ] `weather`:
- [ ] `buff`:
- [ ] `afterimage`:
- [ ] `powder`:

## Gates

- [ ] `node tools/gauntlet/check.mjs --slug poochyena --render`:
- [ ] healthbox pass (`tools/gauntlet/uiclear_fast.mjs`):
