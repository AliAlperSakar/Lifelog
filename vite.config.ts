/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon-32.png', 'favicon-16.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'LifeLog — Daily Life Tracker',
        short_name: 'LifeLog',
        description:
          'A personal daily timeline for nutrition, activity, sleep, and lifestyle. Private and offline-first — your data stays on your device.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'browser'],
        background_color: '#f6f7f5',
        theme_color: '#3d7148',
        orientation: 'portrait-primary',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + static assets: precache and serve offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // No runtime network calls are made for personal data (local-first),
        // so no runtime caching rules are needed beyond the precached shell.
      },
      devOptions: {
        // Allow testing the service worker during `npm run dev` if needed;
        // disabled by default to keep dev server behavior predictable.
        enabled: false,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Playwright e2e specs live in ./e2e and have their own runner/config —
    // keep them out of Vitest's discovery (both use a `*.spec.ts` pattern).
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
