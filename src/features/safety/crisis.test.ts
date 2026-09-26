import { describe, expect, it } from 'vitest';
import { detectCrisis, normalise } from './crisis';

describe('detectCrisis', () => {
  it.each([
    'Sometimes I want to die.',
    'I keep thinking about SUICIDE',
    "I don't want to live anymore",
    'I just cant go on like this',
    'thinking of hurting myself again',
    'ami r bachte chai na',
    'mone hoy attohotta kori',
    'আমি আর বাঁচতে চাই না',
    'মাঝে মাঝে মনে হয় আত্মহত্যা করি',
    'আমি মরে যেতে চাই।',
  ])('flags %j', (text) => {
    expect(detectCrisis(text)).toBe(true);
  });

  it.each([
    '',
    'Exams are killing me, lol',
    'I am on a diet and it is hard',
    'This song is to die for',
    'I cut my hair myself today',
    'আজকের দিনটা ভালো ছিল',
    'Studio Ghibli marathon, I could live here forever',
  ])('does not flag everyday text %j', (text) => {
    expect(detectCrisis(text)).toBe(false);
  });
});

describe('normalise', () => {
  it('lower-cases, strips apostrophes and punctuation, and keeps Bangla marks', () => {
    expect(normalise("  Don't   STOP!! ")).toBe('dont stop');
    expect(normalise('বাঁচতে, চাই না!')).toBe('বাঁচতে চাই না');
  });
});
