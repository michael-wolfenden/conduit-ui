import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import { articleKeys } from "#app/api/articles/articles.keys.ts";
import { getArticle } from "#app/api/articles/articles.queries.ts";
import type { Articles, UpdateArticleRequest } from "#app/api/articles/articles.types.ts";
import { getComments } from "#app/api/comments/comments.queries.ts";
import { getTags } from "#app/api/tags/tags.queries.ts";

function useUpdateFavoritedMutation(slug: string, favorited: boolean) {
  const queryClient = useQueryClient();
  const mutationKey = ["update-favorited"];
  const delta = favorited ? 1 : -1;
  const getArticleQueryKey = getArticle(slug).queryKey;

  return useMutation({
    mutationKey,
    scope: { id: `favorite-${slug}` },
    mutationFn: async () => {
      const data = favorited
        ? await api("@post/articles/:slug/favorite", { params: { slug } })
        : await api("@delete/articles/:slug/favorite", { params: { slug } });

      return data.article;
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: articleKeys.lists() }),
        queryClient.cancelQueries({ queryKey: getArticleQueryKey }),
      ]);

      const previousArticles = queryClient.getQueriesData<Articles>({
        queryKey: articleKeys.lists(),
      });
      const previousArticle = queryClient.getQueryData(getArticleQueryKey);

      queryClient.setQueriesData<Articles>({ queryKey: articleKeys.lists() }, (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          articles: prev.articles.map((articleSummary) => {
            if (articleSummary.slug !== slug) return articleSummary;
            if (articleSummary.favorited === favorited) return articleSummary;

            return {
              ...articleSummary,
              favorited,
              favoritesCount: articleSummary.favoritesCount + delta,
            };
          }),
        };
      });

      queryClient.setQueryData(getArticleQueryKey, (prev) => {
        if (!prev) return prev;
        if (prev.favorited === favorited) return prev;

        return { ...prev, favorited, favoritesCount: prev.favoritesCount + delta };
      });

      return { previousArticles, previousArticle };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      if (queryClient.isMutating({ mutationKey }) > 1) return;

      for (const [key, data] of context.previousArticles) {
        queryClient.setQueryData(key, data);
      }

      queryClient.setQueryData(getArticleQueryKey, context.previousArticle);
    },
    onSettled: async () => {
      if (queryClient.isMutating({ mutationKey }) > 1) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: articleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: getArticleQueryKey }),
      ]);
    },
  });
}

export function useFavoriteArticleMutation(slug: string) {
  return useUpdateFavoritedMutation(slug, true);
}

export function useUnfavoriteArticleMutation(slug: string) {
  return useUpdateFavoritedMutation(slug, false);
}

export function useDeleteArticleMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => api("@delete/articles/:slug", { params: { slug } }),
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: articleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: getTags.queryKey }),
      ]),
  });
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateArticleRequest) => {
      const data = await api("@post/articles", { body: request });
      return data.article;
    },
    onSuccess: async (article) => {
      queryClient.setQueryData(getArticle(article.slug).queryKey, article);
      queryClient.setQueryData(getComments(article.slug).queryKey, []);

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: articleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: getTags.queryKey }),
      ]);
    },
  });
}

export function useUpdateArticleMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: articleKeys.all,
    mutationFn: async (request: UpdateArticleRequest) => {
      const data = await api("@put/articles/:slug", { params: { slug }, body: request });
      return data.article;
    },
    onSuccess: async (article) => {
      queryClient.setQueryData(getArticle(article.slug).queryKey, article);

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: articleKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: getTags.queryKey }),
      ]);
    },
  });
}
