import {
  createFileRoute,
  Link,
  redirect,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router";
import * as z from "zod";

import { useLoginMutation } from "#app/api/user/user.mutations.ts";
import { authStore } from "#app/lib/auth/auth.store.ts";
import { useAppForm } from "#app/lib/form/use-app-form.tsx";
import { fallback } from "#app/lib/utils/zod.ts";
import { ServerErrors } from "#app/ui/errors/server-errors.tsx";

const searchDefaults = {
  redirect: "/",
};

const searchSchema = z.object({
  redirect: fallback(z.string().trim(), searchDefaults.redirect),
});

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(searchDefaults)] },
  beforeLoad: ({ search }) => {
    if (authStore().isAuthenticated()) throw redirect({ to: search.redirect });
  },
});

const formSchema = z.object({
  email: z.string().trim().nonempty(),
  password: z.string().trim().nonempty(),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      // match implementation by marking form invalid on mount so submit button is initially disabled
      onMount: formSchema,
      onChange: formSchema,
    },
    onSubmit: ({ value: user }) => {
      loginMutation.mutate(
        { user },
        {
          onSuccess: () => {
            void navigate({ to: search.redirect, from: Route.fullPath });
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
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>
            <ServerErrors error={loginMutation.error} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <fieldset disabled={loginMutation.isPending}>
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
                      Sign in
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
