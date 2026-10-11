import { useQueryClient, useMutation } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import { getComments } from "#app/api/comments/comments.queries.ts";
import type { NewCommentRequest } from "#app/api/comments/comments.types.ts";

export function useCreateCommentMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: NewCommentRequest) => {
      return api("@post/articles/:slug/comments", {
        params: { slug },
        body: request,
      });
    },
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: getComments(slug).queryKey }),
  });
}

export function useDeleteCommentMutation(slug: string, id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => api("@delete/articles/:slug/comments/:id", { params: { slug, id } }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: getComments(slug).queryKey }),
  });
}
