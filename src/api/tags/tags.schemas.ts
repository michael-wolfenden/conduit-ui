import * as z from "zod";

export const tagsResponseSchema = z.object({ tags: z.array(z.string().trim()) });
