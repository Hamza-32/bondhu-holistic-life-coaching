/**
 * Renders the PWA icons and the Open Graph image from public/favicon.svg with headless Chromium
 * (Playwright). Run after changing the logo: `npm run assets`. Output is committed.
 */
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const svg = readFileSync(path.join(PUBLIC, 'favicon.svg'), 'utf8');
const svgUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

function font(file: string) {
  return `data:font/woff2;base64,${readFileSync(path.join(ROOT, 'node_modules', file)).toString('base64')}`;
}
const inter = font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const hind = font('@fontsource/hind-siliguri/files/hind-siliguri-bengali-600-normal.woff2');

const icons = [
  { file: 'icons/icon-192.png', size: 192, maskable: false },
  { file: 'icons/icon-512.png', size: 512, maskable: false },
  // Maskable icons need the artwork inside the central 80% "safe zone" on a full-bleed background.
  { file: 'icons/icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: true },
];

const og = `<!doctype html><html><head><style>
  @font-face { font-family: Inter; src: url(${inter}) format('woff2'); font-weight: 100 900; }
  @font-face { font-family: Hind; src: url(${hind}) format('woff2'); font-weight: 600; }
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; display: flex; align-items: center; gap: 64px;
    padding: 0 96px; box-sizing: border-box; font-family: Inter, sans-serif;
    background: radial-gradient(circle at 85% 20%, #d6f0e3 0, transparent 45%),
                radial-gradient(circle at 10% 90%, #fde4dc 0, transparent 40%), #f6faf7; color: #0e1512; }
  img { width: 260px; height: 260px; border-radius: 64px; box-shadow: 0 30px 60px -20px rgba(0,106,78,.45); }
  h1 { font-size: 104px; margin: 0; letter-spacing: -3px; line-height: 1; }
  .bn { font-family: Hind, sans-serif; color: #006a4e; font-size: 44px; margin-top: 8px; }
  p { font-size: 36px; margin: 28px 0 0; color: #3c4a44; line-height: 1.3; max-width: 640px; }
  .pill { display: inline-block; margin-top: 32px; padding: 10px 22px; border-radius: 999px;
    background: #006a4e; color: #fff; font-size: 24px; font-weight: 600; }
</style></head><body>
  <img src="${svgUrl}" alt="" />
  <div>
    <h1>Bondhu</h1>
    <div class="bn">বন্ধু · আপনার পাশে</div>
    <p>Mood, journal, mentors and calm games for students in Bangladesh.</p>
    <span class="pill">Free · Private · English &amp; বাংলা</span>
  </div>
</body></html>`;

mkdirSync(path.join(PUBLIC, 'icons'), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, size, maskable } of icons) {
  await page.setViewportSize({ width: size, height: size });
  const inner = maskable ? Math.round(size * 0.72) : size;
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${maskable ? '#006a4e' : 'transparent'}">
    <img src="${svgUrl}" style="width:${inner}px;height:${inner}px" /></body></html>`);
  await page.screenshot({ path: path.join(PUBLIC, file), omitBackground: !maskable });
  console.log('wrote', file);
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(og);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(PUBLIC, 'og-image.png') });
console.log('wrote og-image.png');

await browser.close();
