import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: [
    "realworld/**",
    "public/mockServiceWorker.js",
    "src/lib/router/routeTree.gen.ts",
  ],
  sortImports: true,
  sortPackageJson: true,
});
