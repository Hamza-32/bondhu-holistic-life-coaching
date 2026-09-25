import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { currentLanguage, type Language } from '@/lib/i18n';

/** One-tap toggle between English and Bangla. Shows the language you will switch *to*. */
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const current = currentLanguage();
  const next: Language = current === 'en' ? 'bn' : 'en';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void i18n.changeLanguage(next)}
      aria-label={`${t('language.label')}: ${t(`language.${next}`)}`}
      title={t('language.label')}
    >
      <Languages aria-hidden />
      <span lang={next} className="hidden sm:inline">
        {t(`language.${next}`)}
      </span>
    </Button>
  );
}
