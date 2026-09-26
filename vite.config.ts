/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Public pages listed in the sitemap (everything under /app needs an account). */
const PUBLIC_PATHS = ['/', '/help', '/privacy', '/login', '/signup'];

/**
 * Absolute URLs for SEO: fills %SITE_URL% in index.html (Open Graph, canonical) and emits
 * robots.txt and sitemap.xml. Set VITE_SITE_URL to the production domain.
 */
function siteMeta(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, '');
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /app',
    'Disallow: /onboarding',
    'Disallow: /auth/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PUBLIC_PATHS.map((p) => `  <url><loc>${base}${p}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  return {
    name: 'bondhu-site-meta',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', base),
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // The SSR build (prerender entry) needs neither SEO files nor a service worker.
    !isSsrBuild &&
      siteMeta(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://bondhu.vercel.app'),
    !isSsrBuild &&
      VitePWA({
        registerType: 'autoUpdate',
        // Registered from src/boot.ts a few seconds after load, so precaching the app never
        // competes with the first visit's page load.
        injectRegister: false,
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Bondhu: Your Partner in Growth',
          short_name: 'Bondhu',
          description:
            'Mood tracking, a private journal, mentors, community and calming games for students and young professionals in Bangladesh.',
          lang: 'en',
          start_url: '/app',
          scope: '/',
          display: 'standalone',
          background_color: '#f6faf7',
          theme_color: '#006a4e',
          categories: ['health', 'education', 'lifestyle'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Offline shell: precache the app code and the fonts we actually use. The PDF engine and
          // unused font subsets load on demand instead. Supabase requests are never cached.
          globPatterns: ['**/*.{js,css,html,svg,woff2}', 'icons/*.png'],
          globIgnores: [
            '**/ResumePdf-*.js',
            '**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese,latin-ext}-*.woff2',
          ],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/auth\//, /\.(xml|txt)$/],
        },
      }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
  build: {
    // The largest chunk is the PDF engine (@react-pdf/renderer), loaded only when a user clicks
    // "Download PDF". Everything on normal navigation stays well under this limit.
    chunkSizeWarningLimit: 1300,
    rolldownOptions: {
      output: {
        // Stable vendor chunks: better long-term caching, and form/validation libraries load
        // only with the pages that use them (auth, onboarding).
        codeSplitting: {
          groups: [
            // Vite's tiny dynamic-import helper gets its own chunk; otherwise it lands in the React
            // chunk and the boot entry (src/boot.ts) would have to download React before first paint.
            { name: 'preload-helper', test: /preload-helper/, priority: 100 },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
            },
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
            {
              name: 'motion',
              test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/,
            },
            { name: 'radix', test: /node_modules[\\/](radix-ui|@radix-ui|@floating-ui)[\\/]/ },
            {
              name: 'i18n',
              test: /node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/,
            },
            { name: 'forms', test: /node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          css: false,
        },
      },
      {
        // Database tests: real migrations in PGlite (Postgres in WASM), no Docker needed.
        extends: true,
        test: {
          name: 'db',
          environment: 'node',
          include: ['supabase/tests/**/*.test.ts'],
          testTimeout: 60_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
}));
