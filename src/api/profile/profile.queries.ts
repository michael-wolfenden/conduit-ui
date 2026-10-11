import { queryOptions } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";

export function getProfileByUsername(username: string) {
  return queryOptions({
    queryKey: ["profile", "detail", { username }] as const,
    queryFn: async ({ signal }) => {
      const data = await api("@get/profiles/:username", { signal, params: { username } });
      return data.profile;
    },
  });
}
