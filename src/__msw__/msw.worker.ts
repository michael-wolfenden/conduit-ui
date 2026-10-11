import { delay, http } from "msw";
import { setupWorker } from "msw/browser";

import { articleHandlers } from "#app/__msw__/handlers/articles.handlers.ts";
import { commentsHandlers } from "#app/__msw__/handlers/comments.handlers.ts";
import { profileHandlers } from "#app/__msw__/handlers/profile.handlers.ts";
import { tagsHandlers } from "#app/__msw__/handlers/tags.handlers.ts";
import { userHandlers } from "#app/__msw__/handlers/user.handlers.ts";
import { env } from "#app/lib/utils/env.ts";

export const worker = setupWorker(
  ...globalDelayHander(),
  ...userHandlers,
  ...profileHandlers,
  ...tagsHandlers,
  ...articleHandlers,
  ...commentsHandlers,
);

function globalDelayHander() {
  // add a global delay to all requests, but not during tests
  if (import.meta.env.MODE === "test") return [];

  return [
    http.all(`${env.API_BASE_URL}/*`, async () => {
      await delay();
    }),
  ];
}
