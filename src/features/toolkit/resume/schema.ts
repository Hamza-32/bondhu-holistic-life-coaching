import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);

export const educationSchema = z.object({
  degree: text(120),
  institution: text(120),
  year: text(20),
});

export const experienceSchema = z.object({
  role: text(120),
  organization: text(120),
  period: text(40),
  description: text(1000),
});

/** Stored as resumes.data (jsonb). Shared by the editor, autosave and the PDF. */
export const resumeSchema = z.object({
  fullName: text(80),
  headline: text(120),
  email: z.union([z.literal(''), z.email({ error: 'resume.errors.email' })]),
  phone: text(30),
  location: text(80),
  summary: text(1200),
  education: z.array(educationSchema).max(6),
  experience: z.array(experienceSchema).max(8),
  skills: z.array(text(40)).max(30),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;

export const EMPTY_RESUME: Resume = {
  fullName: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  education: [{ degree: '', institution: '', year: '' }],
  experience: [],
  skills: [],
};

/** Parse stored JSON defensively: unknown/invalid fields fall back to empty values. */
export function parseStoredResume(data: unknown): Resume {
  const result = resumeSchema.safeParse({
    ...EMPTY_RESUME,
    ...(typeof data === 'object' && data ? data : {}),
  });
  return result.success ? result.data : EMPTY_RESUME;
}
