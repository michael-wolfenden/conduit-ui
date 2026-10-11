import type * as z from "zod";

import type { commentSchema, newCommentRequestSchema } from "#app/api/comments/comments.schemas.ts";

export type Comment = z.infer<typeof commentSchema>;
export type NewCommentRequest = z.infer<typeof newCommentRequestSchema>;
