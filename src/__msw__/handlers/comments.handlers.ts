import { dbArticles } from "#app/__msw__/db.ts";
import type { DbComment, DbUser } from "#app/__msw__/db.ts";
import {
  forbidden,
  getAuthenticatedUser,
  getAuthenticatedUserOrThrow,
  http,
  HttpResponse,
  notFound,
  unprocessableContent,
} from "#app/__msw__/msw.utils.ts";

export const commentsHandlers = [
  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/comments/index.get.ts
  http("@get/articles/:slug/comments", ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUser(request);
    const article = getArticleOrThrow(slug);

    return HttpResponse.json({ comments: mapComments(article.comments, authUser) });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/comments/index.post.ts
  http("@post/articles/:slug/comments", async ({ request, params: { slug } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const article = getArticleOrThrow(slug);

    const {
      comment: { body },
    } = await request.json();

    if (!body) throw unprocessableContent({ body: ["can't be blank"] });

    const nextCommentId =
      Math.max(...dbArticles.flatMap((article) => article.comments.map((comment) => comment.id))) +
      1;

    const now = new Date().toISOString();

    const newComment: DbComment = {
      id: nextCommentId,
      body,
      author: authUser,
      createdAt: now,
      updatedAt: now,
    };

    article.comments.push(newComment);

    return HttpResponse.json({ comment: mapComment(newComment, authUser) });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/articles/%5Bslug%5D/comments/%5Bid%5D.delete.ts
  http("@delete/articles/:slug/comments/:id", ({ request, params: { slug, id } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const article = getArticleOrThrow(slug);

    const comment = article.comments.find((comment) => comment.id === Number(id));
    if (comment === undefined) throw notFound();
    if (comment.author !== authUser) throw forbidden();

    article.comments = article.comments.filter((comment) => comment.id !== Number(id));

    return HttpResponse.json(null, { status: 204 });
  }),
];

function getArticleOrThrow(slug: string) {
  const article = dbArticles.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
  if (article === undefined) throw notFound();

  return article;
}

function mapComments(comments: DbComment[], authUser: DbUser | undefined) {
  return comments
    .map((comment) => mapComment(comment, authUser))
    .toSorted((first, second) => second.createdAt.localeCompare(first.createdAt));
}

function mapComment(comment: DbComment, authUser: DbUser | undefined) {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      username: comment.author.username,
      bio: comment.author.bio,
      image: comment.author.image,
      following: authUser === undefined ? false : comment.author.followedBy.includes(authUser),
    },
  };
}
