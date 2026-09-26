import { describe, expect, it } from 'vitest';
import { EMPTY_RESUME, parseStoredResume, resumeSchema } from './schema';

describe('resume schema', () => {
  it('accepts an empty email and trims fields', () => {
    const parsed = resumeSchema.parse({ ...EMPTY_RESUME, fullName: '  Nadia Rahman  ' });
    expect(parsed.fullName).toBe('Nadia Rahman');
    expect(parsed.email).toBe('');
  });

  it('rejects an invalid email with a translatable message', () => {
    const result = resumeSchema.safeParse({ ...EMPTY_RESUME, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('resume.errors.email');
  });

  it('recovers from missing or corrupt stored data', () => {
    expect(parseStoredResume(null)).toEqual(EMPTY_RESUME);
    expect(parseStoredResume({ fullName: 'Arif' }).fullName).toBe('Arif');
    expect(parseStoredResume({ skills: 'not-an-array' })).toEqual(EMPTY_RESUME);
  });
});
