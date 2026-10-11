import type * as z from "zod";

import type {
  articleSchema,
  articlesFilterSchema,
  articleSummarySchema,
  multipleArticlesResponseSchema,
  updateArticleRequestSchema,
} from "#app/api/articles/articles.schemas.ts";

export type Article = z.infer<typeof articleSchema>;
export type Articles = z.infer<typeof multipleArticlesResponseSchema>;
export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export type ArticlesFilter = z.infer<typeof articlesFilterSchema>;
export type UpdateArticleRequest = z.infer<typeof updateArticleRequestSchema>;
