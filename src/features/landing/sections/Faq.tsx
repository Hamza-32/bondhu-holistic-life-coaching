import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeading } from '../components/SectionHeading';

export function Faq() {
  const { t } = useTranslation();
  const items = t('landing.faq.items', { returnObjects: true });

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-20 sm:py-28">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionHeading
            id="faq-title"
            eyebrow={t('landing.faq.eyebrow')}
            title={t('landing.faq.title')}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion
            type="single"
            collapsible
            className="mt-12 rounded-2xl border bg-card px-6 shadow-soft"
          >
            {items.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base text-pretty text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}
