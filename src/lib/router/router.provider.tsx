import { useQueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider as TanstackRouterProvider } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { routeTree } from "#app/lib/router/routeTree.gen.ts";
import { NotFound } from "#app/pages/-not-found.tsx";
import { PageError } from "#app/ui/errors/page-error.tsx";
import { Spinner } from "#app/ui/spinner.tsx";

const router = createRouter({
  routeTree,

  // since we're using React Query, we don't want loader calls to ever be stale
  // this will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  defaultPreload: "intent",

  defaultPendingMs: 500,
  defaultPendingMinMs: 200,

  defaultPendingComponent: () => <Spinner />,
  defaultErrorComponent: (props) => <PageError {...props} />,
  defaultNotFoundComponent: () => <NotFound />,

  context: {
    queryClient: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function RouterProvider(): ReactNode {
  const queryClient = useQueryClient();

  return <TanstackRouterProvider router={router} context={{ queryClient }} />;
}
