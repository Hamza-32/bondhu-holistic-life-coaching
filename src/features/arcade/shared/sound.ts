/**
 * Tiny synthesised sounds (Web Audio), so the arcade ships no audio files and needs no licences.
 * Every call is a no-op unless the player has turned sound on.
 */
import { useCallback } from 'react';
import { useUiStore } from '@/stores/useUiStore';

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

interface Tone {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  /** Frequency to glide to (for pops and swooshes). */
  to?: number;
}

function play({ frequency, duration, type = 'sine', volume = 0.15, to }: Tone) {
  const ctx = audio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const SOUNDS = {
  pop: () =>
    play({
      frequency: 520 + Math.random() * 180,
      to: 140,
      duration: 0.09,
      type: 'triangle',
      volume: 0.2,
    }),
  flip: () => play({ frequency: 660, duration: 0.06, type: 'sine', volume: 0.08 }),
  match: () => {
    play({ frequency: 523, duration: 0.18 });
    setTimeout(() => play({ frequency: 784, duration: 0.25 }), 110);
  },
  collect: () => play({ frequency: 880, to: 1320, duration: 0.15, volume: 0.1 }),
  bump: () => play({ frequency: 180, to: 90, duration: 0.18, type: 'sine', volume: 0.12 }),
  inhale: () => play({ frequency: 392, duration: 0.6, volume: 0.06 }),
  exhale: () => play({ frequency: 294, duration: 0.6, volume: 0.06 }),
  hold: () => play({ frequency: 330, duration: 0.3, volume: 0.04 }),
  win: () =>
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => play({ frequency: f, duration: 0.22 }), i * 120),
    ),
  key: () => play({ frequency: 440, duration: 0.03, type: 'square', volume: 0.03 }),
} as const;

export type SoundName = keyof typeof SOUNDS;

/** Returns a `play(name)` function that respects the sound setting. */
export function useSound() {
  const enabled = useUiStore((s) => s.soundEnabled);
  return useCallback(
    (name: SoundName) => {
      if (enabled) SOUNDS[name]();
    },
    [enabled],
  );
}
