import { z } from 'zod';

/*
 * Shared auth schemas. Error messages are i18n keys (translated by <FieldError>), so the same
 * schema validates in English and Bangla.
 */

export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: 'auth.errors.emailInvalid' }));

/** Password rules for new passwords (sign-up and reset). Letters include Bangla script. */
export const newPasswordSchema = z
  .string()
  .min(8, { error: 'auth.errors.passwordShort' })
  .max(72, { error: 'auth.errors.passwordLong' })
  .refine((v) => /\p{L}/u.test(v) && /\d/.test(v), { error: 'auth.errors.passwordWeak' });

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { error: 'auth.errors.nameRequired' })
  .max(50, { error: 'auth.errors.nameTooLong' });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'auth.errors.passwordRequired' }),
});

export const signUpSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: 'auth.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export const emailOnlySchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: 'auth.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type EmailOnlyValues = z.infer<typeof emailOnlySchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
