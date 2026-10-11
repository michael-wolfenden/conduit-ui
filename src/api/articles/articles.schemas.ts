import * as z from "zod";

import { profileSchema } from "#app/api/profile/profile.schemas.ts";

export const slugParamSchema = z.object({ slug: z.string().trim() });

export const articleSchema = z.object({
  slug: z.string().trim(),
  title: z.string().trim(),
  description: z.string().trim(),
  body: z.string().trim(),
  tagList: z.array(z.string().trim()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  favorited: z.boolean(),
  favoritesCount: z.number(),
  author: profileSchema,
});

export const articleSummarySchema = articleSchema.omit({ body: true });

export const singleArticleResponseSchema = z.object({
  article: articleSchema,
});

export const multipleArticlesResponseSchema = z.object({
  articles: z.array(articleSummarySchema),
  articlesCount: z.number(),
});

export const getArticlesFeedQuerySchema = z.object({
  offset: z.number(),
  limit: z.number(),
});

export const getArticlesQuerySchema = z.object({
  offset: z.number(),
  limit: z.number(),
  tag: z.string().trim().optional(),
  author: z.string().trim().optional(),
  favorited: z.string().trim().optional(),
});

export const updateArticleRequestSchema = z.object({
  article: z.object({
    title: z.string(),
    description: z.string(),
    body: z.string(),
    tagList: z.string().array(),
  }),
});

export const feedSchema = z.enum(["global", "following"]);

export const articlesFilterSchema = getArticlesQuerySchema.extend({ feed: feedSchema });
