/**
 * Injects the server-rendered landing page into dist/index.html so the first paint needs no
 * JavaScript (Largest Contentful Paint on slow phones). Runs after `vite build` and the SSR
 * build of src/prerender.tsx (see the `build` script).
 *
 * dist/index.html is also the SPA fallback for every other route, so an inline script clears
 * the prerendered markup before first paint unless the visitor is on `/` in English.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');

const entry = readdirSync(SSR_DIR).find((f) => /^prerender\.m?js$/.test(f));
if (!entry) throw new Error('SSR bundle not found: run the SSR build first');
const { render } = (await import(pathToFileURL(path.join(SSR_DIR, entry)).href)) as {
  render: (url: string) => Promise<string>;
};

const html = await render('/');

const guard = `<script>
      (function () {
        try {
          var lang = localStorage.getItem('bondhu-lang');
          var english = lang ? lang === 'en' : !/^bn/i.test(navigator.language || '');
          if (location.pathname !== '/' || !english) {
            document.getElementById('root').innerHTML = '';
            delete window.__staticRouterHydrationData;
          }
        } catch (e) {}
      })();
    </script>`;

const indexPath = path.join(DIST, 'index.html');
const index = readFileSync(indexPath, 'utf8');
if (!index.includes('<div id="root"></div>')) throw new Error('index.html root not found');
writeFileSync(
  indexPath,
  index.replace('<div id="root"></div>', `<div id="root">${html}</div>\n    ${guard}`),
);
rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`prerendered / (${Math.round(html.length / 1024)} kB of HTML)`);
// The Supabase client can keep timers alive in Node; the work is done.
process.exit(0);
