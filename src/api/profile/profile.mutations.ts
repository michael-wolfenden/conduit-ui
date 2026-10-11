import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import { articleKeys } from "#app/api/articles/articles.keys.ts";
import type { Articles, Article } from "#app/api/articles/articles.types.ts";
import { getProfileByUsername } from "#app/api/profile/profile.queries.ts";

function useUpdateFollowingMutation(username: string, following: boolean) {
  const queryClient = useQueryClient();
  const mutationKey = ["update-following", username];
  const getProfileByUsernameQueryKey = getProfileByUsername(username).queryKey;

  return useMutation({
    mutationKey,
    scope: { id: `following-${username}` },
    mutationFn: async () => {
      const data = following
        ? await api("@post/profiles/:username/follow", { params: { username } })
        : await api("@delete/profiles/:username/follow", { params: { username } });

      return data.profile;
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: getProfileByUsernameQueryKey }),
        queryClient.cancelQueries({ queryKey: articleKeys.lists() }),
        queryClient.cancelQueries({ queryKey: articleKeys.details() }),
      ]);

      const previousProfile = queryClient.getQueryData(getProfileByUsernameQueryKey);
      const previousLists = queryClient.getQueriesData<Articles>({ queryKey: articleKeys.lists() });
      const previousDetails = queryClient.getQueriesData<Article>({
        queryKey: articleKeys.details(),
      });

      queryClient.setQueryData(getProfileByUsernameQueryKey, (prev) => {
        if (!prev) return prev;
        if (prev.following === following) return prev;
        return { ...prev, following };
      });

      queryClient.setQueriesData<Articles>({ queryKey: articleKeys.lists() }, (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          articles: prev.articles.map((articleSummary) => {
            if (articleSummary.author.username !== username) return articleSummary;
            if (articleSummary.author.following === following) return articleSummary;

            return {
              ...articleSummary,
              author: { ...articleSummary.author, following },
            };
          }),
        };
      });

      queryClient.setQueriesData<Article>({ queryKey: articleKeys.details() }, (prev) => {
        if (!prev) return prev;
        if (prev.author.username !== username) return prev;
        if (prev.author.following === following) return prev;

        return { ...prev, author: { ...prev.author, following } };
      });

      return { previousProfile, previousLists, previousDetails };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      if (queryClient.isMutating({ mutationKey }) > 1) return;

      queryClient.setQueryData(getProfileByUsernameQueryKey, context.previousProfile);

      for (const [key, data] of [...context.previousLists, ...context.previousDetails]) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: async () => {
      if (queryClient.isMutating({ mutationKey }) > 1) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getProfileByUsernameQueryKey }),
        queryClient.invalidateQueries({ queryKey: articleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: articleKeys.details() }),
      ]);
    },
  });
}

export function useFollowProfileMutation(username: string) {
  return useUpdateFollowingMutation(username, true);
}

export function useUnfollowProfileMutation(username: string) {
  return useUpdateFollowingMutation(username, false);
}
