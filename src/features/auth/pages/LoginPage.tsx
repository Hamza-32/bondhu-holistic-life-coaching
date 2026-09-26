import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TryDemoButton } from '@/features/demo/TryDemoButton';
import { sendMagicLink, signInWithGoogle, signInWithPassword } from '../api';
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
import { emailOnlySchema, signInSchema, type EmailOnlyValues, type SignInValues } from '../schemas';

type Method = 'password' | 'magic';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const [method, setMethod] = useState<Method>('password');
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const passwordForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const magicForm = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
  });

  const onPassword = passwordForm.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signInWithPassword(values);
      void navigate(next, { replace: true });
    } catch (error) {
      setFormError(authErrorKey(error));
    }
  });

  const onMagic = magicForm.handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await sendMagicLink(email);
      setSentTo(email);
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

  const { errors, isSubmitting } = passwordForm.formState;
  const magicState = magicForm.formState;

  return (
    <>
      <AuthHeading title={t('auth.signIn.title')} subtitle={t('auth.signIn.subtitle')} />

      <div className="space-y-6">
        <GoogleButton onClick={() => void onGoogle()} />
        <TryDemoButton size="default" variant="secondary" className="h-11 w-full" />
        <OrDivider />

        <div
          role="group"
          aria-label={t('auth.signIn.methodLabel')}
          className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-medium"
        >
          {(['password', 'magic'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={method === m}
              onClick={() => {
                setMethod(m);
                setFormError(null);
              }}
              className={cn(
                'rounded-md py-2 transition-colors',
                method === m
                  ? 'bg-card shadow-soft'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'password' ? t('auth.signIn.withPassword') : t('auth.signIn.withMagicLink')}
            </button>
          ))}
        </div>

        <FormAlert messageKey={formError} />

        {method === 'password' ? (
          <form onSubmit={(e) => void onPassword(e)} noValidate className="space-y-4">
            <TextField
              label={t('auth.fields.email')}
              type="email"
              autoComplete="email"
              placeholder={t('auth.placeholders.email')}
              error={errors.email?.message}
              {...passwordForm.register('email')}
            />
            <PasswordField
              label={t('auth.fields.password')}
              autoComplete="current-password"
              error={errors.password?.message}
              labelAside={
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t('auth.signIn.forgot')}
                </Link>
              }
              {...passwordForm.register('password')}
            />
            <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
              {t('auth.signIn.submit')}
            </Button>
          </form>
        ) : (
          <form onSubmit={(e) => void onMagic(e)} noValidate className="space-y-4">
            <TextField
              label={t('auth.fields.email')}
              type="email"
              autoComplete="email"
              placeholder={t('auth.placeholders.email')}
              hint={t('auth.signIn.magicHint')}
              error={magicState.errors.email?.message}
              {...magicForm.register('email')}
            />
            <Button type="submit" className="h-11 w-full" disabled={magicState.isSubmitting}>
              {t('auth.signIn.magicSubmit')}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.signIn.noAccount')}{' '}
          <Link
            to={params.get('next') ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
            className="font-medium text-primary hover:underline"
          >
            {t('auth.signIn.signUpLink')}
          </Link>
        </p>
      </div>
    </>
  );
}

export default LoginPage;
