import { useEffect, useRef, useState } from 'react';
import { Download, Eraser, Sparkles, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRecordGame } from '../shared/api';
import { GameShell } from '../shared/GameShell';
import { getGame } from '../shared/games';
import { usePersonalBest } from '../shared/personalBest';
import { useSound } from '../shared/sound';
import { useKeydown } from '../shared/useKeydown';
import {
  generateMotif,
  PALETTES,
  SEGMENTS,
  SIZE,
  symmetricPoints,
  type PaletteId,
  type Point,
  type Stroke,
} from './symmetry';

const GAME = getGame('kantha-canvas');
const CLOTH = '#f6eddc';

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return;
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Running stitch: short dashes like kantha's hand stitching.
  ctx.setLineDash(stroke.stitch ? [stroke.size * 2.4, stroke.size * 1.8] : []);
  const copies = stroke.points.map((p) => symmetricPoints(p, stroke.segments, stroke.mirror));
  const count = copies[0]?.length ?? 0;
  for (let c = 0; c < count; c++) {
    ctx.beginPath();
    copies.forEach((pts, i) => {
      const p = pts[c];
      if (!p) return;
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    if (stroke.points.length === 1) {
      const p = copies[0]?.[c];
      if (p) ctx.arc(p.x, p.y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else ctx.stroke();
  }
  ctx.setLineDash([]);
}

function paintCloth(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = CLOTH;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Border of running stitches, as on a finished kantha.
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.strokeRect(14, 14, SIZE - 28, SIZE - 28);
  ctx.strokeStyle = '#1f3a93';
  ctx.strokeRect(22, 22, SIZE - 44, SIZE - 44);
  ctx.setLineDash([]);
}

export function KanthaCanvas() {
  const { t } = useTranslation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const startedAt = useRef<number | null>(null);
  const [count, setCount] = useState(0);
  const [segments, setSegments] = useState<number>(8);
  const [mirror, setMirror] = useState(true);
  const [stitch, setStitch] = useState(true);
  const [palette, setPalette] = useState<PaletteId>('classic');
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState(3);
  const { best, increment } = usePersonalBest(GAME.code);
  const record = useRecordGame();
  const play = useSound();
  const color = PALETTES[palette][colorIndex] ?? PALETTES[palette][0];

  const redraw = () => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    paintCloth(ctx);
    for (const s of strokes.current) paintStroke(ctx, s);
    if (current.current) paintStroke(ctx, current.current);
  };

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    el.width = SIZE * ratio;
    el.height = SIZE * ratio;
    el.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
    redraw();
  }, []);

  const style = { color, size, stitch, segments, mirror };

  const toCloth = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  };

  const commit = (stroke: Stroke, timeStamp: number) => {
    startedAt.current ??= timeStamp;
    strokes.current = [...strokes.current, stroke];
    setCount(strokes.current.length);
  };

  const addMotif = (timeStamp: number) => {
    commit(generateMotif(Math.random, style), timeStamp);
    play('pop');
    redraw();
  };

  const undo = () => {
    strokes.current = strokes.current.slice(0, -1);
    setCount(strokes.current.length);
    redraw();
  };

  const clear = () => {
    strokes.current = [];
    startedAt.current = null;
    setCount(0);
    redraw();
  };

  const save = (timeStamp: number) => {
    const el = canvas.current;
    if (!el || strokes.current.length === 0) {
      toast.error(t('games.kanthaCanvas.empty'));
      return;
    }
    el.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bondhu-kantha-${String(Date.now())}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
    play('win');
    increment();
    toast.success(t('games.kanthaCanvas.saved'));
    record.mutate({
      game_code: GAME.code,
      score: strokes.current.length,
      duration_seconds: startedAt.current === null ? 0 : (timeStamp - startedAt.current) / 1000,
    });
  };

  useKeydown((e) => {
    if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      addMotif(e.timeStamp);
    }
  });

  const toggle = (active: boolean) =>
    cn(
      'rounded-md px-3 py-1 text-sm font-medium transition-colors',
      active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
    );

  return (
    <GameShell
      game={GAME}
      personalBest={best}
      toolbar={
        <>
          <Button variant="outline" size="sm" onClick={undo} disabled={count === 0}>
            <Undo2 aria-hidden />
            {t('games.kanthaCanvas.undo')}
          </Button>
          <Button variant="outline" size="sm" onClick={clear} disabled={count === 0}>
            <Eraser aria-hidden />
            {t('games.kanthaCanvas.clear')}
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => addMotif(e.timeStamp)}>
            <Sparkles aria-hidden />
            {t('games.kanthaCanvas.generate')}
          </Button>
          <Button size="sm" onClick={(e) => save(e.timeStamp)}>
            <Download aria-hidden />
            {t('games.kanthaCanvas.save')}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
        <canvas
          ref={canvas}
          role="img"
          aria-label={t('games.kanthaCanvas.canvas')}
          className="aspect-square w-full touch-none rounded-3xl border shadow-soft select-none"
          style={{ backgroundColor: CLOTH }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            current.current = { ...style, points: [toCloth(e)] };
            redraw();
          }}
          onPointerMove={(e) => {
            if (!current.current) return;
            const p = toCloth(e);
            const last = current.current.points.at(-1);
            if (last && Math.hypot(p.x - last.x, p.y - last.y) < 2) return;
            current.current.points.push(p);
            redraw();
          }}
          onPointerUp={(e) => {
            if (!current.current) return;
            commit(current.current, e.timeStamp);
            current.current = null;
            play('key');
            redraw();
          }}
          onPointerCancel={() => {
            current.current = null;
            redraw();
          }}
        />

        <div className="space-y-5 rounded-3xl border bg-card p-4 shadow-soft">
          <fieldset>
            <legend className="text-sm font-semibold">{t('games.kanthaCanvas.symmetry')}</legend>
            <div className="mt-2 flex flex-wrap gap-1">
              {SEGMENTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={segments === n}
                  onClick={() => setSegments(n)}
                  className={cn(toggle(segments === n), 'border')}
                >
                  {t('games.kanthaCanvas.segments', { count: n, formatted: formatNumber(n) })}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                aria-pressed={mirror}
                onClick={() => setMirror((m) => !m)}
                className={cn(toggle(mirror), 'border')}
              >
                {t('games.kanthaCanvas.mirror')}
              </button>
              <button
                type="button"
                aria-pressed={stitch}
                onClick={() => setStitch((s) => !s)}
                className={cn(toggle(stitch), 'border')}
              >
                {t('games.kanthaCanvas.stitch')}
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">{t('games.kanthaCanvas.palette')}</legend>
            <div className="mt-2 flex flex-wrap gap-1">
              {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={palette === id}
                  onClick={() => setPalette(id)}
                  className={cn(toggle(palette === id), 'border')}
                >
                  {t(`games.kanthaCanvas.palettes.${id}`)}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {PALETTES[palette].map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={colorIndex === i}
                  aria-label={t('games.kanthaCanvas.colour', { n: formatNumber(i + 1) })}
                  onClick={() => setColorIndex(i)}
                  className={cn(
                    'size-8 rounded-full border-2 transition-transform motion-safe:hover:scale-110',
                    colorIndex === i
                      ? 'border-foreground ring-2 ring-ring/50'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="kantha-size" className="text-sm font-semibold">
              {t('games.kanthaCanvas.size')}
            </label>
            <input
              id="kantha-size"
              type="range"
              min={1}
              max={10}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}

export default KanthaCanvas;
