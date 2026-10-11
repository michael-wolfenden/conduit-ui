import { createFileRoute, redirect } from "@tanstack/react-router";

import { authStore } from "#app/lib/auth/auth.store.ts";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ location }) => {
    const { authenticatedUser } = authStore();

    if (authenticatedUser === undefined) {
      throw redirect({
        to: "/login",
        search: { redirect: `${location.pathname}${location.searchStr}` },
      });
    }

    return { authenticatedUser };
  },
});
