import { MailCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function CheckEmail({ email }: { email: string }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <MailCheck className="size-7" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold">{t('auth.checkEmail.title')}</h1>
      <p className="mt-3 text-muted-foreground">{t('auth.checkEmail.body', { email })}</p>
      <p className="mt-3 text-sm text-muted-foreground">{t('auth.checkEmail.spam')}</p>
      <Button asChild variant="outline" className="mt-8 h-11 w-full">
        <Link to="/login">{t('auth.checkEmail.back')}</Link>
      </Button>
    </div>
  );
}
