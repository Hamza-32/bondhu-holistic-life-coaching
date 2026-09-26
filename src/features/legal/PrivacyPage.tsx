import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';

/** Plain-language privacy policy (public). Content lives in the locale files. */
export function PrivacyPage() {
  const { t } = useTranslation();
  const sections = t('privacy.sections', { returnObjects: true });

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('privacy.title')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('privacy.updated')}</p>
      <p className="mt-6 text-lg text-muted-foreground">{t('privacy.intro')}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-12 rounded-2xl bg-muted p-4 text-sm">{t('safety.disclaimer')}</p>
    </Container>
  );
}

export default PrivacyPage;
