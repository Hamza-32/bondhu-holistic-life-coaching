import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { ThemeSync } from './ThemeSync';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user" makes every motion component honour prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <ThemeSync />
      {children}
    </MotionConfig>
  );
}
