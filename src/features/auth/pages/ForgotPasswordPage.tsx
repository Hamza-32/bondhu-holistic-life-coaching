import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { requestPasswordReset } from '../api';
import { CheckEmail } from '../components/CheckEmail';
import { AuthHeading, FormAlert, TextField } from '../components/FormBits';
import { authErrorKey, type AuthErrorKey } from '../errors';
import { emailOnlySchema, type EmailOnlyValues } from '../schemas';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      setFormError(authErrorKey(error));
    }
  });

  if (sentTo) return <CheckEmail email={sentTo} />;

  return (
    <>
      <AuthHeading title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')} />
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <FormAlert messageKey={formError} />
        <TextField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.placeholders.email')}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
          {t('auth.forgot.submit')}
        </Button>
        <p className="text-center text-sm">
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t('auth.forgot.back')}
          </Link>
        </p>
      </form>
    </>
  );
}

export default ForgotPasswordPage;
