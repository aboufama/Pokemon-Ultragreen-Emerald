# Cascoon review log

The hand-keyed set in `./set.ts`, its own (no longer Silcoon's kit clips
scaled in time; `./clips.ts` is no longer used). Every clip watched frame by
frame from both sides in the battle view (`tools/shots/fastsheet.mjs`, a
frame every 5-8 game frames, cropped to each cocoon and enlarged), next to
the first clips of Blaziken (`tackle`, `physical_weak`) and Swampert's heavy
`physical_weak` at the same density; the Tackle also with the healthboxes
and the text box drawn (`tools/shots/move_sheet.mjs --ui 1`) from our side.
Checked for: anticipation; a contact move leaping to the foe in one arc,
landing in front of it and striking its body; follow-through; arcs, no
sliding; the effect leaving the silk opening; its glare staying on the foe;
a silhouette that reads from our side (only the top third of the shell shows
above the text box) and from the foe's; starting and ending on the stance.
The healthbox pass (`tools/gauntlet/uiclear_fast.mjs`) is clear for every
clip at home, both sides (0 px).

Its character against Silcoon's: where Silcoon rocks back and bobs, Cascoon
hunches and glares. Its hunch comes from bending its top forward and
squatting, not tipping its whole shell (tipped, its eyes turned down out of
view, which lost the glare; the first pass did that and was fixed).

## Stance

- [x] stance, unchanged: it rests on its lower strands, the upper strands
      swept back as the sprite draws them, square to the foe with its slanted
      red eyes on it. Grounded from both sides. Three more hunkered
      candidates were compared (`tools/calibrate/candidates.mjs`): they read
      the same at battle size and failed the foe side's box fit (0.72-0.73),
      so the hunch lives in its clips. Fit: IoU 0.66 / 0.78, box 0.78 / 0.69.

## Battle moments

- [x] `idle`: it hides motionless and glares: a slow, heavy breath swells it and hunches its top a touch, and its glare narrows on the foe for a moment and opens again; never frozen (the strands quiver, the life layer breathes)
- [x] `intro`: curled tight with its eyes shut and its strands drawn in, it heaves itself up in a short, heavy hop, eyes open and strands bristling, thuds down hunched over its glare and shudders at the foe (the cry), then settles glaring
- [x] `hit`: heavy, it jolts back only a little with its eyes squeezed, then settles forward and glares back
- [x] `faint`: a grudging sway with its glare failing, then it settles down onto its strands with its top bowed over its shut eyes and its strands hanging limp, still settling as it shrinks away; it sits back, so as the foe its lower strands stay on the top of our healthbox

## Its moves

The category clips its moves take, each mapped from its moves' motif in
`motifClips`.

- [x] `physical_weak` (tackle): Tackle, Struggle. A grumpy rock back, then it hunkers down low and squat with its glare fixed on the foe and digs in (the coil), hops at the foe in one low, heavy arc brow first, thuds down deep in front of it, then rams its whole shell into it brow first (a 6-frame snap; the foe flinches and is knocked back on the impact) and grinds against it one way and the other, pulls back off it, hops home low and heavy, thuds down and settles with a rock. Lower and slower than Silcoon's (0.09 hop against 0.16, 1.72 s against 1.45 s): Blaziken's physical_weak phases re-timed for weight, as Swampert's shoulder charge
- [x] `special_weak` (spit): Poison Sting. Draws in and tenses with a shiver, its glare fixed on the foe, then jerks its shell forward hard (no hop: it is heavy) and the barb leaves the opening; it holds the glare after it a beat, then pulls back. Blaziken's special_weak
- [x] `status_self` (shield): Harden. A short breath in, then it hunches and clenches its whole shell (it shrinks hard, its strands clamped flat against it like armour) as the shine (the barrier) spreads, glaring through it rather than closing its eyes; still clenched and trembling after the shine passes, then it unclenches slowly. Blaziken's status_self and shield
- [x] `status_target` (powder): String Shot. Rears back and swells gathering silk, thrusts forward, and holds its aim rigidly on the foe with a shudder while the thread streams from its opening, glaring; then settles back heavily. Blaziken's status_target and special_strong's sustain
