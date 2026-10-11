import { http, HttpResponse, unauthorized } from "#app/__msw__/msw.utils.ts";
import { createUser } from "#app/__tests__/test.builders.ts";
import {
  renderRoute,
  page,
  expect,
  test,
  login,
  vi,
  getAuthenticatedUser,
} from "#app/__tests__/test.utils.tsx";
import type { LoginUserRequest } from "#app/api/user/user.types.ts";

test("enables submit button when all fields populated", async () => {
  const { emailInput, passwordInput, signInButton } = await renderPage();

  await expect.element(signInButton).toBeDisabled();

  await emailInput.fill("some_email");
  await passwordInput.fill("some_password");

  await expect.element(signInButton).toBeEnabled();
});

test("displays server side errors", async ({ worker }) => {
  worker.use(
    http("@post/users/login", () => {
      throw unauthorized({ credentials: ["invalid"] });
    }),
  );

  const { signIn } = await renderPage();
  await signIn({ email: "submitted_email", password: "submitted_password" });

  await expect.element(page.getByText("credentials invalid")).toBeVisible();
});

test("logs in successfully with valid credentials and redirects", async ({ worker }) => {
  let submittedRequest: LoginUserRequest | null = null;

  worker.use(
    http("@post/users/login", async ({ request }) => {
      submittedRequest = await request.json();

      return HttpResponse.json({
        user: createUser({
          bio: "user_bio",
          email: submittedRequest?.user?.email,
          image: "user_image",
          token: "user_token",
          username: "user_username",
        }),
      });
    }),
  );

  const { signIn, router } = await renderPage();
  await signIn({ email: "submitted_email", password: "submitted_password" });
  await vi.waitUntil(() => router.history.location.pathname === "/");

  expect(submittedRequest).toMatchInlineSnapshot(`
    {
      "user": {
        "email": "submitted_email",
        "password": "submitted_password",
      },
    }
  `);

  expect(getAuthenticatedUser()).toMatchInlineSnapshot(`
    {
      "bio": "user_bio",
      "email": "submitted_email",
      "image": "user_image",
      "token": "user_token",
      "username": "user_username",
    }
  `);
});

test("redirects authenticated user", async () => {
  login();

  const { router } = await renderPage();
  await vi.waitUntil(() => router.history.location.pathname === "/");
});

async function renderPage() {
  const { router } = await renderRoute({ to: "/login" });

  const emailInput = page.getByPlaceholder("Email");
  const passwordInput = page.getByPlaceholder("Password");
  const signInButton = page.getByRole("button", { name: /sign in/i });

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await signInButton.click();
  };

  return { emailInput, passwordInput, signInButton, signIn, router };
}
