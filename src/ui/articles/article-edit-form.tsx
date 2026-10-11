import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";

import type { useCreateArticleMutation } from "#app/api/articles/articles.mutations.ts";
import type { Article } from "#app/api/articles/articles.types.ts";
import { useAppForm } from "#app/lib/form/use-app-form.tsx";
import { ServerErrors } from "#app/ui/errors/server-errors.tsx";

interface ArticleEditFormProps {
  article?: Article;
  mutate: ReturnType<typeof useCreateArticleMutation>["mutate"];
  error: Error | null;
  isPending: boolean;
}

export function ArticleEditForm({ article, mutate, error, isPending }: ArticleEditFormProps) {
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      title: article?.title ?? "",
      description: article?.description ?? "",
      body: article?.body ?? "",
      tagList: article?.tagList ?? [],
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value: article }) => {
      mutate(
        { article },
        {
          onSuccess: (updatedArticle) => {
            void navigate({ to: "/article/$slug", params: { slug: updatedArticle.slug } });
          },
        },
      );
    },
  });

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ServerErrors error={error} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <fieldset disabled={isPending}>
                <form.AppField
                  name="title"
                  children={(field) => (
                    <field.TextField variant="large" placeholder="Article Title" />
                  )}
                />
                <form.AppField
                  name="description"
                  children={(field) => <field.TextField placeholder="What's this article about?" />}
                />
                <form.AppField
                  name="body"
                  children={(field) => (
                    <field.TextAreaField rows={8} placeholder="Write your article (in markdown)" />
                  )}
                />
                <form.Field
                  name="tagList"
                  mode="array"
                  children={(tagListField) => (
                    <>
                      <fieldset className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter tags"
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();

                            const newTag = e.currentTarget.value.trim();
                            if (newTag && !tagListField.state.value.includes(newTag)) {
                              tagListField.pushValue(newTag);
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </fieldset>
                      <div className="tag-list" style={{ cursor: "pointer" }}>
                        {tagListField.state.value.map((tag, index) => (
                          // oxlint-disable-next-line jsx-a11y/no-static-element-interactions jsx-a11y/click-events-have-key-events
                          <span
                            key={tag}
                            className="tag-default tag-pill"
                            style={{ cursor: "pointer" }}
                            onClick={() => tagListField.removeValue(index)}
                            data-testid="tag-remove"
                          >
                            <i className="ion-close-round" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                />
                <button type="submit" className="btn btn-lg pull-xs-right btn-primary">
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
