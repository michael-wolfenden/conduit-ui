import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as z from "zod";

import { useNewUserMutation } from "#app/api/user/user.mutations.ts";
import { useAppForm } from "#app/lib/form/use-app-form.tsx";
import { ServerErrors } from "#app/ui/errors/server-errors.tsx";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

const formSchema = z.object({
  username: z.string().trim().nonempty(),
  email: z.string().trim().nonempty(),
  password: z.string().trim().nonempty(),
});

function RouteComponent() {
  const navigate = useNavigate();
  const newUserMutation = useNewUserMutation();

  const form = useAppForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    validators: {
      // match implementation by marking form invalid on mount so submit button is initially disabled
      onMount: formSchema,
      onChange: formSchema,
    },
    onSubmit: ({ value: user }) => {
      newUserMutation.mutate(
        { user },
        {
          onSuccess: () => {
            void navigate({ to: "/", from: Route.fullPath });
          },
        },
      );
    },
  });

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign up</h1>
            <p className="text-xs-center">
              <Link to="/login">Have an account?</Link>
            </p>
            <ServerErrors error={newUserMutation.error} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <fieldset disabled={newUserMutation.isPending}>
                <form.AppField
                  name="username"
                  children={(field) => <field.TextField variant="large" placeholder="Username" />}
                />
                <form.AppField
                  name="email"
                  children={(field) => <field.TextField variant="large" placeholder="Email" />}
                />
                <form.AppField
                  name="password"
                  children={(field) => (
                    <field.TextField variant="large" placeholder="Password" type="password" />
                  )}
                />
                <form.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="btn btn-lg btn-primary pull-xs-right"
                    >
                      Sign up
                    </button>
                  )}
                </form.Subscribe>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
