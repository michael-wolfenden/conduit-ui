import type { KnipConfig } from "knip";

export default {
  ignore: [
    "realworld/**",
    "src/lib/router/routeTree.gen.ts",
    "src/__tests__/test.browser.setup.ts",
  ],
} satisfies KnipConfig;
