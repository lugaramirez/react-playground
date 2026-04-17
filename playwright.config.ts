import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Run each test file in parallel; tests within a file run sequentially.
  fullyParallel: true,
  // Fail the build on CI if test.only is accidentally left in.
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://localhost:5173',
    // Capture a screenshot only on failure — useful for debugging.
    screenshot: 'only-on-failure',
  },
  // Automatically start the dev server before tests and stop it after.
  // reuseExistingServer lets you keep a manually started server during development.
  webServer: {
    command: 'npm run dev:mock',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
  // Only run Chromium — enough for a learning project.
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
