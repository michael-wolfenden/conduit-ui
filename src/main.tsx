import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "#app/lib/auth/auth.provider.tsx";
import { authStore } from "#app/lib/auth/auth.store.ts";
import { QueryClientProvider } from "#app/lib/query/query.provider.tsx";
import { RouterProvider } from "#app/lib/router/router.provider.tsx";

import "#realworld-submodule/assets/theme/styles.css";
import { env } from "#app/lib/utils/env.ts";

await enableMocking();
addE2ETestDebugHelpers();

const appRoot = document.querySelector("app-root");
if (!appRoot) throw new Error("app-root not found");

createRoot(appRoot).render(
  <StrictMode>
    <QueryClientProvider>
      <AuthProvider>
        <RouterProvider />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);

async function enableMocking() {
  // tree-shake out __msw__ folder in PROD build
  if (import.meta.env.PROD) return;
  if (!env.ENABLE_MOCKS) return;

  const { worker } = await import("#app/__msw__/msw.worker.ts");

  await worker.start({ quiet: true, onUnhandledFrame: "bypass" });

  // oxlint-disable-next-line no-console
  console.log("[MSW] started");
}

// see: https://github.com/realworld-apps/realworld/blob/main/specs/e2e/helpers/debug.ts
function addE2ETestDebugHelpers() {
  // tree-shake out in PROD build
  if (import.meta.env.PROD) return;

  (globalThis as Record<string, unknown>).__conduit_debug__ = {
    getToken: () => authStore().token,
    getAuthState: () => (authStore().isAuthenticated() ? "authenticated" : "unauthenticated"),
    getCurrentUser: () => authStore().authenticatedUser,
  };
}
