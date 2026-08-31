/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed to GitHub Pages as a project site (github.com/<user>/Lifelog →
// <user>.github.io/Lifelog/), so assets need that subpath as their base.
// Root-domain hosts (Vercel/Netlify/local) keep the default '/'. The GitHub
// Actions Pages workflow sets GH_PAGES=true when building for Pages.
const BASE = process.env.GH_PAGES === 'true' ? '/Lifelog/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon-32.png', 'favicon-16.png', 'apple-touch-icon.png'],
      manifest: {
        id: BASE,
        name: 'LifeLog — Daily Life Tracker',
        short_name: 'LifeLog',
        description:
          'A personal daily timeline for nutrition, activity, sleep, and lifestyle. Private and offline-first — your data stays on your device.',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        display_override: ['standalone', 'browser'],
        background_color: '#f6f7f5',
        theme_color: '#3d7148',
        orientation: 'portrait-primary',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${BASE}icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + static assets: precache and serve offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${BASE}index.html`,
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
