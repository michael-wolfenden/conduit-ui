import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getArticles } from "#app/api/articles/articles.queries.ts";
import { ArticleList } from "#app/ui/articles/article-list.tsx";

export const Route = createFileRoute("/profile/$username/favorites")({
  component: RouteComponent,
  loaderDeps: ({ search: { page, limit } }) => ({ offset: page - 1, limit }),
  context: ({ params, deps: { offset, limit } }) => ({
    getArticles: getArticles({ offset, limit, feed: "global", favorited: params.username }),
  }),
  loader: async ({ context: { queryClient, getArticles } }) =>
    queryClient.query({ ...getArticles, staleTime: "static" }),
});

function RouteComponent() {
  const { limit, page } = Route.useSearch();
  const { getArticles } = Route.useRouteContext();
  const { articlesCount, articles } = useSuspenseQuery(getArticles).data;

  return (
    <ArticleList
      limit={limit}
      currentPage={page}
      articlesCount={articlesCount}
      articles={articles}
      isFollowingFeed={false}
    />
  );
}
