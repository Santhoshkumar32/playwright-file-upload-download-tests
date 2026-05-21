// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "html",
  timeout: 120000,
  expect: {
    timeout: 60000,
  },

  use: {
    baseURL: "https://file.io",
    headless: true,
    trace: "retain-on-failure",
    navigationTimeout: 120000,
    actionTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
