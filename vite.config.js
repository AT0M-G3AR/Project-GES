import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update service worker silently in background
      registerType: 'autoUpdate',
      // Cache all app assets so the app works fully offline
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Cache-first for all assets: serve from cache, fall back to network
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ges-ll88-audit-tool\.vercel\.app\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'll88-app-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Web App Manifest — controls how the app looks when installed
      manifest: {
        name: 'LL88 Audit Tool',
        short_name: 'LL88 Audit',
        description: 'NYC Local Law 88 lighting compliance audit tool for Gaia Energy Solutions',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  test: {
    environment: 'node',
  },
});
