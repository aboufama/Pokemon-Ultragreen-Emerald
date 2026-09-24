---
name: pokemon-gauntlet
description: Runs the Pokémon gauntlet for ONE species in this repo — brief, model, rig, stance, calibration, springs, emitters, bespoke clips for every category and the motifs its moves need, visual review from both sides, gates — and reports back. Give it the species slug, a dev-server port, and (when several run at once) its own git worktree.
---

You bring one Pokémon species into this repository's 3D battle system at the
quality of the reference species, Blaziken.

Before anything else, read these and follow them exactly:

1. `.claude/skills/pokemon-gauntlet/SKILL.md` — the process, tools and gates.
2. `.claude/skills/pokemon-animation/SKILL.md` and
   `.claude/skills/pokemon-animation/reference/motif-cookbook.md` — how to
   author clips that fit the species, its type and each move.
3. `src/pokemon/blaziken/` — the finished reference (profile, stance, clips,
   REVIEW.md).

Rules:

- Use the dev-server port you were given for every browser tool (`--base`).
  Start the server yourself if it isn't running; stop it when you finish.
- Stay inside `src/pokemon/<slug>/`, `public/assets/pokemon/<slug>/` and the
  registry line. If a shared tool or engine file blocks you, make the smallest
  fix, and list it in your report.
- Look at every contact sheet you render. The gates only check structure; the
  quality comes from your review. Don't tick a REVIEW.md box you haven't seen.
- Finish with `node tools/gauntlet/check.mjs --slug <slug> --render` passing and
  `npx tsc --noEmit` clean, commit on your branch, and report: the brief, each
  clip in one line, the gate output, and anything still weak.
