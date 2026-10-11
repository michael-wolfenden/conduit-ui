import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { ArticleSummary } from "#app/api/articles/articles.types.ts";
import { formatIsoDate } from "#app/lib/utils/date.ts";
import { ProfileImage } from "#app/ui/profile/profile-image.tsx";

interface ArticleMetadataProps {
  article: ArticleSummary;
  children: ReactNode;
}

export function ArticleMetadata({ article, children }: ArticleMetadataProps) {
  return (
    <div className="article-meta">
      <Link to="/profile/$username" params={{ username: article.author.username }}>
        <ProfileImage user={article.author} />
      </Link>
      <div className="info">
        <Link
          to="/profile/$username"
          params={{ username: article.author.username }}
          className="author"
        >
          {article.author.username}
        </Link>
        <span className="date">{formatIsoDate(article.createdAt)}</span>
      </div>
      {children}
    </div>
  );
}
