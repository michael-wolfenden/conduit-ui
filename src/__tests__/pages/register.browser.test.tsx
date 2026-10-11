import { conflict, http, HttpResponse } from "#app/__msw__/msw.utils.ts";
import { createUser } from "#app/__tests__/test.builders.ts";
import {
  renderRoute,
  page,
  expect,
  test,
  vi,
  getAuthenticatedUser,
} from "#app/__tests__/test.utils.tsx";
import type { NewUserRequest } from "#app/api/user/user.types.ts";

test("enables submit button when all fields populated", async () => {
  const { usernameInput, emailInput, passwordInput, signUpButton } = await renderPage();

  await expect.element(signUpButton).toBeDisabled();

  await usernameInput.fill("some_username");
  await emailInput.fill("some_email");
  await passwordInput.fill("some_password");

  await expect.element(signUpButton).toBeEnabled();
});

test("displays server side errors", async ({ worker }) => {
  worker.use(
    http("@post/users", () => {
      throw conflict({ username: ["has already been taken"] });
    }),
  );

  const { signUp } = await renderPage();

  await signUp({
    username: "submitted_username",
    email: "submitted_email",
    password: "submitted_password",
  });

  await expect.element(page.getByText("username has already been taken")).toBeVisible();
});

test("successfully registers a new user and redirects", async ({ worker }) => {
  let submittedRequest: NewUserRequest | null = null;

  worker.use(
    http("@post/users", async ({ request }) => {
      submittedRequest = await request.json();

      return HttpResponse.json({
        user: createUser({
          bio: null,
          email: "submitted_email",
          image: null,
          token: "user_token",
          username: "submitted_username",
        }),
      });
    }),
  );

  const { signUp, router } = await renderPage();
  await signUp({
    username: "submitted_username",
    email: "submitted_email",
    password: "submitted_password",
  });

  await vi.waitUntil(() => router.history.location.pathname === "/");

  expect(submittedRequest).toMatchInlineSnapshot(`
    {
      "user": {
        "email": "submitted_email",
        "password": "submitted_password",
        "username": "submitted_username",
      },
    }
  `);

  expect(getAuthenticatedUser()).toMatchInlineSnapshot(`
    {
      "bio": null,
      "email": "submitted_email",
      "image": null,
      "token": "user_token",
      "username": "submitted_username",
    }
  `);
});

async function renderPage() {
  const { router } = await renderRoute({ to: "/register" });

  const usernameInput = page.getByPlaceholder("Username");
  const emailInput = page.getByPlaceholder("Email");
  const passwordInput = page.getByPlaceholder("Password");
  const signUpButton = page.getByRole("button", { name: /sign up/i });

  const signUp = async ({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) => {
    await usernameInput.fill(username);
    await emailInput.fill(email);
    await passwordInput.fill(password);

    await signUpButton.click();
  };

  return { usernameInput, emailInput, passwordInput, signUpButton, signUp, router };
}
