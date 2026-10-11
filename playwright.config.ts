import { defineConfig, devices } from "@playwright/test";

import { baseConfig } from "./realworld/specs/e2e/playwright.base";

export default defineConfig({
  ...baseConfig,
  testDir: "./realworld/specs/e2e",
  use: {
    ...baseConfig.use,
    baseURL: "http://localhost:3001",
    timezoneId: "Etc/GMT",
    viewport: { width: 1920, height: 1200 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: "/usr/bin/chromium",
        },
      },
    },
  ],
  webServer: {
    command: "vite --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 3 * 60_000,
  },
});
