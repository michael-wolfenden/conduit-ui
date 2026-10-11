import { createFileRoute } from "@tanstack/react-router";

import { useCreateArticleMutation } from "#app/api/articles/articles.mutations.ts";
import { ArticleEditForm } from "#app/ui/articles/article-edit-form.tsx";

export const Route = createFileRoute("/_auth/editor/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { error, isPending, mutate } = useCreateArticleMutation();
  return <ArticleEditForm error={error} isPending={isPending} mutate={mutate} />;
}
