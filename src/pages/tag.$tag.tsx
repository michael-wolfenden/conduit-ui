import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import * as z from "zod";

import { getArticles } from "#app/api/articles/articles.queries.ts";
import { getTags } from "#app/api/tags/tags.queries.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { fallback } from "#app/lib/utils/zod.ts";
import { ArticleList } from "#app/ui/articles/article-list.tsx";
import { Banner } from "#app/ui/banner.tsx";
import { Tags } from "#app/ui/tags/tags.tsx";

const searchDefaults = {
  page: 1,
  limit: 10,
};

const searchSchema = z.object({
  page: fallback(z.number().min(1), searchDefaults.page),
  limit: fallback(z.number().max(10), searchDefaults.limit),
});

export const Route = createFileRoute("/tag/$tag")({
  component: RouteComponent,
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(searchDefaults)] },
  loaderDeps: ({ search: { page, limit } }) => ({
    offset: (page - 1) * limit,
    limit,
  }),
  context: ({ params: { tag }, deps: { offset, limit } }) => ({
    getArticles: getArticles({ offset, limit, tag, feed: "global" }),
  }),
  loader: async ({ context: { queryClient, getArticles } }) => {
    void queryClient.query({ ...getTags, staleTime: "static" });
    await queryClient.query({ ...getArticles, staleTime: "static" });
  },
});

function RouteComponent() {
  const { getArticles } = Route.useRouteContext();
  const { articles, articlesCount } = useSuspenseQuery(getArticles).data;
  const { page, limit } = Route.useSearch();

  return (
    <div className="home-page">
      <Banner />
      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <FeedToggle />
            <ArticleList
              limit={limit}
              currentPage={page}
              articles={articles}
              articlesCount={articlesCount}
              isFollowingFeed={false}
            />
          </div>
          <div className="col-md-3">
            <Tags />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedToggle() {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
  const { tag } = Route.useParams();

  return (
    <div className="feed-toggle">
      <ul className="nav nav-pills outline-active">
        {authenticatedUser && (
          <li className="nav-item">
            <Link to="/" search={{ feed: "following" }} className="nav-link">
              Your Feed
            </Link>
          </li>
        )}
        <li className="nav-item">
          <Link to="/" search={{ feed: "global" }} className="nav-link">
            Global Feed
          </Link>
        </li>
        <li className="nav-item">
          <span className="nav-link active">{`# ${tag}`}</span>
        </li>
      </ul>
    </div>
  );
}
