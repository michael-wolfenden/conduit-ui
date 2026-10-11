import type { FetchSchemaRoutes } from "@better-fetch/fetch";

import { usernameParamSchema, profileResponseSchema } from "#app/api/profile/profile.schemas.ts";

export const profileApi = {
  "@get/profiles/:username": { params: usernameParamSchema, output: profileResponseSchema },
  "@post/profiles/:username/follow": { params: usernameParamSchema, output: profileResponseSchema },
  "@delete/profiles/:username/follow": {
    params: usernameParamSchema,
    output: profileResponseSchema,
  },
} satisfies FetchSchemaRoutes;
