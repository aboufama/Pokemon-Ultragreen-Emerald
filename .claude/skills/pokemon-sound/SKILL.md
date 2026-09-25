---
name: pokemon-sound
description: Add or place music and sound effects in this repo, or change the sound engine, the way Emerald does it — the game's own songs converted from the decomp, played by the port of its m4a engine, cued where the decomp cues them. Use when adding a song or sound effect, when a sound is missing, wrong, cut off or never stops, when touching src/audio, tools/extract/extract_sound.py or tools/sound, or when checking the engine against the game.
---

# Music and sound effects

The sound is Emerald's own, never an approximation: the songs are the decomp's
MIDI and samples converted by its own tools (mid2agb, wav2agb), and they are
played by a port of its sound engine (MusicPlayer2000, "m4a"). The game code
calls sound the way the decomp calls `sound.c`.

Read `src/audio/sound.ts` (the API the game uses), then the header of
`src/audio/m4a.ts` (the engine) and of `tools/extract/extract_sound.py`.

## What it is made of

| piece | where |
|---|---|
| the songs: bytecode, voicegroups, keysplits, waves, samples (`bank.json`, `samples.bin`), converted from the decomp; `SONGS` lists what is extracted | `tools/extract/extract_sound.py`, `public/assets/sound/` |
| the engine: the four music players and their sequencer (MPlayMain), SoundMainRAM's DirectSound mixer and reverb, CgbSound on a model of the GB channels, the GBA's output stage, and what sound.c adds (fanfares, panned effects, a BGM waiting for a fade-out) | `src/audio/m4a.ts` |
| the page side: an AudioWorklet built from the engine's source, audio unlocked by the first press, `playBGM` / `fadeOutBGM` / `playSE` / `playSEPanned` / `stopSE` / `fanfare`, `{PLAY_SE ...}` in text | `src/audio/sound.ts`, `src/gba/font.ts` |
| the cues | `src/battle/scene.ts`, `src/menus/`, `src/demo/playtest.ts`, `src/battle/engine.ts` (text) |

## Rules

1. **Cue it where the game does.** Find the call in the decomp (`grep -rn
   "PlaySE\|PlayBGM\|PlayFanfare\|m4aSongNumStart\|m4aSongNumStop\|PLAY_SE" src
   data`) and put the cue at the same moment with the same kind of call:
   `PlaySE` → `playSE`, `PlaySE12WithPanning` → `playSEPanned` with
   `panFor(side)` (SOUND_PAN_ATTACKER -64, SOUND_PAN_TARGET 63), `PlayBGM` →
   `playBGM`, `FadeOutBGM(n)` → `fadeOutBGM(n)`, `PlayFanfare` → `fanfare(song,
   frames)` with the frames of `sFanfares`, `m4aSongNumStop` → `stopSE`, and
   `{PLAY_SE SE_X}` in a string stays in the string. Put a comment naming the
   decomp function next to the cue.
2. **Songs by their decomp names**, lowercased (`MUS_VS_WILD` → `mus_vs_wild`).
   A new one goes in `SONGS` in `extract_sound.py`, then re-run it; the check
   fails while code names a song the bank lacks, and warns about songs nothing plays.
3. **A looping sound effect is stopped somewhere** (`se_low_health`, `se_exp`),
   as the game stops it.
4. **Never edit the bank by hand**: re-extract. Never "improve" a song.
5. **The engine stays self-contained**: no imports, no module-level helpers, no
   class fields (use `declare`), no browser globals (no `atob`). The worklet
   runs the class from its source text; the check runs it in an empty scope.
6. **Sound is off unless a page enables it** (`sound.enable()`: the playtest;
   the battle page with `sound=1`), so tools, gates and review pages stay
   silent and deterministic. Calls before that are no-ops.
7. **Audio starts with a user gesture.** A BGM asked for earlier starts from its
   beginning then; sound effects asked for earlier are dropped. The title
   screen swallows the press that unlocked audio (`takeUnlockPress()`) so the
   player hears its music.

## Workflow

1. Find the sound and its moment in the decomp (rule 1).
2. If the song is new: add it to `SONGS`, `python3 tools/extract/extract_sound.py`.
3. Add the cue.
4. `node tools/sound/check.mjs` (the bank, the names in code, every song
   renders, loops are stopped, the worklet's engine, speed).
   `--wav <song>` writes `build/sound/<song>.wav` to listen to.
5. In the browser: the playtest, or `/?sound=1&autoplay=1` for a battle; after
   a key press, `window.__sound.history` lists the calls in order and
   `window.__sound.level()` shows the output is live.
6. When `m4a.ts` changes: `tools/reference/build_rom.sh`,
   `tools/reference/build_capture.sh <mgba_src>`, then
   `python3 tools/sound/reference/run.py` (every song against the game in
   mGBA: DirectSound samples equal, band energies, level).

## Failure modes and fixes

| sounds like | fix |
|---|---|
| silence in the browser | not enabled on that page, not unlocked yet (press a key), or the load failed (`window.__sound.error`) |
| a sound effect that never ends | it loops in the game too: add the `stopSE` the decomp has |
| an effect cut short, or not playing over another | two effects on one music player (the song table's player): a new song replaces the old only if its priority allows (MPlayStart's rule), as in the game |
| the next song cuts the last one off | fade the old one first (`fadeOutBGM`); `playBGM` then waits for the fade to end |
| music out of tune or timing | the sequencer or MidiKeyToFreq: compare note-ons with the MIDI and run the reference |
| `run.py`: DirectSound under 99% equal | the mixer (SoundMainRAM: envelope, interpolation, 8-bit wrap, reverb, the DMA's one-frame delay) or the sequencer |
| `run.py`: bands or level off | the GB channels (CgbSound's envelope steps, NRx2/NRx4 writes, the PSG model) or the output stage |
| `run.py`: se_faint shows DC in the reference | mGBA holds a square channel's last level after its sweep overflows; the hardware outputs 0. Not a bug |
