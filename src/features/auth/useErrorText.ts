import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

/** Translate a schema message (an i18n key) safely; unknown keys fall back to a generic error. */
export function useErrorText() {
  const { t, i18n } = useTranslation();
  return (message: string | undefined) => {
    if (!message) return undefined;
    return i18n.exists(message) ? t(message as ParseKeys) : t('auth.errors.generic');
  };
}
