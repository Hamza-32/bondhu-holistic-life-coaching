import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { useRecordGame } from '../shared/api';
import { GameShell, Stat } from '../shared/GameShell';
import { getGame } from '../shared/games';
import { usePersonalBest } from '../shared/personalBest';
import { useSound } from '../shared/sound';
import { formatClock } from '../shared/useElapsed';
import { draw } from './draw';
import { createWorld, DURATION, HEIGHT, isOver, step, WIDTH, type World } from './engine';

const GAME = getGame('nouka-drift');
const STEER_KEYS: Record<string, number> = { ArrowUp: -1, w: -1, W: -1, ArrowDown: 1, s: 1, S: 1 };

type Status = 'ready' | 'running' | 'done';

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function NoukaDrift() {
  const { t } = useTranslation();
  const reduced = useReducedMotion() ?? false;
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<World | null>(null);
  const steer = useRef(new Set<string>());
  const pointerY = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>('ready');
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({ lanterns: 0, left: DURATION });
  const [result, setResult] = useState<{ lanterns: number; newBest: boolean } | null>(null);
  const { best, submit } = usePersonalBest(GAME.code);
  const record = useRecordGame();
  const play = useSound();

  const render = () => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx && world.current) draw(ctx, world.current, { still: reduced });
  };

  const start = (seed: number) => {
    world.current = createWorld(seed, reduced ? 120 : 170);
    steer.current.clear();
    pointerY.current = null;
    setHud({ lanterns: 0, left: DURATION });
    setResult(null);
    setPaused(false);
    setStatus('running');
  };

  const finish = (w: World) => {
    const newBest = submit(w.lanterns);
    play('win');
    setResult({ lanterns: w.lanterns, newBest });
    setStatus('done');
    record.mutate({ game_code: GAME.code, score: w.lanterns, duration_seconds: DURATION });
  };

  const tick = useEffectEvent((dt: number) => {
    const w = world.current;
    if (!w) return;
    let dir = 0;
    for (const key of steer.current) dir += STEER_KEYS[key] ?? 0;
    const events = step(w, dt, { steer: Math.sign(dir), pointerY: pointerY.current });
    if (events.collected) play('collect');
    if (events.bumped) play('bump');
    render();
    const left = Math.ceil(DURATION - w.time);
    setHud((h) =>
      h.lanterns === w.lanterns && h.left === left ? h : { lanterns: w.lanterns, left },
    );
    if (isOver(w)) finish(w);
  });

  // Scale the canvas for sharp rendering on high-DPI screens, and draw an idle scene.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    el.width = WIDTH * ratio;
    el.height = HEIGHT * ratio;
    el.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
    world.current ??= createWorld(7);
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The game loop runs only while playing and not paused.
  useEffect(() => {
    if (status !== 'running' || paused) return;
    let frame = 0;
    let last: number | null = null;
    const loop = (now: number) => {
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      tick(dt);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [status, paused]);

  // Keyboard steering (held keys) and pause; auto-pause when the tab is hidden.
  const onKey = useEffectEvent((event: KeyboardEvent, down: boolean) => {
    if (isTyping(event.target) || status !== 'running') return;
    if (event.key in STEER_KEYS) {
      event.preventDefault();
      if (down) steer.current.add(event.key);
      else steer.current.delete(event.key);
      pointerY.current = null;
    } else if (down && (event.key === 'p' || event.key === 'P' || event.key === 'Escape')) {
      event.preventDefault();
      setPaused((p) => !p);
    }
  });
  const onHidden = useEffectEvent(() => {
    if (document.hidden && status === 'running') setPaused(true);
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    const hidden = () => onHidden();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);

  const toScene = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return ((event.clientY - rect.top) / rect.height) * HEIGHT;
  };

  return (
    <GameShell
      game={GAME}
      personalBest={best}
      paused={paused}
      onTogglePause={status === 'running' ? () => setPaused((p) => !p) : undefined}
      onRestart={status === 'ready' ? undefined : () => start(Date.now())}
      stats={
        <>
          <Stat label={t('games.noukaDrift.lanterns')} value={formatNumber(hud.lanterns)} />
          <Stat label={t('games.noukaDrift.time')} value={formatClock(hud.left, formatNumber)} />
        </>
      }
    >
      <div className="overflow-hidden rounded-3xl border shadow-soft">
        <canvas
          ref={canvas}
          role="img"
          aria-label={t('games.noukaDrift.canvas')}
          className="block aspect-video w-full touch-none bg-sky-200 select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pointerY.current = toScene(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0 || e.pointerType === 'mouse') pointerY.current = toScene(e);
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t('games.noukaDrift.controls')}</p>

      {status !== 'running' && (
        <div className="absolute inset-0 bottom-6 flex items-center justify-center rounded-3xl bg-black/35 p-4">
          <div role="status" className="max-w-sm rounded-2xl bg-card p-6 text-center shadow-lifted">
            {result && (
              <>
                <p className="text-lg font-semibold">{t('games.noukaDrift.doneTitle')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('games.noukaDrift.doneBody', { count: formatNumber(result.lanterns) })}
                </p>
                {result.newBest && (
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {t('games.noukaDrift.newBest')}
                  </p>
                )}
              </>
            )}
            <Button className="mt-4" size="lg" onClick={(e) => start(Math.round(e.timeStamp))}>
              {result ? t('games.noukaDrift.again') : t('games.noukaDrift.start')}
            </Button>
          </div>
        </div>
      )}
      {status === 'running' && paused && (
        <div className="absolute inset-0 bottom-6 flex flex-col items-center justify-center gap-3 rounded-3xl bg-black/45">
          <p className="text-2xl font-bold text-white">{t('arcade.paused')}</p>
          <Button onClick={() => setPaused(false)}>{t('arcade.resume')}</Button>
        </div>
      )}
    </GameShell>
  );
}

export default NoukaDrift;
