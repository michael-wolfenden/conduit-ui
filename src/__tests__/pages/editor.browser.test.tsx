import { conflict, http, HttpResponse } from "#app/__msw__/msw.utils.ts";
import { createArticle, createUser } from "#app/__tests__/test.builders.ts";
import {
  expect,
  login,
  logout,
  page,
  renderRoute,
  test,
  userEvent,
  vi,
} from "#app/__tests__/test.utils.tsx";
import type { Article, UpdateArticleRequest } from "#app/api/articles/articles.types.ts";

test("redirects unauthenticated user", async () => {
  logout();

  const { router } = await renderPage();
  await vi.waitUntil(() => router.history.location.pathname === "/login");
});

test("displays server side errors", async ({ worker }) => {
  login();

  worker.use(
    http("@post/articles", () => {
      throw conflict({ slug: ["has already been taken"] });
    }),
  );

  const { publish } = await renderPage();

  await publish({
    title: "already_taken_title",
    description: "article_description",
    body: "article_body",
    tagList: ["article_tag_a", "article_tag_b"],
  });

  await expect.element(page.getByText("slug has already been taken")).toBeVisible();
});

test("displays blank form when creating a new article", async () => {
  login();

  const { titleInput, descriptionInput, bodyInput, tagListInput } = await renderPage();

  await expect.element(titleInput).toHaveValue("");
  await expect.element(descriptionInput).toHaveValue("");
  await expect.element(bodyInput).toHaveValue("");
  await expect.element(tagListInput).toHaveValue("");
});

test("successfully creates article and redirects", async ({ worker }) => {
  login();

  let submittedRequest: UpdateArticleRequest | null = null;
  let newArticle: Article;

  worker.use(
    // data for the article page that we are redirected to after successful edit
    http("@get/articles/:slug", () => HttpResponse.json({ article: newArticle })),
    http("@get/articles/:slug/comments", () => HttpResponse.json({ comments: [] })),

    http("@post/articles", async ({ request }) => {
      submittedRequest = await request.json();
      newArticle = createArticle({ slug: "new_article_slug", ...submittedRequest.article });
      return HttpResponse.json({ article: newArticle });
    }),
  );

  const { publish, router } = await renderPage();

  await publish({
    title: "article_title",
    description: "article_description",
    body: "article_body",
    tagList: ["article_tag_a", "article_tag_b"],
  });

  await vi.waitUntil(() => router.history.location.pathname === "/article/new_article_slug");
  await vi.waitFor(async () =>
    expect.element(page.getByText("Loading comments...")).not.toBeInTheDocument(),
  );

  expect(submittedRequest).toMatchInlineSnapshot(`
    {
      "article": {
        "body": "article_body",
        "description": "article_description",
        "tagList": [
          "article_tag_a",
          "article_tag_b",
        ],
        "title": "article_title",
      },
    }
  `);
});

test("when editing an existing article, redirects user if not author of article", async ({
  worker,
}) => {
  login(createUser({ username: "authenticated_user" }));

  worker.use(
    http("@get/articles/:slug", () =>
      HttpResponse.json({
        article: createArticle({
          slug: "existing_article_slug",
          author: { username: "different_user" },
        }),
      }),
    ),
  );

  const { router } = await renderPage("existing_article_slug");
  await vi.waitUntil(() => router.history.location.pathname === "/");
});

test("successfully updates the article and redirects", async ({ worker }) => {
  const authenticatedUser = createUser({ username: "authenticated_user" });
  login(authenticatedUser);

  const existingArticle = createArticle({
    slug: "article_slug",
    title: "article_title",
    description: "article_description",
    body: "article_body",
    tagList: ["article_tag_a", "article_tag_b"],
    author: authenticatedUser,
  });

  let submittedRequest: UpdateArticleRequest | null = null;
  let createdArticle: Article;

  worker.use(
    // data for the article page that we are redirected to after successful edit
    http("@get/articles/:slug/comments", () => HttpResponse.json({ comments: [] })),

    http("@get/articles/:slug", ({ params }) => {
      return HttpResponse.json({
        article: params.slug === "updated_article_slug" ? createdArticle : existingArticle,
      });
    }),

    http("@put/articles/:slug", async ({ request }) => {
      submittedRequest = await request.json();
      createdArticle = createArticle({ slug: "updated_article_slug", ...submittedRequest.article });

      return HttpResponse.json({ article: createdArticle });
    }),
  );

  const { publish, router, titleInput, descriptionInput, bodyInput, tagListInput } =
    await renderPage("article_slug");

  await expect.element(titleInput).toHaveValue("article_title");
  await expect.element(descriptionInput).toHaveValue("article_description");
  await expect.element(bodyInput).toHaveValue("article_body");
  await expect.element(tagListInput).toHaveValue("");
  await expect.element(page.getByText("article_tag_a")).toBeVisible();
  await expect.element(page.getByText("article_tag_b")).toBeVisible();

  await publish({
    title: "updated_article_title",
    description: "updated_article_description",
    body: "updated_article_body",
    tagList: ["updated_article_tag_a", "article_tag_b"],
  });

  await vi.waitUntil(() => router.history.location.pathname === "/article/updated_article_slug"); //. wait for comments to be returned
  await vi.waitFor(async () =>
    expect.element(page.getByText("Loading comments...")).not.toBeInTheDocument(),
  );

  expect(submittedRequest).toMatchInlineSnapshot(`
    {
      "article": {
        "body": "updated_article_body",
        "description": "updated_article_description",
        "tagList": [
          "updated_article_tag_a",
          "article_tag_b",
        ],
        "title": "updated_article_title",
      },
    }
  `);
});

async function renderPage(slug?: string) {
  const { router } = slug
    ? await renderRoute({ to: "/editor/$slug", params: { slug } })
    : await renderRoute({ to: "/editor" });

  const titleInput = page.getByPlaceholder("Article Title");
  const descriptionInput = page.getByPlaceholder("What's this article about?");
  const bodyInput = page.getByPlaceholder("Write your article (in markdown)");
  const tagListInput = page.getByPlaceholder("Enter tags");
  const publishButton = page.getByRole("button", { name: "Publish Article" });

  const publish = async ({
    title,
    description,
    body,
    tagList,
  }: {
    title: string;
    description: string;
    body: string;
    tagList: string[];
  }) => {
    await titleInput.fill(title);
    await descriptionInput.fill(description);
    await bodyInput.fill(body);

    // remove all existing tags
    const removeTagButtons = page.getByTestId("tag-remove").all();
    for (const removeTagButton of removeTagButtons) {
      await removeTagButton.click();
    }

    for (const tag of tagList) {
      await tagListInput.fill(tag);
      await userEvent.keyboard("[Enter]");
    }

    await publishButton.click();
  };

  return { titleInput, descriptionInput, bodyInput, tagListInput, publishButton, router, publish };
}
