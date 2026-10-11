import { Link } from "@tanstack/react-router";

import type { ArticleSummary } from "#app/api/articles/articles.types.ts";
import { classNames } from "#app/lib/utils/classNames.ts";
import { ArticleFavoriteButton } from "#app/ui/articles/article-favorite-button.tsx";
import { ArticleMetadata } from "#app/ui/articles/article-metadata.tsx";

interface ArticleListProps {
  limit: number;
  currentPage: number;
  articlesCount: number;
  isFollowingFeed: boolean;
  articles: ArticleSummary[];
}

export function ArticleList({
  limit,
  currentPage,
  articlesCount,
  isFollowingFeed,
  articles,
}: ArticleListProps) {
  if (articles.length === 0) return <NoArticles isFollowingFeed={isFollowingFeed} />;

  const pages = Array.from({ length: Math.ceil(articlesCount / limit) })
    .fill(0)
    .map((_, i) => i + 1);

  return (
    <>
      {articles.map((article) => (
        <div className="article-preview" key={article.slug} data-testid={`slug-${article.slug}`}>
          <ArticleMetadata article={article}>
            <ArticleFavoriteButton article={article} className="pull-xs-right">
              {article.favoritesCount}
            </ArticleFavoriteButton>
          </ArticleMetadata>
          <Link to="/article/$slug" params={{ slug: article.slug }} className="preview-link">
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <span>Read more...</span>
            <ul className="tag-list">
              {article.tagList.map((tag) => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                  {tag}
                </li>
              ))}
            </ul>
          </Link>
        </div>
      ))}
      <ul className="pagination">
        {pages.map((page) => (
          <li
            key={page}
            className={classNames("page-item", currentPage === page && "active")}
            data-testid={`page-${page}`}
          >
            <Link to="." search={(prev) => ({ ...prev, page })} className="page-link">
              {page}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function NoArticles({ isFollowingFeed }: { isFollowingFeed: boolean }) {
  return (
    <div className="article-preview empty-feed-message">
      {isFollowingFeed ? (
        <>
          Your feed is empty. Follow some users to see their articles here, or check out the{" "}
          <Link to="/">Global Feed</Link>
        </>
      ) : (
        "No articles are here... yet."
      )}
    </div>
  );
}
