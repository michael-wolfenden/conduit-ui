import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, stripSearchParams } from "@tanstack/react-router";
import * as z from "zod";

import { getArticles } from "#app/api/articles/articles.queries.ts";
import { feedSchema } from "#app/api/articles/articles.schemas.ts";
import { getTags } from "#app/api/tags/tags.queries.ts";
import { authStore, useAuthStore } from "#app/lib/auth/auth.store.ts";
import { classNames } from "#app/lib/utils/classNames.ts";
import { fallback } from "#app/lib/utils/zod.ts";
import { ArticleList } from "#app/ui/articles/article-list.tsx";
import { Banner } from "#app/ui/banner.tsx";
import { Tags } from "#app/ui/tags/tags.tsx";

const searchDefaults = {
  page: 1,
  limit: 10,
  feed: "global" as const,
};

const searchSchema = z.object({
  page: fallback(z.number().min(1), searchDefaults.page),
  limit: fallback(z.number().max(10), searchDefaults.limit),
  feed: fallback(feedSchema, searchDefaults.feed),
});

export const Route = createFileRoute("/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(searchDefaults)] },
  loaderDeps: ({ search: { page, limit, feed } }) => ({
    offset: (page - 1) * limit,
    limit,
    feed,
  }),
  context: ({ deps: { offset, limit, feed } }) => ({
    getArticles: getArticles({ offset, limit, feed }),
  }),
  beforeLoad: ({ search }) => {
    if (search.feed === "following" && authStore().isUnauthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context: { queryClient, getArticles } }) => {
    void queryClient.query({ ...getTags, staleTime: "static" });
    await queryClient.query({ ...getArticles, staleTime: "static" });
  },
});

function RouteComponent() {
  const { getArticles } = Route.useRouteContext();
  const { articles, articlesCount } = useSuspenseQuery(getArticles).data;
  const { page, limit, feed } = Route.useSearch();

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
              isFollowingFeed={feed === "following"}
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
  const { feed } = Route.useSearch();

  return (
    <div className="feed-toggle">
      <ul className="nav nav-pills outline-active">
        {authenticatedUser && (
          <li className="nav-item">
            <Link
              from={Route.fullPath}
              search={() => ({ feed: "following" as const })}
              activeProps={{ className: undefined }} // we will handle the active class ourselves
              className={classNames("nav-link", feed === "following" && "active")}
            >
              Your Feed
            </Link>
          </li>
        )}
        <li className="nav-item">
          <Link
            from={Route.fullPath}
            search={() => ({ feed: "global" as const })}
            activeProps={{ className: undefined }} // we will handle the active class ourselves
            className={classNames("nav-link", feed === "global" && "active")}
          >
            Global Feed
          </Link>
        </li>
      </ul>
    </div>
  );
}
