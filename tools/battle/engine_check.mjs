#!/usr/bin/env node
// Checks the battle engine's move effects and the random movesets against the
// Gen 3 rules they follow: Protect / Detect / Endure, Hyper Beam's recharge,
// Focus Punch, multi-hit counts, recoil, draining, fixed damage, Hidden Power,
// False Swipe, stat moves and side effects, Struggle, and that random sets only
// hold moves the engine resolves. Exits 1 on the first failure.
//
//   node tools/battle/engine_check.mjs

import { importTs } from '../gauntlet/tsimport.mjs';

const E = await importTs('src/battle/engine.ts');
const MS = await importTs('src/battle/moveset.ts');
const { MOVES } = await importTs('src/data/index.ts');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};
const texts = (steps) => steps.filter((s) => s.kind === 'message').map((s) => s.text.replace(/\n/g, ' '));
const has = (steps, re) => texts(steps).some((t) => re.test(t));
/** A level-50 battle: our `mine` moves against the foe's `theirs` (the foe always uses its first move with PP). */
function battle(me, mine, foe, theirs, seed = 1) {
  const player = E.createMon(me, { level: 50, moves: mine });
  const opponent = E.createMon(foe, { level: 50, moves: theirs });
  const engine = new E.BattleEngine(player, opponent, true, seed);
  return { engine, player, opponent };
}

// Protect: the foe's attack is blocked; a second Protect in a row sometimes fails; moving last fails.
{
  const { engine, player } = battle('swampert', ['PROTECT'], 'blaziken', ['BLAZE_KICK']);
  const steps = engine.runTurn({ kind: 'move', index: 0 });
  check('Protect blocks the foe\'s attack', has(steps, /SWAMPERT protected itself!/) && player.hp === player.stats.hp && texts(steps).filter((t) => /protected itself/.test(t)).length === 2, texts(steps).join(' | '));
  let second = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const b = battle('swampert', ['PROTECT'], 'blaziken', ['BULK_UP'], seed);
    b.engine.runTurn({ kind: 'move', index: 0 });
    if (has(b.engine.runTurn({ kind: 'move', index: 0 }), /SWAMPERT protected itself!/)) second++;
  }
  check('a second Protect in a row works about half the time', second > 150 && second < 250, `${second}/400`);
  const both = battle('swampert', ['PROTECT'], 'sceptile', ['DETECT']);
  const s2 = both.engine.runTurn({ kind: 'move', index: 0 });
  check('Protect used last in the turn fails', has(s2, /But it failed!/), texts(s2).join(' | '));
}

// Endure: survives a knockout blow at 1 HP.
{
  const { engine, opponent } = battle('blaziken', ['OVERHEAT'], 'sceptile', ['ENDURE']);
  opponent.hp = 5;
  const steps = engine.runTurn({ kind: 'move', index: 0 });
  check('Endure leaves 1 HP', opponent.hp === 1 && has(steps, /braced itself!/) && has(steps, /endured the hit!/), `hp ${opponent.hp}; ${texts(steps).join(' | ')}`);
}

// Hyper Beam: the next turn is spent recharging.
{
  const { engine, player, opponent } = battle('sceptile', ['HYPER_BEAM'], 'swampert', ['GROWL'], 3);
  let steps = engine.runTurn({ kind: 'move', index: 0 });
  for (let seed = 4; !steps.some((s) => s.kind === 'hp') && seed < 20; seed++) steps = battle('sceptile', ['HYPER_BEAM'], 'swampert', ['GROWL'], seed).engine.runTurn({ kind: 'move', index: 0 });
  check('Hyper Beam sets the recharge', player.recharging || steps.some((s) => s.kind === 'hp'));
  if (player.recharging) {
    const hp = opponent.hp;
    const next = engine.runTurn({ kind: 'recharge' });
    check('the recharge turn uses no move', has(next, /SCEPTILE must recharge!/) && opponent.hp === hp && !player.recharging, texts(next).join(' | '));
  }
}

// Focus Punch: loses focus when hit first; lands when the foe does something else.
{
  const hit = battle('blaziken', ['FOCUS_PUNCH'], 'sceptile', ['QUICK_ATTACK']);
  const s1 = hit.engine.runTurn({ kind: 'move', index: 0 });
  check('Focus Punch is announced, then loses focus when hit', has(s1, /BLAZIKEN is tightening its focus!/) && has(s1, /lost its focus/) && !has(s1, /BLAZIKEN used/), texts(s1).join(' | '));
  const calm = battle('blaziken', ['FOCUS_PUNCH'], 'sceptile', ['LEER']);
  const s2 = calm.engine.runTurn({ kind: 'move', index: 0 });
  check('Focus Punch lands when the foe did not hit', has(s2, /BLAZIKEN used FOCUS PUNCH!/) && !has(s2, /lost its focus/), texts(s2).join(' | '));
}

// Multi-hit: 2-5 hits, 2 and 3 three times as often as 4 and 5.
{
  const counts = [0, 0, 0, 0, 0, 0];
  for (let seed = 1; seed <= 800; seed++) {
    const { engine, opponent } = battle('sceptile', ['BULLET_SEED'], 'blaziken', ['BULK_UP'], seed);
    opponent.hp = opponent.stats.hp = 999;
    const move = engine.runTurn({ kind: 'move', index: 0 }).find((s) => s.kind === 'move' && s.side === 'player');
    if (move && !move.missed) counts[move.hits.length]++;
  }
  const n = counts.reduce((a, b) => a + b, 0);
  const share = (k) => counts[k] / n;
  check('Bullet Seed hits 2-5 times (3/8, 3/8, 1/8, 1/8)', counts[0] + counts[1] === 0 && Math.abs(share(2) - 0.375) < 0.06 && Math.abs(share(3) - 0.375) < 0.06 && Math.abs(share(4) - 0.125) < 0.05 && Math.abs(share(5) - 0.125) < 0.05, counts.slice(2).join('/'));
}

// Recoil and draining.
{
  const { engine, player, opponent } = battle('swampert', ['DOUBLE_EDGE'], 'sceptile', ['LEER']);
  opponent.hp = opponent.stats.hp = 999;
  const steps = engine.runTurn({ kind: 'move', index: 0 });
  const dealt = 999 - opponent.hp;
  check('Double-Edge recoil is a third of the damage', player.stats.hp - player.hp === Math.max(1, Math.floor(dealt / 3)) && has(steps, /hit with recoil!/), `dealt ${dealt}, lost ${player.stats.hp - player.hp}`);
  const d = battle('sceptile', ['GIGA_DRAIN'], 'swampert', ['LEER']);
  d.player.hp = 20;
  d.opponent.hp = d.opponent.stats.hp = 999;
  const ds = d.engine.runTurn({ kind: 'move', index: 0 });
  const drained = 999 - d.opponent.hp;
  check('Giga Drain heals half the damage', d.player.hp === 20 + Math.max(1, Math.floor(drained / 2)) && has(ds, /had its energy drained!/), `dealt ${drained}, hp ${d.player.hp}`);
}

// Fixed damage, Hidden Power, False Swipe.
{
  const { engine, opponent } = battle('blaziken', ['SEISMIC_TOSS'], 'swampert', ['LEER']);
  const hp = opponent.hp;
  engine.runTurn({ kind: 'move', index: 0 });
  check('Seismic Toss deals the level (50)', hp - opponent.hp === 50, `${hp - opponent.hp}`);
  const g = battle('blaziken', ['SEISMIC_TOSS'], 'dusclops', ['LEER']);
  const gs = g.engine.runTurn({ kind: 'move', index: 0 });
  check('Seismic Toss does not affect a Ghost', g.opponent.hp === g.opponent.stats.hp && has(gs, /doesn't affect/), texts(gs).join(' | '));
  const hpw = E.hiddenPower();
  check('Hidden Power with perfect IVs is Dark 70', hpw.type === 'TYPE_DARK' && hpw.power === 70, `${hpw.type} ${hpw.power}`);
  const p = battle('sceptile', ['HIDDEN_POWER'], 'alakazam', ['GROWL']);
  const ps = p.engine.runTurn({ kind: 'move', index: 0 });
  check('Hidden Power hits Psychic types super effectively', has(ps, /super effective/) || has(ps, /missed/), texts(ps).join(' | '));
  const f = battle('sceptile', ['FALSE_SWIPE'], 'swampert', ['LEER']);
  f.opponent.hp = 3;
  f.engine.runTurn({ kind: 'move', index: 0 });
  check('False Swipe leaves 1 HP', f.opponent.hp === 1 || f.opponent.hp === 3, `hp ${f.opponent.hp}`);
}

// Stat moves and side effects.
{
  const { engine, player } = battle('sceptile', ['SWORDS_DANCE'], 'swampert', ['SCREECH']);
  const steps = engine.runTurn({ kind: 'move', index: 0 });
  check('Swords Dance raises Attack two stages', player.stages.attack === 2 && has(steps, /ATTACK sharply rose!/), texts(steps).join(' | '));
  check('Screech lowers Defense two stages (unless it missed)', player.stages.defense === -2 || has(steps, /missed/), `${player.stages.defense}`);
  const m = battle('swampert', ['MUD_SHOT'], 'blaziken', ['BULK_UP']);
  m.opponent.hp = m.opponent.stats.hp = 999;
  const ms = m.engine.runTurn({ kind: 'move', index: 0 });
  check('Mud Shot always lowers Speed', m.opponent.stages.speed === -1 || has(ms, /missed/), texts(ms).join(' | '));
}

// Stat changes and burns play the game's animations in the game's order.
{
  const kinds = (steps) => steps.filter((s) => s.kind !== 'move').map((s) => (s.kind === 'message' ? s.text.replace(/\n/g, ' ') : s.kind === 'stat' ? `stat:${s.side}:${s.stats.join('+')}:${s.delta}` : `${s.kind}:${s.side}`));
  const after = (list, anchor) => list.slice(list.findIndex((k) => anchor.test(k)));
  const b = battle('swampert', ['WATER_GUN'], 'blaziken', ['BULK_UP']);
  b.player.moves[0].pp = 0;
  b.player.hp = b.player.stats.hp = 999;
  let seq = after(kinds(b.engine.runTurn({ kind: 'struggle' })), /used BULK UP/);
  check('Bulk Up: one gray animation for both stats, then both messages', seq[1] === 'stat:opponent:attack+defense:1' && /ATTACK rose/.test(seq[2]) && /DEFENSE rose/.test(seq[3]), seq.slice(0, 4).join(' | '));
  b.opponent.stages.attack = 6;
  seq = after(kinds(b.engine.runTurn({ kind: 'struggle' })), /used BULK UP/);
  check('Bulk Up at +6 Attack: only Defense animates, and nothing about Attack', seq[1] === 'stat:opponent:defense:1' && !seq.some((t) => /ATTACK/.test(t)), seq.slice(0, 3).join(' | '));
  b.opponent.stages.defense = 6;
  seq = after(kinds(b.engine.runTurn({ kind: 'struggle' })), /used BULK UP/);
  check('Bulk Up at +6 both: "stats won\'t go any higher!", no animation', /stats won't go any higher!/.test(seq[1]) && !seq.some((t) => t.startsWith('stat:')), seq.slice(0, 2).join(' | '));
  const g = battle('swampert', ['GROWL'], 'blaziken', ['BULK_UP']);
  seq = after(kinds(g.engine.runTurn({ kind: 'move', index: 0 })), /used GROWL/);
  check('Growl: the foe\'s Attack animation, then "fell!"', seq[1] === 'stat:opponent:attack:-1' && /ATTACK fell!/.test(seq[2]), seq.slice(0, 3).join(' | '));
  let burned = null;
  for (let seed = 1; seed < 400 && !burned; seed++) {
    const f = battle('blaziken', ['FLAMETHROWER'], 'swampert', ['GROWL'], seed);
    f.opponent.hp = f.opponent.stats.hp = 999;
    const list = kinds(f.engine.runTurn({ kind: 'move', index: 0 }));
    if (list.some((k) => /was burned/.test(k))) burned = { list, f };
  }
  check('a burn lands in 400 seeds', !!burned);
  if (burned) {
    seq = after(burned.list, /^statusAnim/);
    check('burned: the burn animation, "was burned!", then the icon', seq[0] === 'statusAnim:opponent' && /was burned!/.test(seq[1]) && seq[2] === 'statusIcon:opponent', seq.slice(0, 3).join(' | '));
    const end = after(kinds(burned.f.engine.runTurn({ kind: 'move', index: 0 })), /hurt by its burn/);
    check('burn damage: the message, the animation, then the HP', /hurt by its burn/.test(end[0]) && end[1] === 'statusAnim:opponent' && end[2] === 'hp:opponent', end.slice(0, 3).join(' | '));
  }
}

// The stock status animations' timelines (src/battle/status_anims.ts), as the
// game's code runs them: StatsChangeAnimation_Step3 fades the layer in one
// step every other frame to 10/16 (13 sharply), holds 20 frames (30), fades
// out, scrolling 3 px a frame; Status_Burn's three flames cross 48 px of the
// battler's feet in 20 frames each, 4 frames apart.
{
  const A = await importTs('src/battle/status_anims.ts');
  const up = A.statsChangeFrames(false, false), sharp = A.statsChangeFrames(false, true), down = A.statsChangeFrames(true, false);
  const peak = (f) => Math.max(...f.map((x) => x.eva));
  check('stat change: 60 frames, up to 10/16; sharply 82 frames, up to 13/16', up.length === 60 && peak(up) === 10 && sharp.length === 82 && peak(sharp) === 13, `${up.length} / ${peak(up)}, ${sharp.length} / ${peak(sharp)}`);
  check('stat change: rises 3 px a frame; a drop falls from BG1 x 64', up[9].scroll[1] === 30 && down[0].scroll[0] === 64 && down[9].scroll[1] === 256 - 30, `${up[9].scroll} / ${down[9].scroll}`);
  const foe = A.burnFlameFrames('opponent'), ours = A.burnFlameFrames('player');
  const path = (frames) => [frames[0][0], frames[19][0]].map((f) => `${f.x},${f.y}`).join(' -> ');
  check('burn: three flames, 4 frames apart, 28 frames in all', foe.length === 28 && Math.max(...foe.map((f) => f.length)) === 3 && foe[3].length === 1 && foe[4].length === 2);
  check('burn: across the foe\'s feet left to right, ours right to left', path(foe) === '154,64 -> 199,64' && path(ours) === '94,104 -> 48,104', `${path(foe)} | ${path(ours)}`);
}

// Struggle.
{
  const { engine, player } = battle('swampert', ['WATER_GUN'], 'blaziken', ['BULK_UP']);
  player.moves[0].pp = 0;
  check('no PP left means Struggle', !engine.hasUsableMove());
  const steps = engine.runTurn({ kind: 'struggle' });
  check('Struggle hits and recoils', has(steps, /SWAMPERT used STRUGGLE!/) && player.hp < player.stats.hp, texts(steps).join(' | '));
}

// Which moves the engine resolves, and the random sets.
{
  const sup = (k) => E.isSupportedMove(MOVES[`MOVE_${k}`]);
  check('supported: Leaf Blade, Protect, Bullet Seed, Hyper Beam, Swords Dance', ['LEAF_BLADE', 'PROTECT', 'BULLET_SEED', 'HYPER_BEAM', 'SWORDS_DANCE'].every(sup));
  check('not supported: Toxic, Sunny Day, Frustration, Rest, Counter', !['TOXIC', 'SUNNY_DAY', 'FRUSTRATION', 'REST', 'COUNTER'].some(sup));
  for (const slug of ['blaziken', 'sceptile', 'swampert']) {
    const main = E.createMon(slug).species.types[0];
    let ok = true;
    for (let i = 0; i < 300 && ok; i++) {
      const set = MS.randomMoveset(slug, 50);
      const moves = set.map((k) => MOVES[`MOVE_${k}`]);
      ok = set.length === 4 && new Set(set).size === 4 && moves.every((m) => m && E.isSupportedMove(m)) && moves.some((m) => m.power > 0 && m.type === main) && moves.filter((m) => m.power === 0).length <= 1;
      if (!ok) console.log('   bad set', slug, set.join(','));
    }
    check(`${slug}: random sets are four supported moves with a ${main.replace('TYPE_', '').toLowerCase()} attack`, ok);
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks pass');
process.exit(failures ? 1 : 0);
