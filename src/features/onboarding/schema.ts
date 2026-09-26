import { z } from 'zod';
import { displayNameSchema } from '@/features/auth/schemas';

export const GOALS = [
  'stress',
  'exams',
  'career',
  'sleep',
  'relationships',
  'habits',
  'confidence',
  'loneliness',
] as const;
export type Goal = (typeof GOALS)[number];

export const onboardingSchema = z.object({
  displayName: displayNameSchema,
  locale: z.enum(['en', 'bn']),
  anonymousAlias: z
    .string()
    .trim()
    .min(3, { error: 'onboarding.steps.alias.invalid' })
    .max(40, { error: 'onboarding.steps.alias.invalid' }),
  division: z.string().nullable(),
  universityId: z.string().nullable(),
  goals: z.array(z.enum(GOALS)).max(GOALS.length),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

/** Fields validated before leaving each step. */
export const STEP_FIELDS = [
  ['displayName', 'locale'],
  ['anonymousAlias'],
  ['division', 'universityId'],
  ['goals'],
] as const satisfies readonly (readonly (keyof OnboardingValues)[])[];

export const STEP_KEYS = ['name', 'alias', 'place', 'goals'] as const;
