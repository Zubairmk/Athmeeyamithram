import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<owner>.github.io/athmeeyamithram/ (a project Pages
  // site, not a user/org root site), so all asset URLs need this prefix.
  base: '/athmeeyamithram/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'ആത്മീയമിത്രം — Dhikr & Azkar',
        short_name: 'ആത്മീയമിത്രം',
        description: 'An offline-first dhikr and azkar companion.',
        theme_color: '#124238',
        background_color: '#faf6ec',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The admin panel (pdf.js, tesseract.js, its vendored OCR core) is
        // only ever loaded by whoever visits /admin — precaching it into
        // every regular user's service worker install would defeat the
        // point of code-splitting it out in the first place. It's cached
        // opportunistically instead, via the runtimeCaching rule below,
        // the first time someone actually opens /admin.
        globIgnores: [
          '**/assets/Admin*-*.js',
          '**/assets/pdf.worker.min-*.mjs',
          '**/tesseract-core/**',
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/assets\/(Admin[^/]+|pdf\.worker\.min[^/]*)\.(js|mjs)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'admin-bundle',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/tesseract-core\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-engine',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
