import { queryOptions } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";

export const getTags = queryOptions({
  queryKey: ["tags"] as const,
  queryFn: async ({ signal }) => {
    const data = await api("@get/tags", { signal });
    return data.tags;
  },
});
