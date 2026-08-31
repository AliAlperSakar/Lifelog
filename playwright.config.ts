import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: '/opt/pw-browsers/chromium',
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  // A plain viewport override (rather than Playwright's `devices['iPhone
  // 13']` touch/UA emulation profile) — this sandbox's headless Chromium
  // build has no dbus/session bus, and the full mobile emulation profile
  // was unreliable here. Viewport width is what our CSS actually responds
  // to, so this still exercises the real mobile layout.
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
})
