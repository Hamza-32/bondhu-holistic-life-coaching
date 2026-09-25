import { useTranslation } from 'react-i18next';
import { useRouteTitleKey } from '@/app/routeHandle';

/** Sets a per-route, translated <title> (WCAG 2.4.2). React 19 hoists <title> into <head>. */
export function DocumentTitle() {
  const { t } = useTranslation();
  const titleKey = useRouteTitleKey();
  const appName = t('app.name');
  const title = titleKey ? `${t(titleKey)} · ${appName}` : `${appName} · ${t('app.tagline')}`;
  return <title>{title}</title>;
}
