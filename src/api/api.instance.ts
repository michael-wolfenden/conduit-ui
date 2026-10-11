import { createFetch, createSchema } from "@better-fetch/fetch";
import { notFound } from "@tanstack/react-router";

import { articlesApi } from "#app/api/articles/articles.api.ts";
import { commentsApi } from "#app/api/comments/comments.api.ts";
import { profileApi } from "#app/api/profile/profile.api.ts";
import { tagsApi } from "#app/api/tags/tags.api.ts";
import { userApi } from "#app/api/user/user.api.ts";
import { authStore } from "#app/lib/auth/auth.store.ts";
import { env } from "#app/lib/utils/env.ts";

export const apiSchema = createSchema(
  {
    ...articlesApi,
    ...tagsApi,
    ...profileApi,
    ...userApi,
    ...commentsApi,
  },
  {
    strict: true,
  },
);

export const api = createFetch({
  auth: {
    prefix: "Token",
    type: "Custom",
    value: () => authStore().token,
  },
  baseURL: env.API_BASE_URL,
  onError({ response }) {
    if (response.status === 404) throw notFound();
  },
  schema: apiSchema,
  throw: true,
});
