import { http, HttpResponse } from "#app/__msw__/msw.utils.ts";
import { createArticle } from "#app/__tests__/test.builders.ts";
import { expect, login, page, renderComponent, test } from "#app/__tests__/test.utils.tsx";
import type { Article } from "#app/api/articles/articles.types.ts";
import { ArticleFavoriteButton } from "#app/ui/articles/article-favorite-button.tsx";

test("can favorite an article", async ({ worker }) => {
  const articleToFavorite = createArticle({ slug: "test_slug", favorited: false });
  let submittedSlug: string | undefined;

  login();

  worker.use(
    http("@post/articles/:slug/favorite", ({ params: { slug } }) => {
      submittedSlug = slug;
      return HttpResponse.json({ article: { ...articleToFavorite, favorited: true } });
    }),
  );

  await renderFavoriteButton({ article: articleToFavorite });

  const favoriteButton = page.getByRole("button");
  expect(favoriteButton).toBeVisible();
  expect(favoriteButton).toHaveClass("btn-outline-primary");

  await favoriteButton.click();

  expect(submittedSlug).toBe("test_slug");
});

test("can unfavorite an article", async ({ worker }) => {
  const articleToUnfavorite = createArticle({ slug: "test_slug", favorited: true });
  let submittedSlug: string | undefined;

  login();

  worker.use(
    http("@delete/articles/:slug/favorite", ({ params: { slug } }) => {
      submittedSlug = slug;
      return HttpResponse.json({ article: { ...articleToUnfavorite, favorited: false } });
    }),
  );

  await renderFavoriteButton({ article: articleToUnfavorite });

  const unfavoriteButton = page.getByRole("button");
  expect(unfavoriteButton).toBeVisible();
  expect(unfavoriteButton).toHaveClass("btn-primary");

  await unfavoriteButton.click();

  expect(submittedSlug).toBe("test_slug");
});

async function renderFavoriteButton({ article }: { article: Article }) {
  await renderComponent(
    <ArticleFavoriteButton article={article}>Favorite Button</ArticleFavoriteButton>,
  );
}
