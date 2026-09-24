// Per-type effect recipes built from the stock battle-animation sprites
// (public/assets/gba/battle_anims), so every move in the game gets a fitting
// effect with any species' category clips. Only sheets laid out as vertical
// strips of square frames are used (what VfxSystem animates).

export interface TypeFx {
  /** Contact hit sprite. */
  impact: string;
  /** Layered on contact hits and strong bursts (flames, splashes, leaves...). */
  extra?: string;
  /** Weak ranged projectile. */
  projectile: string;
  /** Where a ranged move lands. */
  burst: string;
  /** Repeated along a strong ranged move's stream. */
  stream: string;
  /** Gathers at the attacker while charging. */
  charge: string;
}

const NORMAL: TypeFx = { impact: 'Impact', projectile: 'Orb', burst: 'Hit', stream: 'Orb', charge: 'Sparkle1' };

export const TYPE_FX: Record<string, TypeFx> = {
  TYPE_NORMAL: NORMAL,
  TYPE_FIGHTING: { impact: 'PunchImpact', projectile: 'Orb', burst: 'Hit', stream: 'Hit', charge: 'Sparkle1' },
  TYPE_FLYING: { impact: 'Impact', extra: 'WhiteFeather', projectile: 'Gust', burst: 'WhiteFeather', stream: 'Gust', charge: 'WhiteFeather' },
  TYPE_POISON: { impact: 'Impact', extra: 'ToxicBubble', projectile: 'PoisonBubble', burst: 'ToxicBubble', stream: 'PoisonBubble', charge: 'PoisonBubble' },
  TYPE_GROUND: { impact: 'Impact', extra: 'FlyingDirt', projectile: 'MudUnk', burst: 'FlyingDirt', stream: 'MudUnk', charge: 'MudUnk' },
  TYPE_ROCK: { impact: 'Impact', extra: 'Rocks', projectile: 'Rocks', burst: 'Rocks', stream: 'Rocks', charge: 'Rocks' },
  TYPE_BUG: { impact: 'Scratch', projectile: 'Needle', burst: 'Hit', stream: 'Needle', charge: 'GreenStar' },
  TYPE_GHOST: { impact: 'Impact', extra: 'PurpleFlame', projectile: 'ShadowBall', burst: 'PurpleFlame', stream: 'PurpleFlame', charge: 'GhostlySpirit' },
  TYPE_STEEL: { impact: 'CrossImpact', projectile: 'MetalBall', burst: 'Hit', stream: 'MetalBall', charge: 'Sparkle1' },
  TYPE_FIRE: { impact: 'Impact', extra: 'FirePlume', projectile: 'SmallEmber', burst: 'Fire', stream: 'Fire', charge: 'SmallEmber' },
  TYPE_WATER: { impact: 'WaterImpact', extra: 'Bubble', projectile: 'WaterOrb', burst: 'WaterImpact', stream: 'Bubble', charge: 'SmallBubbles' },
  TYPE_GRASS: { impact: 'Impact', extra: 'Leaf', projectile: 'Leaf', burst: 'Leaf', stream: 'Leaf', charge: 'Sprout' },
  TYPE_ELECTRIC: { impact: 'Impact', extra: 'Spark2', projectile: 'ElectricOrbs', burst: 'Shock', stream: 'Electricity', charge: 'Spark2' },
  TYPE_PSYCHIC: { impact: 'Impact', extra: 'Sparkle1', projectile: 'Orbs', burst: 'Sparkle1', stream: 'Orbs', charge: 'BlueStar' },
  TYPE_ICE: { impact: 'Impact', extra: 'IceChunk', projectile: 'IceChunk', burst: 'IceChunk', stream: 'Snowball', charge: 'IceSpikes' },
  TYPE_DRAGON: { impact: 'Impact', extra: 'BlueFlames', projectile: 'BlueFlames', burst: 'Explosion', stream: 'BlueFlames', charge: 'BlueStar' },
  TYPE_DARK: { impact: 'Impact', projectile: 'BlackBall', burst: 'Hit', stream: 'BlackBall', charge: 'GrayOrb' },
};

export function typeFx(type: string): TypeFx {
  return TYPE_FX[type] ?? NORMAL;
}

/** Status moves aimed at the foe: what travels (or appears) by move name. */
export function statusSprite(moveName: string): { sheet: string; at: 'travel' | 'eyes' } {
  if (/SAND|MUD/.test(moveName)) return { sheet: 'MudUnk', at: 'travel' };
  if (/POWDER|SPORE/.test(moveName)) return { sheet: 'PoisonPowder', at: 'travel' };
  if (/LEER|SCARY|GLARE|MEAN LOOK/.test(moveName)) return { sheet: 'Leer', at: 'eyes' };
  return { sheet: 'NoiseLine', at: 'travel' };
}

/** Every sheet the recipes can use (preloaded before battles). */
export const TYPE_SHEETS: string[] = [...new Set([
  ...Object.values(TYPE_FX).flatMap((f) => [f.impact, f.extra, f.projectile, f.burst, f.stream, f.charge]),
  'MudUnk', 'PoisonPowder', 'Leer', 'NoiseLine', 'ClawSlash', 'HumanoidFoot', 'FocusEnergy',
].filter((s): s is string => !!s))];
