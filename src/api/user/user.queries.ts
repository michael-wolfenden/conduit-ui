import { queryOptions } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import { authStore } from "#app/lib/auth/auth.store.ts";

export const getCurrentUser = queryOptions({
  queryKey: ["user"],
  queryFn: async ({ signal }) => {
    try {
      const data = await api("@get/user", { signal });
      authStore().login(data.user);
    } catch {
      // if the token that was persisted in local storage was invalid or expired,
      // clear the persisted user to force the user to log in again
      authStore().logout();
    }

    // we are storing user state in zustand so don't store any data in the react query cache
    return null;
  },
  // only try to fetch the current user if we find a persisted token
  enabled: authStore().token !== undefined,
  staleTime: "static",
});
