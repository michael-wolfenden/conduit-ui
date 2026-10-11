import { Markdown } from "@tanstack/markdown/react";
import { revalidateLogic } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";

import { useDeleteArticleMutation } from "#app/api/articles/articles.mutations.ts";
import { getArticle } from "#app/api/articles/articles.queries.ts";
import type { Article } from "#app/api/articles/articles.types.ts";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "#app/api/comments/comments.mutations.ts";
import { getComments } from "#app/api/comments/comments.queries.ts";
import type { Comment } from "#app/api/comments/comments.types.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { subject, usePermissions } from "#app/lib/auth/auth.use-permissions.tsx";
import { useAppForm } from "#app/lib/form/use-app-form.tsx";
import { formatIsoDate } from "#app/lib/utils/date.ts";
import { ArticleFavoriteButton } from "#app/ui/articles/article-favorite-button.tsx";
import { ArticleMetadata } from "#app/ui/articles/article-metadata.tsx";
import { ServerErrors } from "#app/ui/errors/server-errors.tsx";
import { ProfileFollowButton } from "#app/ui/profile/profile-follow-button.tsx";
import { ProfileImage } from "#app/ui/profile/profile-image.tsx";

export const Route = createFileRoute("/article/$slug")({
  component: RouteComponent,
  context: ({ params }) => ({ getArticle: getArticle(params.slug) }),
  loader: async ({ params, context: { queryClient, getArticle } }) => {
    void queryClient.query({ ...getComments(params.slug), staleTime: "static" });
    await queryClient.query({ ...getArticle, staleTime: "static" });
  },
});

function RouteComponent() {
  const { getArticle } = Route.useRouteContext();
  const article = useSuspenseQuery(getArticle).data;

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container" data-testid="article-header">
          <h1>{article.title}</h1>
          <Metadata article={article} />
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <Markdown>{article.body}</Markdown>
            <ul className="tag-list">
              {article.tagList.map((tag) => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr />
        <div className="article-actions">
          <Metadata article={article} />
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            <AddCommentForm article={article} />
            <Suspense fallback="Loading comments...">
              <ArticleComments />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metadata({ article }: { article: Article }) {
  const permissions = usePermissions();
  const canModify = permissions.can("modify", subject("article", article));

  return (
    <ArticleMetadata article={article}>
      {canModify ? (
        <span>
          <Link
            to="/editor/$slug"
            params={{ slug: article.slug }}
            className="btn btn-sm btn-outline-secondary"
          >
            <i className="ion-edit" /> Edit Article
          </Link>
          <DeleteArticleButton article={article} />
        </span>
      ) : (
        <span>
          <ProfileFollowButton profile={article.author} />
          <ArticleFavoriteButton article={article}>
            {article.favorited ? "Unfavorite" : "Favorite"} Article{" "}
            <span className="counter">({article.favoritesCount})</span>
          </ArticleFavoriteButton>
        </span>
      )}
    </ArticleMetadata>
  );
}

function DeleteArticleButton({ article }: { article: Article }) {
  const deleteArticleMutation = useDeleteArticleMutation(article.slug);
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      disabled={deleteArticleMutation.isPending}
      onClick={() => {
        deleteArticleMutation.mutate(undefined, {
          onSuccess: () => void navigate({ to: "/" }),
        });
      }}
    >
      <i className="ion-trash-a" /> Delete Article
    </button>
  );
}

function AddCommentForm({ article }: { article: Article }) {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
  const createCommentMutation = useCreateCommentMutation(article.slug);

  const form = useAppForm({
    defaultValues: {
      body: "",
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value: comment }) => {
      createCommentMutation.mutate(
        { comment },
        {
          onSuccess: () => form.reset(),
        },
      );
    },
  });

  if (authenticatedUser === undefined) {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments on
        this article.
      </div>
    );
  }

  return (
    <div>
      <ServerErrors error={createCommentMutation.error} />
      <form
        className="card comment-form"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="card-block">
          <form.AppField
            name="body"
            children={(field) => (
              <field.TextAreaField
                withFieldset={false}
                placeholder="Write a comment..."
                rows={3}
                disabled={createCommentMutation.isPending}
              />
            )}
          />
        </div>
        <div className="card-footer">
          <ProfileImage user={authenticatedUser} className="comment-author-img" />
          <button
            className="btn btn-sm btn-primary"
            type="submit"
            disabled={createCommentMutation.isPending}
          >
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
}

function ArticleComments() {
  const { slug } = Route.useParams();
  const comments = useSuspenseQuery(getComments(slug)).data;

  if (comments.length === 0) return null;

  return comments.map((comment) => (
    <div key={comment.id} className="card" data-testid={`comment-${comment.id}`}>
      <div className="card-block">
        <div className="card-text">
          <Markdown>{comment.body}</Markdown>
        </div>
      </div>
      <div className="card-footer">
        <Link
          to="/profile/$username"
          params={{ username: comment.author.username }}
          className="comment-author"
        >
          <ProfileImage user={comment.author} className="comment-author-img" />
        </Link>
        &nbsp;&nbsp;
        <Link
          to="/profile/$username"
          params={{ username: comment.author.username }}
          className="comment-author"
        >
          {comment.author.username}
        </Link>
        <span className="date-posted">{formatIsoDate(comment.createdAt)}</span>
        <DeleteCommentButton slug={slug} comment={comment} />
      </div>
    </div>
  ));
}

function DeleteCommentButton({ slug, comment }: { slug: string; comment: Comment }) {
  const deleteCommentMutation = useDeleteCommentMutation(slug, comment.id);
  const permissions = usePermissions();
  const canDelete = permissions.can("delete", subject("comment", comment));

  if (!canDelete) return null;
  if (deleteCommentMutation.isPending) return null;

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions jsx-a11y/click-events-have-key-events - following existing designs
    <span
      className="mod-options"
      onClick={() => deleteCommentMutation.mutate()}
      data-testid="delete-button"
    >
      <i className="ion-trash-a" />
    </span>
  );
}
