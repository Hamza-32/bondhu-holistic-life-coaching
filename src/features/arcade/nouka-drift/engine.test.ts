import { describe, expect, it } from 'vitest';
import {
  BOAT_X,
  createWorld,
  DURATION,
  isOver,
  skyPhase,
  step,
  WATER_BOTTOM,
  WATER_TOP,
  type Item,
} from './engine';

const idle = { steer: 0, pointerY: null };

function place(kind: Item['kind'], x: number, y: number): Item {
  return { id: 999, kind, x, y, done: false };
}

describe('Nouka Drift engine', () => {
  it('collects a lantern the boat touches', () => {
    const world = createWorld(1);
    world.nextSpawn = 99;
    world.items.push(place('lantern', BOAT_X + 5, world.boatY));
    const events = step(world, 0.016, idle);
    expect(events.collected).toBe(1);
    expect(world.lanterns).toBe(1);
    expect(world.items).toHaveLength(0);
  });

  it('slows the boat after bumping a log but never ends the run', () => {
    const world = createWorld(1);
    world.nextSpawn = 99;
    world.items.push(place('log', BOAT_X, world.boatY));
    expect(step(world, 0.016, idle).bumped).toBe(true);
    const before = world.distance;
    step(world, 0.1, idle);
    const slowed = world.distance - before;
    world.time = world.slowUntil + 1;
    const after = world.distance;
    step(world, 0.1, idle);
    expect(world.distance - after).toBeGreaterThan(slowed);
    expect(isOver(world)).toBe(false);
  });

  it('keeps the boat on the river when steering', () => {
    const world = createWorld(1);
    for (let i = 0; i < 200; i++) step(world, 0.05, { steer: -1, pointerY: null });
    expect(world.boatY).toBeGreaterThan(WATER_TOP);
    step(world, 0.05, { steer: 0, pointerY: 10_000 });
    for (let i = 0; i < 100; i++) step(world, 0.05, idle);
    expect(world.boatY).toBeLessThan(WATER_BOTTOM);
  });

  it('is deterministic for a seed and ends after the run length', () => {
    const run = () => {
      const world = createWorld(42);
      while (!isOver(world)) step(world, 1 / 30, { steer: Math.sin(world.time), pointerY: null });
      return world.lanterns;
    };
    expect(run()).toBe(run());
    expect(run()).toBeGreaterThan(0);
  });

  it('moves from day through sunset into night', () => {
    expect(skyPhase(0)).toBe(0);
    expect(skyPhase(DURATION / 2)).toBeGreaterThan(1);
    expect(skyPhase(DURATION)).toBe(2);
  });
});
