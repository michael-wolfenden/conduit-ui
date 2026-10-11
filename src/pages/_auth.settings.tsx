import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as z from "zod";

import { useUpdateMutation, useLogoutMutation } from "#app/api/user/user.mutations.ts";
import { useAppForm } from "#app/lib/form/use-app-form.tsx";
import { ServerErrors } from "#app/ui/errors/server-errors.tsx";

export const Route = createFileRoute("/_auth/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { authenticatedUser } = Route.useRouteContext();
  const navigate = useNavigate();
  const updateMutation = useUpdateMutation();
  const logoutMutation = useLogoutMutation();

  /* oxfmt-ignore */
  const submitSchema = z.object({
    username: z.string().trim().transform((x) => (x === "" || x === authenticatedUser.username ? undefined : x)),
    email: z.string().trim().transform((x) => (x === "" || x === authenticatedUser.email ? undefined : x)),
    bio: z.string().trim().transform((x) => (x === "" ?  null : x)),
    image: z.string().trim().transform((x) => (x === "" ? null : x)),
    password: z.string().trim().transform((x) => (x === "" ? undefined : x)),
  });

  const form = useAppForm({
    defaultValues: {
      username: authenticatedUser.username,
      email: authenticatedUser.email,
      bio: authenticatedUser.bio ?? "",
      image: authenticatedUser.image ?? "",
      password: "",
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate(
        { user: submitSchema.parse(value) },
        {
          onSuccess: (updatedUser) => {
            void navigate({
              to: "/profile/$username",
              params: { username: updatedUser.username },
            });
          },
        },
      );
    },
  });

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <ServerErrors error={updateMutation.error} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <fieldset disabled={updateMutation.isPending}>
                <form.AppField
                  name="image"
                  children={(field) => <field.TextField placeholder="URL of profile picture" />}
                />
                <form.AppField
                  name="username"
                  children={(field) => <field.TextField variant="large" placeholder="Your Name" />}
                />
                <form.AppField
                  name="bio"
                  children={(field) => (
                    <field.TextAreaField
                      variant="large"
                      placeholder="Short bio about you"
                      rows={8}
                    />
                  )}
                />
                <form.AppField
                  name="email"
                  children={(field) => <field.TextField variant="large" placeholder="Email" />}
                />
                <form.AppField
                  name="password"
                  children={(field) => (
                    <field.TextField type="password" variant="large" placeholder="Password" />
                  )}
                />
                <button type="submit" className="btn btn-lg btn-primary pull-xs-right">
                  Update Settings
                </button>
              </fieldset>
            </form>
            <hr />
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    void navigate({ to: "/" });
                  },
                });
              }}
            >
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
