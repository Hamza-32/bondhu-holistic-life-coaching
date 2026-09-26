/**
 * Entry point. When the landing page was prerendered into #root (scripts/prerender.ts), let the
 * browser paint that HTML first and load the app right after, so slow phones see content
 * without waiting for JavaScript. Every other route starts the app immediately.
 */
// Imported here so the stylesheet stays a render-blocking <link> in index.html.
import '@/styles/globals.css';

const start = () => void import('./main');

/** Run once the browser has actually painted (with a fallback for hidden tabs or old browsers). */
function afterFirstPaint(callback: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    callback();
  };
  if (performance.getEntriesByName('first-contentful-paint').length > 0) {
    run();
    return;
  }
  try {
    const observer = new PerformanceObserver(() => {
      observer.disconnect();
      setTimeout(run, 0);
    });
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    requestAnimationFrame(() => setTimeout(run, 0));
  }
  // Fallback: hidden tabs never paint, and a slow device may be late to report it.
  setTimeout(run, 3000);
}

if (document.getElementById('root')?.hasChildNodes()) afterFirstPaint(start);
else start();

// Offline support: register the service worker once the page has settled. Its precache
// (~2 MB) must not compete with the first visit's own downloads.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
    }, 4000);
  });
}
