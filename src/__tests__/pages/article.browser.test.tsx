import type { SetupWorker } from "msw/browser";

import { http, HttpResponse, unprocessableContent } from "#app/__msw__/msw.utils.ts";
import { createArticle, createComment, createUser } from "#app/__tests__/test.builders.ts";
import {
  describe,
  expect,
  login,
  logout,
  page,
  renderRoute,
  test,
  vi,
} from "#app/__tests__/test.utils.tsx";
import type { Article } from "#app/api/articles/articles.types.ts";
import type { Comment, NewCommentRequest } from "#app/api/comments/comments.types.ts";

test("displays article heading", async ({ worker }) => {
  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    title: "Introduction to Machine Learning for Developers",
  });

  await renderPage(worker, { article });

  await expect
    .element(
      page.getByRole("heading", {
        level: 1,
        name: "Introduction to Machine Learning for Developers",
      }),
    )
    .toBeVisible();
});

test("displays article body rendered from markdown", async ({ worker }) => {
  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    body: "## Getting started with ML concepts and practical applications for software developers",
  });

  await renderPage(worker, { article });

  await expect
    .element(
      page.getByRole("heading", {
        level: 2,
        name: "Getting started with ML concepts and practical applications for software developers",
      }),
    )
    .toBeVisible();
});

test("displays article tags", async ({ worker }) => {
  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    tagList: ["ai", "datascience", "machinelearning", "python"],
  });

  await renderPage(worker, { article });

  const tagListItems = page.getByRole("listitem");
  for (const tag of ["ai", "datascience", "machinelearning", "python"]) {
    await expect.element(tagListItems.getByText(tag)).toBeVisible();
  }
});

test("displays article metadata", async ({ worker }) => {
  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    createdAt: "2024-05-12T10:00:00.000Z",
    author: {
      username: "sarahchen",
      image: "https://i.pravatar.cc/100?img=36",
    },
  });

  await renderPage(worker, { article });

  // The following are repeated in the header and footer of the article,
  // so just check the meta data rendered in the article header
  const articleHeader = page.getByTestId(`article-header`);

  // created at
  await expect.element(articleHeader.getByText("May 12, 2024")).toBeVisible();

  // avatar link and image
  await expect
    .element(articleHeader.getByRole("link", { name: "sarahchen", exact: true }))
    .toBeVisible();

  await expect
    .element(articleHeader.getByRole("img"))
    .toHaveAttribute("src", "https://i.pravatar.cc/100?img=36");
});

test("cannot delete or edit own article when unauthenticated", async ({ worker }) => {
  logout();

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    author: {
      username: "authenticated_user",
    },
  });

  const { deleteArticleButton, editArticleLink } = await renderPage(worker, { article });

  await expect.element(deleteArticleButton).not.toBeInTheDocument();
  await expect.element(editArticleLink).not.toBeInTheDocument();
});

test("shows follow and favorite when unauthenticated", async ({ worker }) => {
  logout();

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    favorited: false,
    favoritesCount: 99,
  });

  const { followButton, favouriteButton } = await renderPage(worker, { article });

  await expect.element(followButton).toBeInTheDocument();
  await expect.element(favouriteButton).toBeInTheDocument();
  await expect.element(favouriteButton).toHaveTextContent("Favorite Article (99)");
});

test("cannot delete or edit own article when unauthenticated", async ({ worker }) => {
  logout();

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    author: {
      username: "authenticated_user",
    },
  });

  const { deleteArticleButton, editArticleLink } = await renderPage(worker, { article });

  await expect.element(deleteArticleButton).not.toBeInTheDocument();
  await expect.element(editArticleLink).not.toBeInTheDocument();
});

test("cannot delete or edit another users article when authenticated", async ({ worker }) => {
  login(createUser({ username: "authenticated_user" }));

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    author: {
      username: "another_user",
    },
  });

  const { deleteArticleButton, editArticleLink } = await renderPage(worker, { article });

  await expect.element(deleteArticleButton).not.toBeInTheDocument();
  await expect.element(editArticleLink).not.toBeInTheDocument();
});

test("shows follow and favorite when viewing another users article when authenticated", async ({
  worker,
}) => {
  login(createUser({ username: "authenticated_user" }));

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    author: {
      username: "another_user",
    },
    favorited: true,
    favoritesCount: 99,
  });

  const { followButton, favouriteButton } = await renderPage(worker, { article });

  await expect.element(followButton).toBeInTheDocument();
  await expect.element(favouriteButton).toBeInTheDocument();
  await expect.element(favouriteButton).toHaveTextContent("Unfavorite Article (99)");
});

test("can delete and edit own article when authenticated", async ({ worker }) => {
  login(createUser({ username: "authenticated_user" }));

  let submittedSlug: string | null = null;

  worker.use(
    http("@delete/articles/:slug", ({ params }) => {
      submittedSlug = params.slug;
      return HttpResponse.json(null, { status: 204 });
    }),
  );

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    author: {
      username: "authenticated_user",
    },
  });

  const { router, deleteArticleButton, editArticleLink } = await renderPage(worker, { article });

  await expect.element(editArticleLink).toBeVisible();
  await expect.element(deleteArticleButton).toBeVisible();

  await deleteArticleButton.click();
  await vi.waitUntil(() => router.history.location.pathname === "/");

  expect(submittedSlug).toBe("introduction-to-machine-learning-for-developers");
});

test("hides follow and favorite when viewing own article when authenticated", async ({
  worker,
}) => {
  login(createUser({ username: "authenticated_user" }));

  const article = createArticle({
    slug: "introduction-to-machine-learning-for-developers",
    author: {
      username: "authenticated_user",
    },
  });

  const { followButton, favouriteButton } = await renderPage(worker, { article });

  await expect.element(followButton).not.toBeInTheDocument();
  await expect.element(favouriteButton).not.toBeInTheDocument();
});

describe("comments", () => {
  test("displays comments", async ({ worker }) => {
    const comments = [
      createComment({
        id: 1,
        body: "Great article! I've been struggling with JavaScript concepts and this really helps clarify things.",
        author: {
          username: "janesmith",
        },
        createdAt: "2024-08-15T09:00:00.000Z",
      }),
    ];

    await renderPage(worker, { comments });

    const comment = page.getByTestId("comment-1");

    // comment
    await expect
      .element(
        comment.getByText(
          "Great article! I've been struggling with JavaScript concepts and this really helps clarify things.",
        ),
      )
      .toBeVisible();

    // created at
    await expect.element(comment.getByText("August 15, 2024")).toBeVisible();

    // avatar link
    await expect
      .element(comment.getByRole("link", { name: "janesmith's profile picture", exact: true }))
      .toBeVisible();

    // username link
    await expect
      .element(comment.getByRole("link", { name: "janesmith", exact: true }))
      .toBeVisible();
  });

  test("cannot post a comment when unauthenticated", async () => {
    logout();

    await expect
      .element(page.getByRole("button", { name: /post comment/i }))
      .not.toBeInTheDocument();
  });

  test("display server side errors", async ({ worker }) => {
    login();

    worker.use(
      http("@post/articles/:slug/comments", () => {
        throw unprocessableContent({ body: ["can't be blank"] });
      }),
    );

    await renderPage(worker);

    await page.getByRole("button", { name: /post comment/i }).click();
    await expect.element(page.getByText("body can't be blank")).toBeVisible();
  });

  test("can post a comment when authenticated", async ({ worker }) => {
    login();

    let submittedRequest: NewCommentRequest | null = null;
    let createdComment: Comment;

    worker.use(
      http("@post/articles/:slug/comments", async ({ request }) => {
        submittedRequest = await request.json();
        createdComment = createComment({ id: 999, ...submittedRequest });
        return HttpResponse.json({ comment: createdComment });
      }),
    );

    await renderPage(worker);

    const postCommentButton = page.getByRole("button", { name: /post comment/i });
    const bodyInput = page.getByPlaceholder("Write a comment...");

    await bodyInput.fill("submitted_body");
    await postCommentButton.click();

    // wait till it becomes enabled again once the submit finishes
    await expect.element(postCommentButton).toBeEnabled();

    expect(submittedRequest).toMatchInlineSnapshot(`
      {
        "comment": {
          "body": "submitted_body",
        },
      }
    `);
  });

  test("cannot delete own comment when unauthenticated", async ({ worker }) => {
    logout();

    const comments = [
      createComment({
        id: 1,
        author: { username: "authenticated_user" },
      }),
    ];

    await renderPage(worker, { comments });

    await expect
      .element(page.getByTestId("comment-1").getByTestId("delete-button"))
      .not.toBeInTheDocument();
  });

  test("cannot delete another users comment when authenticated", async ({ worker }) => {
    login(createUser({ username: "authenticated_user" }));

    const comments = [
      createComment({
        id: 1,
        author: { username: "another_user" },
      }),
    ];

    await renderPage(worker, { comments });

    await expect
      .element(page.getByTestId("comment-1").getByTestId("delete-button"))
      .not.toBeInTheDocument();
  });

  test("can delete own comment when authenticated", async ({ worker }) => {
    login(createUser({ username: "authenticated_user" }));

    let submittedCommentId: number | null = null;

    worker.use(
      http("@delete/articles/:slug/comments/:id", ({ params }) => {
        submittedCommentId = Number(params.id);
        return HttpResponse.json(null, { status: 204 });
      }),
    );

    const comments = [
      createComment({
        id: 1,
        author: { username: "authenticated_user" },
      }),
    ];

    await renderPage(worker, { comments });

    const deleteButton = page.getByTestId("comment-1").getByTestId("delete-button");
    await expect.element(deleteButton).toBeVisible();

    await deleteButton.click();

    // wait till it becomes visible again once the submit finishes
    await expect.element(deleteButton).toBeVisible();

    expect(submittedCommentId).toBe(1);
  });
});

async function renderPage(
  worker: SetupWorker,
  {
    article = createArticle(),
    comments = [createComment()],
  }: { article?: Article; comments?: Comment[] } = {},
) {
  worker.use(
    http("@get/articles/:slug", () => HttpResponse.json({ article })),
    http("@get/articles/:slug/comments", () => HttpResponse.json({ comments })),
  );

  const { router } = await renderRoute({ to: "/article/$slug", params: { slug: article.slug } });

  //. wait for comments to be returned
  await vi.waitFor(async () =>
    expect.element(page.getByText("Loading comments...")).not.toBeInTheDocument(),
  );

  return {
    router,
    // the delete and edit article button / link are repeated in the header and footer of the article,
    // so just return the ones in the article header
    deleteArticleButton: page
      .getByTestId(`article-header`)
      .getByRole("button", { name: /delete article/i }),

    editArticleLink: page
      .getByTestId(`article-header`)
      .getByRole("link", { name: /edit article/i }),

    favouriteButton: page.getByTestId(`article-header`).getByTestId("favourite-button"),
    followButton: page.getByTestId(`article-header`).getByTestId("follow-button"),
  };
}
