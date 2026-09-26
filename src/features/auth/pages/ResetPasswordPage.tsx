import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageLoader } from '@/components/PageLoader';
import { Button } from '@/components/ui/button';
import { updatePassword } from '../api';
import { AuthHeading, FormAlert, PasswordField } from '../components/FormBits';
import { useAuth } from '../context';
import { authErrorKey, type AuthErrorKey } from '../errors';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';

/**
 * Reached from the password-reset email. Supabase exchanges the link's code for a session
 * automatically (detectSessionInUrl), so a valid link means we are signed in here.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFormError(null);
    try {
      await updatePassword(password);
      toast.success(t('auth.toast.passwordUpdated'));
      void navigate('/app', { replace: true });
    } catch (error) {
      setFormError(authErrorKey(error));
    }
  });

  if (state.status === 'loading') return <PageLoader />;

  if (state.status !== 'signedIn') {
    return (
      <div className="space-y-6">
        <AuthHeading title={t('auth.reset.title')} />
        <FormAlert messageKey="auth.reset.invalid" />
        <Button asChild className="h-11 w-full">
          <Link to="/forgot-password">{t('auth.reset.requestNew')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <AuthHeading title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')} />
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <FormAlert messageKey={formError} />
        <PasswordField
          label={t('auth.fields.newPassword')}
          autoComplete="new-password"
          hint={t('auth.signUp.passwordHint')}
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <PasswordField
          label={t('auth.fields.confirmPassword')}
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
          {t('auth.reset.submit')}
        </Button>
      </form>
    </>
  );
}

export default ResetPasswordPage;
