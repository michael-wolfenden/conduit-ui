import * as z from "zod";

export const usernameParamSchema = z.object({ username: z.string().trim() });

export const profileSchema = z.object({
  username: z.string().trim(),
  following: z.boolean(),
  bio: z.string().trim().nullable(),
  image: z.string().trim().nullable(),
});

export const profileResponseSchema = z.object({
  profile: profileSchema,
});
