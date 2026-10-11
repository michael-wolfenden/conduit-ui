import { HttpResponse } from "msw";

import { http } from "#app/__msw__/msw.utils.ts";
import { createArticle } from "#app/__tests__/test.builders.ts";
import { logout, test, renderRoute, expect, page, login, vi } from "#app/__tests__/test.utils.tsx";

const getArticle = (index: number) => page.getByTestId(`slug-article-${index}`);

test("displays no articles available message when tag has no articles", async ({ worker }) => {
  worker.use(http("@get/articles", () => HttpResponse.json({ articles: [], articlesCount: 0 })));

  await renderRoute({ to: "/tag/$tag", params: { tag: "javascript" } });

  await expect.element(page.getByText("No articles are here... yet.")).toBeVisible();
});

test('hides "your feed" link when unauthorized', async () => {
  logout();

  await renderRoute({ to: "/tag/$tag", params: { tag: "javascript" } });

  await expect.element(page.getByRole("link", { name: /your feed/i })).not.toBeInTheDocument();
});

test('display "your feed" link when authenticated', async () => {
  login();

  await renderRoute({ to: "/tag/$tag", params: { tag: "javascript" } });

  await expect.element(page.getByRole("link", { name: /your feed/i })).toBeInTheDocument();
});

test("supports filtering by tag", async ({ worker }) => {
  const articles = [
    createArticle({ slug: "article-1", tagList: ["react", "hooks"] }),
    createArticle({ slug: "article-2", tagList: ["hooks", "python"] }),
    createArticle({ slug: "article-3", tagList: ["python", "react"] }),
  ];

  const tags = [...new Set(articles.flatMap((a) => a.tagList))];

  worker.use(
    http("@get/articles", ({ request }) => {
      const { searchParams } = new URL(request.url);
      const tag = searchParams.get("tag");

      return HttpResponse.json({
        articles: articles.filter((article) =>
          article.tagList.some((articleTag) => tag === null || articleTag === tag),
        ),
        articlesCount: articles.length,
      });
    }),

    http("@get/tags", () => HttpResponse.json({ tags })),
  );

  await renderRoute({ to: "/tag/$tag", params: { tag: "python" } });

  //. wait for tags to be returned
  await vi.waitFor(async () =>
    expect.element(page.getByText("Loading tags...")).not.toBeInTheDocument(),
  );

  // python tab should be visible and should have articles 2 and 3
  await expect.element(page.getByText("# python")).toBeInTheDocument();

  await expect.element(getArticle(1)).not.toBeInTheDocument();
  await expect.element(getArticle(2)).toBeVisible();
  await expect.element(getArticle(3)).toBeVisible();

  // click on react tag, should have articles 1 and 3
  await page.getByRole("link", { name: "react" }).click();

  await expect.element(getArticle(1)).toBeVisible();
  await expect.element(getArticle(2)).not.toBeInTheDocument();
  await expect.element(getArticle(3)).toBeVisible();
});
