import { describe, expect, it } from 'vitest';
import {
  answerFor,
  evaluate,
  graphemes,
  isValidGuess,
  keyStates,
  puzzleNumber,
  shareText,
} from './logic';
import { WORDS } from './words';

describe('word lists', () => {
  it('uses 5-letter English words and 3-cluster Bangla words, without duplicates', () => {
    for (const w of WORDS.en) expect(w).toMatch(/^[A-Z]{5}$/);
    for (const w of WORDS.bn) expect(graphemes(w)).toHaveLength(3);
    expect(new Set(WORDS.en).size).toBe(WORDS.en.length);
    expect(new Set(WORDS.bn).size).toBe(WORDS.bn.length);
  });

  it('cycles through every word before repeating', () => {
    for (const lang of ['en', 'bn'] as const) {
      const n = WORDS[lang].length;
      const seen = new Set(Array.from({ length: n }, (_, i) => answerFor(lang, i + 1).join('')));
      expect(seen.size).toBe(n);
    }
  });
});

describe('puzzleNumber', () => {
  it('counts Dhaka days from 1 January 2026', () => {
    expect(puzzleNumber('2026-01-01')).toBe(1);
    expect(puzzleNumber('2026-01-02')).toBe(2);
    expect(puzzleNumber('2027-01-01')).toBe(366);
  });
});

describe('graphemes', () => {
  it('keeps a Bangla consonant and its vowel sign together', () => {
    expect(graphemes('শাপলা')).toEqual(['শা', 'প', 'লা']);
    // য় typed as a single key normalises to the same cluster as in the word list.
    expect(graphemes('সময়')).toEqual(graphemes('সময়'));
  });
});

describe('evaluate', () => {
  const split = (s: string) => Array.from(s);

  it('marks exact, misplaced and missing letters', () => {
    expect(evaluate(split('HEART'), split('EARTH'))).toEqual([
      'present',
      'present',
      'present',
      'present',
      'present',
    ]);
    expect(evaluate(split('PEACE'), split('PEACE'))).toEqual(Array(5).fill('correct'));
  });

  it('does not over-count repeated letters', () => {
    // Answer has one E; the exact match takes it, so the other E is absent.
    expect(evaluate(split('GREEN'), split('OCEAN'))).toEqual([
      'absent',
      'absent',
      'correct',
      'absent',
      'correct',
    ]);
    // The second E matches exactly, so the first E has nothing left to claim.
    expect(evaluate(split('EERIE'), split('RELAX'))).toEqual([
      'absent',
      'correct',
      'present',
      'absent',
      'absent',
    ]);
  });

  it('works on Bangla clusters', () => {
    expect(evaluate(graphemes('সাহস'), graphemes('সাগর'))).toEqual(['correct', 'absent', 'absent']);
  });
});

describe('isValidGuess', () => {
  it('accepts letters of the chosen script only', () => {
    expect(isValidGuess('en', Array.from('HELLO'))).toBe(true);
    expect(isValidGuess('en', Array.from('HELL1'))).toBe(false);
    expect(isValidGuess('bn', graphemes('কমল'))).toBe(true);
    // A cluster may not start with a vowel sign.
    expect(isValidGuess('bn', ['া', 'ক', 'ল'])).toBe(false);
  });
});

describe('keyStates', () => {
  it('keeps the best state and only greys keys absent from the answer', () => {
    const answer = graphemes('কমল');
    const guess = graphemes('কাজল');
    const states = keyStates([{ units: guess, states: evaluate(guess, answer) }], answer);
    // কা is wrong as a cluster, but ক is in the answer, so it is not greyed.
    expect(states.has('ক')).toBe(false);
    expect(states.get('া')).toBe('absent');
    expect(states.get('জ')).toBe('absent');
    expect(states.get('ল')).toBe('correct');
  });
});

describe('shareText', () => {
  it('renders an emoji grid without revealing letters', () => {
    const text = shareText(
      'en',
      12,
      [['absent', 'present', 'correct', 'absent', 'absent'], Array(5).fill('correct')],
      true,
    );
    expect(text).toBe('Bondhu Shobdo EN #12 2/6\n⬜🟨🟩⬜⬜\n🟩🟩🟩🟩🟩');
  });
});
