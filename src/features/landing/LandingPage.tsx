import type { ReactNode } from 'react';
import { Faq } from './sections/Faq';
import { FeatureGrid } from './sections/FeatureGrid';
import { FinalCta } from './sections/FinalCta';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Safety } from './sections/Safety';
import { Stats } from './sections/Stats';

/**
 * Below-the-fold sections skip rendering work until they approach the viewport
 * (content-visibility), which makes the first paint much cheaper on phones. They stay in the
 * accessibility tree and in find-in-page.
 */
function Deferred({ children }: { children: ReactNode }) {
  return (
    <div className="[contain-intrinsic-size:auto_900px] [content-visibility:auto]">{children}</div>
  );
}

export function LandingPage() {
  return (
    <>
      <Hero />
      <Deferred>
        <FeatureGrid />
      </Deferred>
      <Deferred>
        <HowItWorks />
      </Deferred>
      <Deferred>
        <Stats />
      </Deferred>
      <Deferred>
        <Safety />
      </Deferred>
      <Deferred>
        <Faq />
      </Deferred>
      <Deferred>
        <FinalCta />
      </Deferred>
    </>
  );
}

export default LandingPage;
