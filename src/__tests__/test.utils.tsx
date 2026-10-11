import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import type { AnyRoute, RegisteredRouter, ValidateNavigateOptions } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { render } from "vitest-browser-react";

import { createUser } from "#app/__tests__/test.builders.ts";
import type { User } from "#app/api/user/user.types.ts";
import { authStore } from "#app/lib/auth/auth.store.ts";
import { routeTree } from "#app/lib/router/routeTree.gen.ts";

async function renderRouterProvider<
  TRouter extends RegisteredRouter = RegisteredRouter,
  const TOptions = unknown,
>(navigateOptions: ValidateNavigateOptions<TRouter, TOptions>, routerRouteTree: AnyRoute) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const history = createMemoryHistory({ initialEntries: ["/"] });

  const router = createRouter({
    routeTree: routerRouteTree,
    context: { queryClient },
    defaultPreloadStaleTime: 0,
    defaultPendingMinMs: 0,
    history,
  });

  // oxlint-disable-next-line typescript/no-unsafe-argument
  const location = router.buildLocation(navigateOptions as any);
  history.push(location.href);

  const result = await render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  // wait for fetchers to load
  await router.load();

  return { ...result, router };
}

export async function renderRoute<
  TRouter extends RegisteredRouter = RegisteredRouter,
  const TOptions = unknown,
>(navigateOptions: ValidateNavigateOptions<TRouter, TOptions>) {
  return renderRouterProvider<TRouter, TOptions>(navigateOptions, routeTree);
}

export async function renderComponent(component: ReactNode) {
  const rootRoute = createRootRoute({
    component: Outlet,
  });

  const routerRouteTree = rootRoute.addChildren([
    createRoute({
      path: "/",
      getParentRoute: () => rootRoute,
      // oxlint-disable-next-line typescript/promise-function-async - this has to be synchronous
      component: () => component,
    }),
  ]);

  return renderRouterProvider({ to: "/" }, routerRouteTree);
}

export function logout() {
  authStore().logout();
}

export function login(user?: User) {
  const authenticatedUser = user ?? createUser();
  authStore().login(authenticatedUser);
  return authenticatedUser;
}

export function getAuthenticatedUser() {
  return authStore().authenticatedUser;
}

export * from "vitest";
export * from "vitest/browser";
export { test } from "#app/__tests__/test.extends.ts";
