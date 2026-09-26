import { Faq } from './sections/Faq';
import { FeatureGrid } from './sections/FeatureGrid';
import { FinalCta } from './sections/FinalCta';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Safety } from './sections/Safety';
import { Stats } from './sections/Stats';

export function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <Stats />
      <Safety />
      <Faq />
      <FinalCta />
    </>
  );
}

export default LandingPage;
