# Silcoon review log

The hand-keyed set in `./set.ts` (the cocoon kit in `./cocoon/` and `./clips.ts`
is no longer used). Every clip watched frame by frame from both sides in the
battle view (`tools/shots/fastsheet.mjs`, a frame every 5-6 game frames,
cropped to each cocoon and enlarged), next to the first clips of Blaziken
(`tackle`, `physical_weak`) and Swampert (`physical_weak`) at the same
density; the Tackle also with the healthboxes and the text box drawn
(`tools/shots/move_sheet.mjs --ui 1`), both ways. Checked for: anticipation;
a contact move leaping to the foe in one arc, landing in front of it and
striking its body; follow-through; arcs, no sliding; the effect leaving the
silk opening; a silhouette that reads from our side (only the top third of
the shell shows above the text box) and from the foe's; starting and ending
on the stance. The healthbox pass (`tools/gauntlet/uiclear_fast.mjs`) is
clear for every clip at home, both sides (at most 1 px).

## Stance

- [x] stance, unchanged: it rests on its three lower strands, the loose
      strands radiating round it as the sprites draw them, square to the foe
      with its eyes and silk opening on it. Grounded from both sides (the
      lower strands on the ground over its shadow). Fit: IoU 0.69 / 0.71,
      box 0.84 / 0.82.

## Battle moments

- [x] `idle`: a buoy's bob, rising as it rocks to one side and settling as it rocks to the other, the second bob a little smaller; passes through its stance moving (no dead holds in `motion.mjs`), strands quivering, blinks
- [x] `intro`: curled low with its eyes shut and its strands drawn in, it pops up in a springy hop, eyes wide and strands flung out, shivers at the top (the cry), lands soft and bobs twice; from our side the hop stays well under the foe's healthbox
- [x] `hit`: rocks back on its strands with its eyes squeezed and its strands drawn in, wobbles upright through a small overshoot
- [x] `faint`: a tired sway with drooping eyes, then its top bows over and it slumps on its strands, eyes shut and strands hanging limp, still sagging as it shrinks away; it sits back as it slumps, so as the foe its lower strands stay on the top of our healthbox

## Its moves

The category clips its moves take, each mapped from its moves' motif in
`motifClips`.

- [x] `physical_weak` (tackle): Tackle, Struggle. The coil (it settles and rocks well back on its strands, eyes narrowing), one high, buoyant arc to the foe with its strands trailing, a soft landing in front of it, then the bump: its whole shell thrown into the foe brow first (a 5-frame snap; the foe flinches and is knocked back on the impact), pressed against it a beat, then it bounces off in one arc home and bobs twice to rest. From our side the hop lifts it out of the text box and away to the foe; from the foe's side it arcs down in front of our Silcoon's dome. Blaziken's physical_weak and tackle phases and timing: 0.24 s coil, 0.25 s in the air, the landing, the snap, follow-through, the hop home, the settle
- [x] `special_weak` (spit): Poison Sting. Draws back and swells (the breath in), flicks forward in a little springing jolt off its strands with its eyes on the foe, the barb leaves the opening, drops back recoiling and bobs. Blaziken's special_weak
- [x] `status_self` (shield): Harden. A slow breath in (swelling, eyes lidded, then shut), then the whole shell tightens at once: it shrinks hard, its strands stand stiff and its eyes squeeze shut as the shine (the barrier) spreads; it is still tight and trembling after the shine passes, then eases off and bobs, placid again. Blaziken's status_self and shield
- [x] `status_target` (powder): String Shot. Rocks back and swells gathering silk, thrusts forward with its opening and eyes on the foe, and the thread streams from the opening while it sweeps the stream across the foe (its top turning one way, then the other), then rocks back and bobs. Blaziken's status_target and special_strong's sustain
