import type { FetchSchemaRoutes } from "@better-fetch/fetch";

import { tagsResponseSchema } from "#app/api/tags/tags.schemas.ts";

export const tagsApi = {
  "@get/tags": { output: tagsResponseSchema },
} satisfies FetchSchemaRoutes;
