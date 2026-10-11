import { subject } from "@casl/ability";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { useUpdateArticleMutation } from "#app/api/articles/articles.mutations.ts";
import { getArticle } from "#app/api/articles/articles.queries.ts";
import { permissionsFor } from "#app/lib/auth/auth.permissions.ts";
import { ArticleEditForm } from "#app/ui/articles/article-edit-form.tsx";

export const Route = createFileRoute("/_auth/editor/$slug")({
  component: RouteComponent,
  context: ({ params }) => ({ getArticle: getArticle(params.slug) }),
  loader: async ({ context: { queryClient, getArticle, authenticatedUser } }) => {
    const permissions = permissionsFor(authenticatedUser);
    const article = await queryClient.query({ ...getArticle, staleTime: "static" });

    if (!permissions.can("modify", subject("article", article))) throw redirect({ to: "/" });
  },
});

function RouteComponent() {
  const { getArticle } = Route.useRouteContext();
  const article = useSuspenseQuery(getArticle).data;
  const { error, isPending, mutate } = useUpdateArticleMutation(article.slug);
  return <ArticleEditForm article={article} error={error} isPending={isPending} mutate={mutate} />;
}
