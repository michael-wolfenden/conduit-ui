import * as z from "zod";

export const userResponseSchema = z.object({
  user: z.object({
    bio: z.string().trim().nullable(),
    email: z.string().trim(),
    image: z.string().trim().nullable(),
    token: z.string().trim(),
    username: z.string().trim(),
  }),
});

export const loginUserRequestSchema = z.object({
  user: z.object({
    email: z.string().trim(),
    password: z.string().trim(),
  }),
});

export const newUserRequestSchema = z.object({
  user: z.object({
    username: z.string().trim(),
    email: z.string().trim(),
    password: z.string().trim(),
  }),
});

export const updateUserRequestSchema = z.object({
  user: z.object({
    username: z.string().trim().optional(),
    email: z.string().trim().optional(),
    password: z.string().trim().optional(),
    bio: z.string().trim().nullish(),
    image: z.string().trim().nullish(),
  }),
});
