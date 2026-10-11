import * as z from "zod";

import { profileSchema } from "#app/api/profile/profile.schemas.ts";

export const slugParamSchema = z.object({ slug: z.string() });
export const idParamSchema = z.object({ id: z.number() });

export const commentSchema = z.object({
  id: z.number(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: profileSchema,
});

export const multipleCommentsResponseSchema = z.object({
  comments: z.array(commentSchema),
});

export const singleCommentResponseSchema = z.object({
  comment: commentSchema,
});

export const newCommentRequestSchema = z.object({
  comment: z.object({
    body: z.string(),
  }),
});
