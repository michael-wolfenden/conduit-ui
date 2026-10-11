import { dbArticles } from "#app/__msw__/db.ts";
import { http, HttpResponse } from "#app/__msw__/msw.utils.ts";

export const tagsHandlers = [
  http("@get/tags", () => {
    const tags = [...new Set(dbArticles.flatMap((a) => a.tagList))].toSorted();

    return HttpResponse.json({ tags });
  }),
];
