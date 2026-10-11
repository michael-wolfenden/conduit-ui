import { queryOptions } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import { articleKeys } from "#app/api/articles/articles.keys.ts";
import type { ArticlesFilter } from "#app/api/articles/articles.types.ts";
import { getProfileByUsername } from "#app/api/profile/profile.queries.ts";

export function getArticles(filter: ArticlesFilter) {
  return queryOptions({
    queryKey: articleKeys.list(filter),
    queryFn: async ({ signal, client }) => {
      const { limit, offset, author, favorited, tag, feed } = filter;

      const response =
        feed === "following"
          ? await api("@get/articles/feed", { query: { limit, offset }, signal })
          : await api("@get/articles", {
              query: { limit, offset, author, favorited, tag },
              signal,
            });

      // preload profiles
      for (const profile of response.articles.flatMap((article) => article.author)) {
        client.setQueryData(getProfileByUsername(profile.username).queryKey, profile);
      }

      // _sigh_ if only the response included the article's body we could preload articles as well

      return response;
    },
  });
}

export function getArticle(slug: string) {
  return queryOptions({
    queryKey: articleKeys.detail(slug),
    queryFn: async ({ signal }) => {
      const response = await api("@get/articles/:slug", { signal, params: { slug } });
      return response.article;
    },
  });
}
