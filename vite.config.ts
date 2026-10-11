import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    // by default vite inlines default-avatar.svg, however the e2e tests
    // expects to find images with a source containing default-avatar.svg
    assetsInlineLimit: 0,
  },
  server: {
    strictPort: true,
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      generatedRouteTree: "./src/lib/router/routeTree.gen.ts",
      routesDirectory: "./src/pages",
    }),
    react({ compiler: true }),
  ],
  test: {
    reporters: "tree",
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["src/__tests__/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/__tests__/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: "chromium",
                setupFiles: ["src/__tests__/test.browser.setup.ts"],
                viewport: { width: 1920, height: 1200 },
              },
            ],
            provider: playwright({
              contextOptions: {
                // so date formatting uses a fix timezone in tests rather than the clients
                timezoneId: "Etc/GMT",
              },
              launchOptions: {
                executablePath: "/usr/bin/chromium",
              },
            }),
          },
        },
      },
    ],
  },
});
