import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import {
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
} from "#app/api/articles/articles.mutations.ts";
import type { ArticleSummary } from "#app/api/articles/articles.types.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { classNames } from "#app/lib/utils/classNames.ts";

interface ArticleFavoriteButtonProps {
  article: ArticleSummary;
  className?: string;
  children: ReactNode;
}

export function ArticleFavoriteButton({
  article,
  children,
  className,
}: ArticleFavoriteButtonProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated)();
  const favoriteArticleMutation = useFavoriteArticleMutation(article.slug);
  const unfavoriteArticleMutation = useUnfavoriteArticleMutation(article.slug);
  const mutation = article.favorited ? unfavoriteArticleMutation : favoriteArticleMutation;

  return (
    <button
      type="button"
      className={classNames([
        "btn btn-sm",
        article.favorited && "btn-primary",
        !article.favorited && "btn-outline-primary",
        className,
      ])}
      onClick={(e) => {
        if (isAuthenticated) {
          mutation.mutate();
          // hack: .btn-outline-primary:focus paints the button as "filled" and we
          // can't change that CSS. Blur after a mouse click so the focus style doesn't
          // linger. e.detail is 0 for keyboard-triggered clicks, so keyboard users
          // keep their focus position.
          if (e.detail > 0) e.currentTarget.blur();
        } else {
          void navigate({ to: "/login" });
        }
      }}
      disabled={mutation.isPending}
      data-testid="favourite-button"
    >
      <i className="ion-heart" /> {children}
    </button>
  );
}
