import { describe, expect, it } from 'vitest';
import { scoreQuiz } from './score';

describe('scoreQuiz', () => {
  it('picks the most frequent answer', () => {
    expect(scoreQuiz(['social', 'tech', 'social'])).toBe('social');
  });

  it('breaks ties in favour of the first choice', () => {
    expect(scoreQuiz(['creative', 'business', 'tech'])).toBe('creative');
  });

  it('has a safe default for no answers', () => {
    expect(scoreQuiz([])).toBe('tech');
  });
});
