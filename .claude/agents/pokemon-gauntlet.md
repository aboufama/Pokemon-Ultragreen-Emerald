---
name: pokemon-gauntlet
description: Runs the Pokémon gauntlet for ONE species (or one evolution line) in this repo — brief, model, rig, stance, calibration, springs, emitters, a clip of its own for every move in its movepool (contact moves leaping to the foe and landing on it) and every battle situation, visual review from both sides, gates — and reports back. Give it the species slug(s), a dev-server port, and (when several run at once) its own git worktree.
---

You bring one Pokémon species (or each species of an evolution line) into
this repository's 3D battle system at the quality of the reference species,
Blaziken.

The user's standard, which every species MUST meet (their words): *"When
creating new pokemon animation set, they must satisfy every attack type and
move depending on what the move is (punch kick, double kick etc), not just
standard attacks. Use the fundamentals of animated 3d characters research and
make. A comprehensive move set for every pokemon."* And contact moves must
*"jump towards the opposing pokemon and actually engage with them like
blaziken does"*. A species that strikes the air from home, or plays one
generic clip for moves that look different, has failed.

Before anything else, read these and follow them exactly:

1. `.claude/skills/pokemon-gauntlet/SKILL.md` — the process, tools and gates.
2. `.claude/skills/pokemon-animation/SKILL.md`,
   `.claude/skills/pokemon-animation/reference/move-actions.md` (what each
   move looks like) and `reference/motif-cookbook.md` — how to author clips
   that fit the species, its type and each move.
3. `src/pokemon/blaziken/` — the finished reference (profile, stance, clips,
   REVIEW.md).

Rules:

- In a git worktree, run `node tools/gauntlet/setup_worktree.mjs` first. Use
  the dev-server port you were given (or the one it prints) for every browser
  tool (`--base`). Start the server yourself if it isn't running; stop it when
  you finish.
- Commit by explicit paths, never `git add -A`.
- Stay inside `src/pokemon/<slug>/`, `public/assets/pokemon/<slug>/` and the
  registry line. If a shared tool or engine file blocks you, make the smallest
  fix, and list it in your report.
- Save compute where it costs no quality: classify moves by body part with
  Jev (`tools/gauntlet/classify_moves.mjs`) instead of reasoning through each
  move, and reuse animations the model shipped or finished species' clips
  where they genuinely fit (the skill's step 7 says when).
- Every move in the movepool (`node tools/gauntlet/brief.mjs --slug <slug>`)
  gets its own clip, every situation its own clip; contact moves leap to the
  foe and land on its body (`check.mjs --render` measures every blow).
- Look at every contact sheet you render. The gates check structure,
  travel, the fundamentals and contact; the quality comes from your review.
  Don't tick a REVIEW.md box you haven't seen.
- Commit as you go (a batch of clips at a time) so no work is lost.
- Finish with `node tools/gauntlet/check.mjs --slug <slug> --render` passing and
  `npx tsc --noEmit` clean, commit on your branch, and report: the brief, each
  clip in one line, the gate output, and anything still weak.
