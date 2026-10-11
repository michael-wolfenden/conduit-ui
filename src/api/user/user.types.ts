import type * as z from "zod";

import type {
  loginUserRequestSchema,
  newUserRequestSchema,
  updateUserRequestSchema,
  userResponseSchema,
} from "#app/api/user/user.schemas.ts";

export type User = z.infer<typeof userResponseSchema.shape.user>;
export type LoginUserRequest = z.infer<typeof loginUserRequestSchema>;
export type NewUserRequest = z.infer<typeof newUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
