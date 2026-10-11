import type { FetchSchemaRoutes } from "@better-fetch/fetch";

import {
  getArticlesFeedQuerySchema,
  getArticlesQuerySchema,
  multipleArticlesResponseSchema,
  singleArticleResponseSchema,
  slugParamSchema,
  updateArticleRequestSchema,
} from "#app/api/articles/articles.schemas.ts";

export const articlesApi = {
  "@delete/articles/:slug": { params: slugParamSchema },
  "@get/articles/:slug": { params: slugParamSchema, output: singleArticleResponseSchema },
  "@get/articles": { query: getArticlesQuerySchema, output: multipleArticlesResponseSchema },
  "@get/articles/feed": {
    query: getArticlesFeedQuerySchema,
    output: multipleArticlesResponseSchema,
  },
  "@post/articles/:slug/favorite": { params: slugParamSchema, output: singleArticleResponseSchema },
  "@delete/articles/:slug/favorite": {
    params: slugParamSchema,
    output: singleArticleResponseSchema,
  },
  "@post/articles": { input: updateArticleRequestSchema, output: singleArticleResponseSchema },
  "@put/articles/:slug": {
    params: slugParamSchema,
    input: updateArticleRequestSchema,
    output: singleArticleResponseSchema,
  },
} satisfies FetchSchemaRoutes;
