/** Canvas renderer for Nouka Drift. All artwork is drawn with paths; no image assets. */
import { BOAT_X, HEIGHT, skyPhase, WATER_BOTTOM, WATER_TOP, WIDTH, type World } from './engine';

type RGB = [number, number, number];

function hex(value: string): RGB {
  const n = parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Blend a three-stop palette (day, sunset, night) at phase 0–2. */
function blend(stops: readonly [string, string, string], phase: number) {
  const i = Math.min(1, Math.floor(phase));
  const f = phase - i;
  const a = hex(stops[i] ?? stops[0]);
  const b = hex(stops[i + 1] ?? stops[2]);
  const c = a.map((v, k) => Math.round(v + ((b[k] ?? v) - v) * f));
  return `rgb(${c.join(',')})`;
}

const SKY_TOP = ['#7cc4e8', '#f08a5d', '#0b1d3a'] as const;
const SKY_BOTTOM = ['#dff3fb', '#ffd29d', '#23406b'] as const;
const HILLS = ['#8fbf9f', '#a4705f', '#1b2d45'] as const;
const TREES = ['#3f7d58', '#5b3a3a', '#101d2e'] as const;
const WATER = ['#4aa3c7', '#d9825b', '#132a4a'] as const;
const WATER_DEEP = ['#2c7ea3', '#9c5a4a', '#0a1a33'] as const;

export interface DrawOptions {
  /** Disable bobbing and background scrolling for reduced motion. */
  still: boolean;
}

function wrap(offset: number, span: number) {
  return ((offset % span) + span) % span;
}

function palm(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.quadraticCurveTo(x + 6, base - h / 2, x + 2, base - h);
  ctx.lineWidth = 4;
  ctx.stroke();
  for (const a of [-2.6, -2, -1.2, -0.5, 0.2]) {
    ctx.beginPath();
    ctx.moveTo(x + 2, base - h);
    ctx.quadraticCurveTo(
      x + 2 + Math.cos(a) * 16,
      base - h + Math.sin(a) * 16 - 6,
      x + 2 + Math.cos(a) * 30,
      base - h + Math.sin(a) * 30 + 8,
    );
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function hut(ctx: CanvasRenderingContext2D, x: number, base: number) {
  ctx.fillRect(x, base - 18, 26, 18);
  ctx.beginPath();
  ctx.moveTo(x - 6, base - 16);
  ctx.lineTo(x + 13, base - 32);
  ctx.lineTo(x + 32, base - 16);
  ctx.closePath();
  ctx.fill();
}

function lantern(ctx: CanvasRenderingContext2D, x: number, y: number, glow: number, bob: number) {
  const yy = y + bob;
  // Glow, stronger as night falls.
  const g = ctx.createRadialGradient(x, yy - 10, 2, x, yy - 10, 34);
  g.addColorStop(0, `rgba(255,200,90,${0.35 + glow * 0.45})`);
  g.addColorStop(1, 'rgba(255,200,90,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, yy - 10, 34, 0, Math.PI * 2);
  ctx.fill();
  // Clay diya on a banana-leaf float.
  ctx.fillStyle = '#3f8f4f';
  ctx.beginPath();
  ctx.ellipse(x, yy + 4, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b5552b';
  ctx.beginPath();
  ctx.moveTo(x - 12, yy - 2);
  ctx.quadraticCurveTo(x, yy + 10, x + 12, yy - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffcf4a';
  ctx.beginPath();
  ctx.moveTo(x, yy - 18);
  ctx.quadraticCurveTo(x + 6, yy - 8, x, yy - 3);
  ctx.quadraticCurveTo(x - 6, yy - 8, x, yy - 18);
  ctx.fill();
}

function log(ctx: CanvasRenderingContext2D, x: number, y: number, hit: boolean) {
  ctx.globalAlpha = hit ? 0.5 : 1;
  ctx.fillStyle = '#7a5230';
  ctx.beginPath();
  ctx.roundRect(x - 40, y - 8, 80, 16, 8);
  ctx.fill();
  ctx.strokeStyle = '#5a3a1f';
  ctx.lineWidth = 2;
  for (const dx of [-20, 4, 22]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y - 6);
    ctx.lineTo(x + dx + 6, y + 6);
    ctx.stroke();
  }
  ctx.fillStyle = '#c49a6c';
  ctx.beginPath();
  ctx.ellipse(x + 40, y, 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function boat(ctx: CanvasRenderingContext2D, y: number, tilt: number) {
  ctx.save();
  ctx.translate(BOAT_X, y);
  ctx.rotate(tilt);
  // Hull: a slender crescent, dark wood with a painted stripe.
  ctx.fillStyle = '#4a2c1a';
  ctx.beginPath();
  ctx.moveTo(-58, -14);
  ctx.quadraticCurveTo(0, 20, 58, -14);
  ctx.quadraticCurveTo(0, 6, -58, -14);
  ctx.fill();
  ctx.strokeStyle = '#e0a526';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-50, -10);
  ctx.quadraticCurveTo(0, 12, 50, -10);
  ctx.stroke();
  // Chhoi (woven canopy).
  ctx.fillStyle = '#c99b54';
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.quadraticCurveTo(-4, -34, 18, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8d6a33';
  ctx.lineWidth = 1.5;
  for (const dx of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.moveTo(dx - 2, -1);
    ctx.lineTo(dx, -18);
    ctx.stroke();
  }
  // Boatman with a pole.
  ctx.strokeStyle = '#2b1d14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(38, -8);
  ctx.lineTo(62, 30);
  ctx.stroke();
  ctx.fillStyle = '#2b1d14';
  ctx.fillRect(33, -24, 5, 14);
  ctx.beginPath();
  ctx.arc(35.5, -28, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function draw(ctx: CanvasRenderingContext2D, world: World, { still }: DrawOptions) {
  const phase = skyPhase(world.time);
  const night = Math.max(0, phase - 1);
  const scroll = still ? 0 : world.distance;

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, WATER_TOP);
  sky.addColorStop(0, blend(SKY_TOP, phase));
  sky.addColorStop(1, blend(SKY_BOTTOM, phase));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, WATER_TOP);

  // Stars fade in at night.
  if (night > 0) {
    ctx.fillStyle = `rgba(255,255,255,${night * 0.9})`;
    for (let i = 0; i < 40; i++) {
      const x = (i * 197) % WIDTH;
      const y = (i * 71) % (WATER_TOP - 80);
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }

  // Sun sinks, moon rises.
  const sunY = 60 + Math.min(phase, 1.2) * 160;
  if (phase < 1.4) {
    ctx.fillStyle = phase < 0.6 ? '#fff4c2' : '#ffb35c';
    ctx.beginPath();
    ctx.arc(620, sunY, 28, 0, Math.PI * 2);
    ctx.fill();
  }
  if (night > 0) {
    ctx.fillStyle = `rgba(245,240,220,${night})`;
    ctx.beginPath();
    ctx.arc(160, 150 - night * 80, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = blend(SKY_TOP, phase);
    ctx.beginPath();
    ctx.arc(170, 144 - night * 80, 19, 0, Math.PI * 2);
    ctx.fill();
  }

  // Far hills (slow parallax).
  ctx.fillStyle = blend(HILLS, phase);
  const hillOffset = wrap(scroll * 0.1, 400);
  ctx.beginPath();
  ctx.moveTo(0, WATER_TOP);
  for (let x = -hillOffset; x <= WIDTH + 400; x += 400) {
    ctx.quadraticCurveTo(x + 100, WATER_TOP - 70, x + 200, WATER_TOP - 20);
    ctx.quadraticCurveTo(x + 300, WATER_TOP - 60, x + 400, WATER_TOP);
  }
  ctx.lineTo(WIDTH, WATER_TOP);
  ctx.fill();

  // Riverbank with palms and huts (mid parallax).
  const bank = blend(TREES, phase);
  ctx.fillStyle = bank;
  ctx.strokeStyle = bank;
  ctx.fillRect(0, WATER_TOP - 10, WIDTH, 12);
  const treeOffset = wrap(scroll * 0.35, 260);
  for (let x = -treeOffset; x < WIDTH + 260; x += 260) {
    palm(ctx, x + 40, WATER_TOP - 6, 70);
    palm(ctx, x + 70, WATER_TOP - 6, 52);
    hut(ctx, x + 150, WATER_TOP - 6);
    palm(ctx, x + 215, WATER_TOP - 6, 62);
  }
  // Warm windows at night.
  if (night > 0.3) {
    ctx.fillStyle = `rgba(255,190,90,${night})`;
    for (let x = -treeOffset; x < WIDTH + 260; x += 260)
      ctx.fillRect(x + 160, WATER_TOP - 18, 6, 6);
  }

  // Water.
  const water = ctx.createLinearGradient(0, WATER_TOP, 0, HEIGHT);
  water.addColorStop(0, blend(WATER, phase));
  water.addColorStop(1, blend(WATER_DEEP, phase));
  ctx.fillStyle = water;
  ctx.fillRect(0, WATER_TOP, WIDTH, HEIGHT - WATER_TOP);
  ctx.strokeStyle = `rgba(255,255,255,${0.25 - night * 0.12})`;
  ctx.lineWidth = 2;
  const waveOffset = wrap(scroll, 120);
  for (let row = 0; row < 5; row++) {
    const y = WATER_TOP + 20 + row * 34;
    for (let x = -waveOffset + (row % 2) * 60; x < WIDTH + 120; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 15, y - 5, x + 30, y);
      ctx.stroke();
    }
  }

  const bob = (seed: number) => (still ? 0 : Math.sin(world.time * 2.2 + seed) * 2.5);

  // Items behind the boat first, then the boat, then items in front (simple depth).
  const behind = world.items.filter((i) => i.y < world.boatY);
  const front = world.items.filter((i) => i.y >= world.boatY);
  const drawItem = (i: World['items'][number]) =>
    i.kind === 'lantern' ? lantern(ctx, i.x, i.y, night, bob(i.id)) : log(ctx, i.x, i.y, i.done);
  behind.forEach(drawItem);
  boat(ctx, world.boatY + bob(0), still ? 0 : (world.targetY - world.boatY) * 0.004);
  front.forEach(drawItem);

  // Keep the edge of the river tidy.
  ctx.fillStyle = blend(WATER_DEEP, phase);
  ctx.fillRect(0, WATER_BOTTOM + 8, WIDTH, HEIGHT - WATER_BOTTOM);
}
