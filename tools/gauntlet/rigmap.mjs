// Shared helpers for the gauntlet tools: reading .glb JSON and guessing the
// semantic rig map from Game Freak's joint names.

/** Read the JSON chunk of a binary glTF. */
export function readGlbJson(buf) {
  if (buf.toString('ascii', 0, 4) !== 'glTF') throw new Error('not a .glb file');
  const len = buf.readUInt32LE(12);
  if (buf.toString('ascii', 16, 20) !== 'JSON') throw new Error('first .glb chunk is not JSON');
  return JSON.parse(buf.toString('utf8', 20, 20 + len));
}

/** "050 Head" -> "Head", "Waist_63" -> "Waist". */
export const normalize = (name) => name.replace(/^\d+\s+/, '').replace(/_\d+$/, '');

// Semantic name -> candidate joint names (first match wins). Game Freak's
// 3DS-era skeletons share CamelCase names (LArm, Spine1); newer exports use
// snake_case (left_arm_01, spine_01). Both are listed.
const CENTER = {
  hips: ['Hips', 'Waist', 'Pelvis', 'hips', 'pelvis', 'waist'],
  spine: ['Spine1', 'Spine', 'spine_01', 'spine'],
  chest: ['Spine2', 'Chest', 'spine_02', 'chest'],
  neck: ['Neck', 'Neck1', 'neck', 'neck_01'],
  head: ['Head', 'head'],
  jaw: ['Jaw', 'LowerBeak', 'LowerJaw', 'jaw', 'lower_jaw'],
  tail: ['Tail', 'Tail1', 'TailA', 'TailA1', 'TailA01', 'tail_01', 'tail'],
};
const SIDED = {
  shoulder: ['Shoulder', 'shoulder'],
  arm: ['Arm', 'UpperArm', 'arm_01', 'upper_arm'],
  forearm: ['ForeArm', 'arm_02', 'forearm'],
  hand: ['Hand', 'hand'],
  thigh: ['Thigh', 'leg_01', 'thigh'],
  shin: ['Leg', 'leg_02', 'shin'],
  foot: ['Foot', 'foot'],
  toe: ['Toe', 'Toe1', 'ToeA', 'ToeA1', 'foot_index', 'toe'],
  ear: ['Ear', 'Ear1', 'ear', 'ear_01'],
  hair: ['Hair1', 'HairA1'],
  hairTip: ['Hair2', 'HairA2'],
};
const SIDE_FORMS = {
  L: [(c) => `L${c}`, (c) => `left_${c}`, (c) => `${c}_L`, (c) => `${c}L`, (c) => `${c}_l`],
  R: [(c) => `R${c}`, (c) => `right_${c}`, (c) => `${c}_R`, (c) => `${c}R`, (c) => `${c}_r`],
};

export function guessRig(jointNames) {
  const byNorm = new Map();
  for (const n of jointNames) if (!byNorm.has(normalize(n))) byNorm.set(normalize(n), n);
  const bones = {};
  for (const [semantic, cands] of Object.entries(CENTER)) {
    const hit = cands.find((c) => byNorm.has(c));
    if (hit) bones[semantic] = byNorm.get(hit);
  }
  for (const [semantic, cands] of Object.entries(SIDED)) {
    for (const side of ['L', 'R']) {
      let found;
      for (const c of cands) {
        found = SIDE_FORMS[side].map((form) => form(c)).find((name) => byNorm.has(name));
        if (found) break;
      }
      if (found) bones[semantic + side] = byNorm.get(found);
    }
  }
  const pelvisNodes = [bones.hips, bones.spine].filter(Boolean);
  const hasLegs = ['thigh', 'shin', 'foot'].every((k) => bones[`${k}L`] && bones[`${k}R`]);
  const legs = hasLegs
    ? { left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' }, right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' } }
    : undefined;
  const used = new Set(Object.values(bones));
  const unmapped = jointNames.filter((n) => !used.has(n));
  return { bones, pelvisNodes, legs, unmapped };
}

/**
 * Bind-pose world positions of every node, from the glTF JSON (no geometry
 * needed): name -> [x, y, z] in the file's units.
 */
export function nodePositions(gltf) {
  const out = new Map();
  const nodes = gltf.nodes ?? [];
  const parents = new Map();
  nodes.forEach((n, i) => (n.children ?? []).forEach((c) => parents.set(c, i)));
  const mul = (a, b) => {
    const o = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return o;
  };
  const local = (n) => {
    if (n.matrix) return n.matrix;
    const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1];
    const [sx, sy, sz] = n.scale ?? [1, 1, 1];
    const [tx, ty, tz] = n.translation ?? [0, 0, 0];
    return [
      (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
      tx, ty, tz, 1,
    ];
  };
  const world = (i) => {
    const p = parents.get(i);
    return p === undefined ? local(nodes[i]) : mul(world(p), local(nodes[i]));
  };
  nodes.forEach((n, i) => {
    const m = world(i);
    if (n.name) out.set(n.name, [m[12], m[13], m[14]]);
  });
  return out;
}

/**
 * Walks on all fours? True when both front feet (hand joints) sit near the
 * ground at bind pose, like the hind feet.
 */
export function looksQuadruped(gltf, bones) {
  const pos = nodePositions(gltf);
  const y = (b) => pos.get(bones[b])?.[1];
  const feet = ['footL', 'footR', 'toeL', 'toeR'].map(y).filter((v) => v !== undefined);
  const heads = ['head'].map(y).filter((v) => v !== undefined);
  const hands = ['handL', 'handR'].map(y);
  if (!feet.length || !heads.length || hands.some((v) => v === undefined)) return false;
  const ground = Math.min(...feet);
  const top = Math.max(...heads);
  return hands.every((v) => (v - ground) / Math.max(1e-6, top - ground) < 0.2);
}
