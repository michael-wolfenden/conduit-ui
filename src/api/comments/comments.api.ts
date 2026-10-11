import type { FetchSchemaRoutes } from "@better-fetch/fetch";

import {
  idParamSchema,
  multipleCommentsResponseSchema,
  newCommentRequestSchema,
  singleCommentResponseSchema,
  slugParamSchema,
} from "#app/api/comments/comments.schemas.ts";

export const commentsApi = {
  "@delete/articles/:slug/comments/:id": { params: slugParamSchema.extend(idParamSchema.shape) },
  "@get/articles/:slug/comments": {
    params: slugParamSchema,
    output: multipleCommentsResponseSchema,
  },
  "@post/articles/:slug/comments": {
    params: slugParamSchema,
    input: newCommentRequestSchema,
    output: singleCommentResponseSchema,
  },
} satisfies FetchSchemaRoutes;
