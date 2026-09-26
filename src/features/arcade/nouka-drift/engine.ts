/**
 * Nouka Drift simulation, kept free of canvas and React so it can be unit-tested.
 * Logical scene: 800 × 450; the river runs from WATER_TOP to WATER_BOTTOM.
 */
export const WIDTH = 800;
export const HEIGHT = 450;
export const WATER_TOP = 270;
export const WATER_BOTTOM = 440;
export const BOAT_X = 170;
export const DURATION = 90;

const BOAT_MIN = WATER_TOP + 22;
const BOAT_MAX = WATER_BOTTOM - 22;
const STEER_SPEED = 240; // px/s when steering with keys
const BUMP_SLOWDOWN = 0.45;
const BUMP_SECONDS = 1.2;

export type ItemKind = 'lantern' | 'log';

export interface Item {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  done: boolean;
}

export interface World {
  time: number;
  /** Distance travelled; drives spawning and parallax. */
  distance: number;
  boatY: number;
  targetY: number;
  slowUntil: number;
  lanterns: number;
  items: Item[];
  nextSpawn: number;
  nextId: number;
  seed: number;
  /** River speed in px/s (lower for reduced motion). */
  speed: number;
}

export interface Input {
  /** -1 up, 1 down, 0 none (keyboard steering). */
  steer: number;
  /** Absolute target from a pointer, in scene coordinates. */
  pointerY: number | null;
}

export interface StepEvents {
  collected: number;
  bumped: boolean;
}

/** Small deterministic PRNG (mulberry32) so runs are reproducible in tests. */
function random(world: World) {
  world.seed = (world.seed + 0x6d2b79f5) | 0;
  let t = world.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function createWorld(seed: number, speed = 170): World {
  const mid = (BOAT_MIN + BOAT_MAX) / 2;
  return {
    time: 0,
    distance: 0,
    boatY: mid,
    targetY: mid,
    slowUntil: 0,
    lanterns: 0,
    items: [],
    nextSpawn: 0.6,
    nextId: 1,
    seed,
    speed,
  };
}

export function clampBoat(y: number) {
  return Math.min(BOAT_MAX, Math.max(BOAT_MIN, y));
}

/** Advance the world by `dt` seconds. */
export function step(world: World, dt: number, input: Input): StepEvents {
  const events: StepEvents = { collected: 0, bumped: false };
  world.time = Math.min(DURATION, world.time + dt);

  // Steering: pointer sets an absolute target; keys nudge it.
  if (input.pointerY !== null) world.targetY = clampBoat(input.pointerY);
  else if (input.steer !== 0)
    world.targetY = clampBoat(world.targetY + input.steer * STEER_SPEED * dt);
  world.boatY += (world.targetY - world.boatY) * Math.min(1, dt * 6);

  const slow = world.time < world.slowUntil ? BUMP_SLOWDOWN : 1;
  const moved = world.speed * slow * dt;
  world.distance += moved;

  // Spawn: mostly lanterns, some logs, spread across the river.
  world.nextSpawn -= dt;
  if (world.nextSpawn <= 0) {
    world.items.push({
      id: world.nextId++,
      kind: random(world) < 0.72 ? 'lantern' : 'log',
      x: WIDTH + 40,
      y: BOAT_MIN + random(world) * (BOAT_MAX - BOAT_MIN),
      done: false,
    });
    world.nextSpawn = 0.6 + random(world) * 0.7;
  }

  for (const item of world.items) {
    item.x -= moved;
    if (item.done) continue;
    const dx = Math.abs(item.x - BOAT_X);
    const dy = Math.abs(item.y - world.boatY);
    if (item.kind === 'lantern' && dx < 38 && dy < 30) {
      item.done = true;
      world.lanterns += 1;
      events.collected += 1;
    } else if (item.kind === 'log' && dx < 52 && dy < 20) {
      item.done = true;
      world.slowUntil = world.time + BUMP_SECONDS;
      events.bumped = true;
    }
  }
  world.items = world.items.filter((i) => i.x > -80 && !(i.done && i.kind === 'lantern'));
  return events;
}

export function isOver(world: World) {
  return world.time >= DURATION;
}

/** 0 = day, 1 = sunset, 2 = night, with fractional blending in between. */
export function skyPhase(time: number) {
  return Math.min(2, (time / DURATION) * 2.4);
}
