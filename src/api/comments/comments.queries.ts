import { queryOptions } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import { commentKeys } from "#app/api/comments/comments.keys.ts";

export function getComments(slug: string) {
  return queryOptions({
    queryKey: commentKeys.list(slug),
    queryFn: async ({ signal }) => {
      const response = await api("@get/articles/:slug/comments", { signal, params: { slug } });
      return response.comments;
    },
  });
}
