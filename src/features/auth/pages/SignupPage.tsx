import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { signInWithGoogle, signUpWithPassword } from '../api';
import { CheckEmail } from '../components/CheckEmail';
import {
  AuthHeading,
  FormAlert,
  GoogleButton,
  OrDivider,
  PasswordField,
  TextField,
} from '../components/FormBits';
import { authErrorKey, type AuthErrorKey } from '../errors';
import { safeNextPath } from '../redirect';
import { signUpSchema, type SignUpValues } from '../schemas';

export function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { needsConfirmation } = await signUpWithPassword(values);
      if (needsConfirmation) setSentTo(values.email);
      else void navigate(next, { replace: true });
    } catch (error) {
      setFormError(authErrorKey(error));
    }
  });

  const onGoogle = async () => {
    setFormError(null);
    try {
      await signInWithGoogle(next);
    } catch (error) {
      setFormError(authErrorKey(error));
    }
  };

  if (sentTo) return <CheckEmail email={sentTo} />;

  return (
    <>
      <AuthHeading title={t('auth.signUp.title')} subtitle={t('auth.signUp.subtitle')} />

      <div className="space-y-6">
        <GoogleButton onClick={() => void onGoogle()} />
        <OrDivider />
        <FormAlert messageKey={formError} />

        <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
          <TextField
            label={t('auth.fields.displayName')}
            autoComplete="given-name"
            placeholder={t('auth.placeholders.displayName')}
            maxLength={50}
            error={errors.displayName?.message}
            {...form.register('displayName')}
          />
          <TextField
            label={t('auth.fields.email')}
            type="email"
            autoComplete="email"
            placeholder={t('auth.placeholders.email')}
            error={errors.email?.message}
            {...form.register('email')}
          />
          <PasswordField
            label={t('auth.fields.password')}
            autoComplete="new-password"
            hint={t('auth.signUp.passwordHint')}
            error={errors.password?.message}
            {...form.register('password')}
          />
          <PasswordField
            label={t('auth.fields.confirmPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...form.register('confirmPassword')}
          />
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {t('auth.signUp.submit')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t('auth.signUp.disclaimer')}</p>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.signUp.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t('auth.signUp.signInLink')}
          </Link>
        </p>
      </div>
    </>
  );
}

export default SignupPage;
