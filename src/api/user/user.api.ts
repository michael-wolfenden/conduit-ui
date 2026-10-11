import type { FetchSchemaRoutes } from "@better-fetch/fetch";

import {
  loginUserRequestSchema,
  newUserRequestSchema,
  updateUserRequestSchema,
  userResponseSchema,
} from "#app/api/user/user.schemas.ts";

export const userApi = {
  "@get/user": { output: userResponseSchema },
  "@post/users/login": { input: loginUserRequestSchema, output: userResponseSchema },
  "@post/users": { input: newUserRequestSchema, output: userResponseSchema },
  "@put/user": { input: updateUserRequestSchema, output: userResponseSchema },
} satisfies FetchSchemaRoutes;
