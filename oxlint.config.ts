import { defineConfig } from "@standard-config/oxlint";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import eslintPluginZod from "eslint-plugin-zod";

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
  plugins: [
    "eslint",
    "import",
    "jsx-a11y",
    "node",
    "oxc",
    "promise",
    "react",
    "react-perf",
    "typescript",
    "unicorn",
    "vitest",
  ],
  categories: {
    suspicious: "error",
    correctness: "error",
  },
  jsPlugins: [
    "@tanstack/eslint-plugin-router",
    "@tanstack/eslint-plugin-query",
    "eslint-plugin-zod",
  ],
  ignorePatterns: [
    "realworld/**",
    "public/mockServiceWorker.js",
    "src/lib/router/routeTree.gen.ts",
  ],
  rules: {
    ...eslintPluginZod.configs.recommended.rules,
    ...pluginRouter.configs.recommended.rules,
    ...pluginQuery.configs.recommendedStrict.rules,

    // allow single line: if (x) return y
    curly: ["error", "multi-line"],

    // tanstack form uses children as props exclusively
    "react/no-children-prop": "off",

    // let typescript infer refer types
    "typescript/explicit-module-boundary-types": "off",

    // allow x == null which is true when x is either null or undefined
    "no-eq-null": "off",

    // prefer interface over type
    "typescript/consistent-type-definitions": ["error", "interface"],

    // allow x == null which is true when x is either null or undefined
    eqeqeq: ["error", "smart"],

    "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }], // allow: import "*".css"

    // should allow tanStack router's redirect and notFound as throwable objects.
    "@typescript-eslint/only-throw-error": [
      "error",
      {
        allow: [
          {
            from: "package",
            package: "@tanstack/router-core",
            name: "Redirect",
          },
          {
            from: "package",
            package: "@tanstack/router-core",
            name: "NotFoundError",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/__msw__/**/*"],
      rules: {
        // we throw HttpResponses in our mock service helpers and handlers
        "typescript/only-throw-error": "off",
      },
    },
    {
      files: ["src/__msw__/handlers/*"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "msw",
                importNames: ["http", "HttpResponse"],
                message:
                  "import from '#app/__msw__/msw.utils.ts' instead as we export our own http function and re-export HttpResponse",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/__tests__/**/*.browser.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "vitest",
                message:
                  "import from '#app/__tests__/test.utils.tsx' instead, we re-export all vitest exports",
              },
              {
                name: "vitest/browser",
                message:
                  "import from '#app/__tests__/test.utils.tsx' instead, we re-export all vitest/browser exports",
              },
            ],
          },
        ],
      },
    },
  ],
});
