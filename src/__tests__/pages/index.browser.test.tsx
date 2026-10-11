import { HttpResponse } from "msw";

import { http } from "#app/__msw__/msw.utils.ts";
import { createArticle } from "#app/__tests__/test.builders.ts";
import { logout, test, renderRoute, expect, page, login, vi } from "#app/__tests__/test.utils.tsx";

const getArticle = (index: number) => page.getByTestId(`slug-article-${index}`);
const getPageButton = (pageNumber: number) => page.getByTestId(`page-${pageNumber}`);

test("displays no articles available message when viewing global feed", async ({ worker }) => {
  worker.use(http("@get/articles", () => HttpResponse.json({ articles: [], articlesCount: 0 })));

  await renderRoute({ to: "/", search: { feed: "global" } });

  await expect.element(page.getByText("No articles are here... yet.")).toBeVisible();
});

test("displays no articles available message when viewing user's feed", async ({ worker }) => {
  login();

  worker.use(
    http("@get/articles/feed", () => HttpResponse.json({ articles: [], articlesCount: 0 })),
  );

  await renderRoute({ to: "/", search: { feed: "following" } });

  await expect
    .element(
      page.getByText(
        "Your feed is empty. Follow some users to see their articles here, or check out the Global Feed",
      ),
    )
    .toBeVisible();
});

test("redirects unauthenticated user when trying to access user's feed", async () => {
  logout();

  const { router } = await renderRoute({ to: "/", search: { feed: "following" } });
  await vi.waitUntil(() => router.history.location.pathname === "/login");
});

test('hides "your feed" link when unauthorized', async () => {
  logout();

  await renderRoute({ to: "/" });

  await expect.element(page.getByRole("link", { name: "Your Feed" })).not.toBeInTheDocument();
});

test("display a list of global articles", async ({ worker }) => {
  worker.use(
    http("@get/articles", () =>
      HttpResponse.json({
        articles: [
          createArticle({
            slug: "introduction-to-machine-learning-for-developers",
            title: "Introduction to Machine Learning for Developers",
            description:
              "Getting started with ML concepts and practical applications for software developers",
            tagList: ["ai", "datascience", "machinelearning", "python"],
            createdAt: "2024-05-12T10:00:00.000Z",
            updatedAt: "2024-05-12T10:00:00.000Z",
            favoritesCount: 0,
            author: {
              username: "sarahchen",
              image: "https://i.pravatar.cc/100?img=36",
            },
          }),
          createArticle({
            slug: "react-hooks-best-practices",
            title: "React Hooks: Best Practices and Common Pitfalls",
            description: "Essential patterns and anti-patterns when working with React Hooks",
            tagList: ["frontend", "hooks", "javascript", "react"],
            createdAt: "2024-04-05T12:20:00.000Z",
            favoritesCount: 2,
            author: {
              username: "janesmith",
              image: "https://i.pravatar.cc/100?img=9",
            },
          }),
          createArticle({
            slug: "building-scalable-apis-with-node-js",
            title: "Building Scalable APIs with Node.js",
            description:
              "Architectural patterns and best practices for creating robust backend services",
            tagList: ["api", "architecture", "backend", "nodejs"],
            createdAt: "2024-04-05T11:40:00.000Z",
            favoritesCount: 2,
            author: {
              username: "mikewilson",
              image: "https://i.pravatar.cc/100?img=70",
            },
          }),
          createArticle({
            slug: "how-to-learn-javascript-efficiently",
            title: "How to Learn JavaScript Efficiently",
            description:
              "A comprehensive guide to mastering JavaScript from beginner to advanced level",
            tagList: ["beginners", "javascript", "programming", "webdev"],
            createdAt: "2024-04-05T11:00:00.000Z",
            favoritesCount: 4,
            author: {
              username: "johndoe",
              image: "https://i.pravatar.cc/100?img=33",
            },
          }),
        ],
        articlesCount: 4,
      }),
    ),
  );

  await renderRoute({ to: "/" });

  await assertArticleExists({
    slug: "introduction-to-machine-learning-for-developers",
    title: "Introduction to Machine Learning for Developers",
    description:
      "Getting started with ML concepts and practical applications for software developers",
    tagList: ["ai", "datascience", "machinelearning", "python"],
    createdAt: "May 12, 2024",
    favoritesCount: 0,
    username: "sarahchen",
    image: "https://i.pravatar.cc/100?img=36",
  });

  await assertArticleExists({
    slug: "react-hooks-best-practices",
    title: "React Hooks: Best Practices and Common Pitfalls",
    description: "Essential patterns and anti-patterns when working with React Hooks",
    tagList: ["frontend", "hooks", "javascript", "react"],
    createdAt: "April 5, 2024",
    favoritesCount: 2,
    username: "janesmith",
    image: "https://i.pravatar.cc/100?img=9",
  });

  await assertArticleExists({
    slug: "building-scalable-apis-with-node-js",
    title: "Building Scalable APIs with Node.js",
    description: "Architectural patterns and best practices for creating robust backend services",
    tagList: ["api", "architecture", "backend", "nodejs"],
    createdAt: "April 5, 2024",
    favoritesCount: 2,
    username: "mikewilson",
    image: "https://i.pravatar.cc/100?img=70",
  });

  await assertArticleExists({
    slug: "how-to-learn-javascript-efficiently",
    title: "How to Learn JavaScript Efficiently",
    description: "A comprehensive guide to mastering JavaScript from beginner to advanced level",
    tagList: ["beginners", "javascript", "programming", "webdev"],
    createdAt: "April 5, 2024",
    favoritesCount: 4,
    username: "johndoe",
    image: "https://i.pravatar.cc/100?img=33",
  });
});

test("supports pagination", async ({ worker }) => {
  // create 21 articles
  const articles = Array.from({ length: 21 }, (_, i) =>
    createArticle({ slug: `article-${i + 1}` }),
  );

  worker.use(
    http("@get/articles", ({ request }) => {
      const { searchParams } = new URL(request.url);
      const limit = Number(searchParams.get("limit") ?? 10);
      const offset = Number(searchParams.get("offset") ?? 0);

      return HttpResponse.json({
        articles: [...articles].slice(offset, offset + limit),
        articlesCount: articles.length,
      });
    }),
  );

  await renderRoute({ to: "/" });

  // default page size is 10, expect page 1 with 10 articles, page 2 with 10 articles and page 3 with one
  await expect.element(getPageButton(1)).toHaveClass("active");
  await expect.element(getPageButton(2)).not.toHaveClass("active");
  await expect.element(getPageButton(3)).not.toHaveClass("active");

  await expect.element(getArticle(1)).toBeVisible();
  await expect.element(getArticle(10)).toBeVisible();
  await expect.element(getArticle(11)).not.toBeInTheDocument();

  // click on page 2, should have articles 11-20
  await getPageButton(2).getByRole("link").click();

  await expect.element(getPageButton(1)).not.toHaveClass("active");
  await expect.element(getPageButton(2)).toHaveClass("active");
  await expect.element(getPageButton(3)).not.toHaveClass("active");

  await expect.element(getArticle(11)).toBeVisible();
  await expect.element(getArticle(20)).toBeVisible();
  await expect.element(getArticle(21)).not.toBeInTheDocument();

  // click on page 3, should have articles 21
  await getPageButton(3).getByRole("link").click();

  await expect.element(getPageButton(1)).not.toHaveClass("active");
  await expect.element(getPageButton(2)).not.toHaveClass("active");
  await expect.element(getPageButton(3)).toHaveClass("active");

  await expect.element(getArticle(21)).toBeVisible();
});

test('display "your feed" link when authenticated', async ({ worker }) => {
  login();

  worker.use(
    // return articles 1 & 2
    http("@get/articles", () =>
      HttpResponse.json({
        articles: [createArticle({ slug: "article-1" }), createArticle({ slug: "article-2" })],
        articlesCount: 2,
      }),
    ),
    // return articles 3 & 4
    http("@get/articles/feed", () =>
      HttpResponse.json({
        articles: [createArticle({ slug: "article-3" }), createArticle({ slug: "article-4" })],
        articlesCount: 2,
      }),
    ),
  );

  login();

  await renderRoute({ to: "/" });

  const yourFeedLink = page.getByRole("link", { name: /your feed/i });
  await expect.element(yourFeedLink).toBeVisible();

  // expect articles 1 & 2 when on global feed
  await expect.element(getArticle(1)).toBeVisible();
  await expect.element(getArticle(2)).toBeVisible();
  await expect.element(getArticle(3)).not.toBeInTheDocument();
  await expect.element(getArticle(4)).not.toBeInTheDocument();

  await yourFeedLink.click();

  // expect articles 3 & 4 when on your feed
  await expect.element(getArticle(1)).not.toBeInTheDocument();
  await expect.element(getArticle(2)).not.toBeInTheDocument();
  await expect.element(getArticle(3)).toBeVisible();
  await expect.element(getArticle(4)).toBeVisible();
});

async function assertArticleExists({
  slug,
  title,
  description,
  tagList,
  createdAt,
  favoritesCount,
  username,
  image,
}: {
  slug: string;
  title: string;
  description: string;
  tagList: string[];
  createdAt: string;
  favoritesCount: number;
  username: string;
  image: string;
}) {
  const article = page.getByTestId(`slug-${slug}`);

  // title
  await expect.element(article.getByRole("heading", { level: 1, name: title })).toBeVisible();

  // description
  await expect.element(article.getByText(description)).toBeVisible();

  // created at
  await expect.element(article.getByText(createdAt)).toBeVisible();

  // avatar link and image
  await expect.element(article.getByRole("link", { name: username, exact: true })).toBeVisible();
  await expect.element(article.getByRole("img")).toHaveAttribute("src", image);

  // tag list
  const tagListItems = article.getByRole("listitem");
  expect(tagListItems.length).toBe(tagList.length);

  for (const tag of tagList) {
    await expect.element(tagListItems.getByText(tag)).toBeVisible();
  }

  // favorites button
  await expect.element(article.getByRole("button")).toHaveTextContent(favoritesCount);

  // article link
  await expect
    .element(article.getByRole("link", { name: title, exact: false }))
    .toHaveAttribute("href", `/article/${slug}`);
}
