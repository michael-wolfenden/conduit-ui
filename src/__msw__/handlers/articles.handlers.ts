import * as z from "zod";

import { dbArticles } from "#app/__msw__/db.ts";
import type { DbArticle, DbUser } from "#app/__msw__/db.ts";
import {
  conflict,
  forbidden,
  getAuthenticatedUser,
  getAuthenticatedUserOrThrow,
  http,
  HttpResponse,
  notFound,
  unprocessableContent,
} from "#app/__msw__/msw.utils.ts";

export const articleHandlers = [
  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/index.get.ts
  http("@get/articles", ({ request }) => {
    const authUser = getAuthenticatedUser(request);

    const { searchParams } = new URL(request.url);
    const offset = Number(searchParams.get("offset") ?? 0);
    const limit = Number(searchParams.get("limit") ?? 10);
    const tag = searchParams.get("tag");
    const author = searchParams.get("author");
    const favorited = searchParams.get("favorited");

    let articles = [...dbArticles];

    if (tag) {
      articles = articles.filter((article) =>
        article.tagList.some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase()),
      );
    }

    if (author) {
      articles = articles.filter(
        (article) => article.author.username.toLowerCase() === author.toLowerCase(),
      );
    }

    if (favorited) {
      articles = articles.filter((article) => {
        return article.favouritedBy.some(
          (u) => u.username.toLowerCase() === favorited.toLowerCase(),
        );
      });
    }

    return HttpResponse.json(mapArticles(articles, authUser, offset, limit));
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/feed.get.ts
  http("@get/articles/feed", ({ request }) => {
    const authUser = getAuthenticatedUserOrThrow(request);

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? 10);
    const offset = Number(searchParams.get("offset") ?? 0);

    const articles = dbArticles.filter((a) => a.author.followedBy.includes(authUser));

    return HttpResponse.json(mapArticles(articles, authUser, offset, limit));
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/index.get.ts
  http("@get/articles/:slug", ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUser(request);
    const article = getArticleOrThrow(slug);

    return HttpResponse.json({ article: mapArticle(article, authUser) });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/favorite/index.post.ts
  http("@post/articles/:slug/favorite", ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const article = getArticleOrThrow(slug);

    if (!article.favouritedBy.includes(authUser)) article.favouritedBy.push(authUser);

    return HttpResponse.json({ article: mapArticle(article, authUser) });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/favorite/index.delete.ts
  http("@delete/articles/:slug/favorite", ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const article = getArticleOrThrow(slug);

    if (article.favouritedBy.includes(authUser)) {
      article.favouritedBy = article.favouritedBy.filter((u) => u !== authUser);
    }

    return HttpResponse.json({ article: mapArticle(article, authUser) });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/index.delete.ts
  http("@delete/articles/:slug", ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const article = getArticleOrThrow(slug);

    if (article.author !== authUser) throw forbidden();

    dbArticles.splice(dbArticles.indexOf(article), 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/index.post.ts
  http("@post/articles", async ({ request }) => {
    const authUser = getAuthenticatedUserOrThrow(request);

    const {
      article: { body, description, tagList, title },
    } = await request.json();

    if (!title) throw unprocessableContent({ title: ["can't be blank"] });
    if (!description) throw unprocessableContent({ description: ["can't be blank"] });
    if (!body) throw unprocessableContent({ body: ["can't be blank"] });

    const now = new Date().toISOString();
    const slug = z.string().slugify().parse(title).toLowerCase();

    const articleBySlug = dbArticles.find((a) => a.slug.toLowerCase() === slug);
    if (articleBySlug) throw conflict({ slug: ["has already been taken"] });

    const nextArticleId = Math.max(...dbArticles.map((article) => article.id)) + 1;

    const article: DbArticle = {
      id: nextArticleId,
      slug,
      title,
      description,
      body,
      tagList,
      author: authUser,
      createdAt: now,
      updatedAt: now,
      favouritedBy: [],
      comments: [],
    };

    dbArticles.push(article);

    return HttpResponse.json({ article: mapArticle(article, authUser) });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/index.put.ts
  http("@put/articles/:slug", async ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const article = getArticleOrThrow(slug);

    if (article.author !== authUser) throw forbidden();

    const {
      article: { body, description, tagList, title },
    } = await request.json();

    const now = new Date().toISOString();
    const newSlug = z.string().slugify().parse(title);

    const changedSlug = article.slug.toLowerCase() !== newSlug.toLowerCase();
    if (changedSlug) {
      const articleBySlug = dbArticles.find((a) => a.slug.toLowerCase() === newSlug);
      if (articleBySlug) throw conflict({ slug: ["has already been taken"] });
    }

    article.slug = newSlug;
    article.title = title;
    article.body = body;
    article.description = description;
    article.tagList = tagList;
    article.updatedAt = now;

    return HttpResponse.json({ article: mapArticle(article, authUser) });
  }),
];

function getArticleOrThrow(slug: string) {
  const article = dbArticles.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
  if (article === undefined) throw notFound();

  return article;
}

function mapArticles(
  articles: DbArticle[],
  authUser: DbUser | undefined,
  offset: number,
  limit: number,
) {
  return {
    articles: articles
      .map((article) => mapArticle(article, authUser))
      .toSorted(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
      .slice(offset, offset + limit),
    articlesCount: articles.length,
  };
}

function mapArticle(article: DbArticle, authUser: DbUser | undefined) {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited: authUser === undefined ? false : article.favouritedBy.includes(authUser),
    favoritesCount: article.favouritedBy.length,
    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following: authUser === undefined ? false : article.author.followedBy.includes(authUser),
    },
  };
}
