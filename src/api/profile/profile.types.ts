import type * as z from "zod";

import type { profileSchema } from "#app/api/profile/profile.schemas.ts";

export type Profile = z.infer<typeof profileSchema>;
