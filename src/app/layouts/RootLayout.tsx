import { Outlet, ScrollRestoration } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DocumentTitle } from '@/components/DocumentTitle';
import { NavigationProgress } from '@/components/NavigationProgress';

export function RootLayout() {
  const { t } = useTranslation();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('app.skipToContent')}
      </a>
      <DocumentTitle />
      <NavigationProgress />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
