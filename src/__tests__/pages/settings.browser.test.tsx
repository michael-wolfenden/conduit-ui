import { conflict, http, HttpResponse } from "#app/__msw__/msw.utils.ts";
import { createUser } from "#app/__tests__/test.builders.ts";
import {
  expect,
  getAuthenticatedUser,
  login,
  logout,
  page,
  renderRoute,
  test,
  vi,
} from "#app/__tests__/test.utils.tsx";
import type { UpdateUserRequest } from "#app/api/user/user.types.ts";

test("redirects unauthenticated user", async () => {
  logout();

  const { router } = await renderPage();
  await vi.waitUntil(() => router.history.location.pathname === "/login");
});

test("prefills the form with the authenticated user's details", async () => {
  login(
    createUser({
      bio: "user_bio",
      email: "user_email",
      image: "user_image",
      token: "user_token",
      username: "user_username",
    }),
  );

  const { usernameInput, emailInput, passwordInput, bioInput, imageInput } = await renderPage();

  await page.screenshot();

  await expect.element(usernameInput).toHaveValue("user_username");
  await expect.element(emailInput).toHaveValue("user_email");
  await expect.element(passwordInput).toHaveValue("");
  await expect.element(bioInput).toHaveValue("user_bio");
  await expect.element(imageInput).toHaveValue("user_image");
});

test("displays server side errors", async ({ worker }) => {
  login();

  worker.use(
    http("@put/user", () => {
      throw conflict({ username: ["has already been taken"] });
    }),
  );

  const { update } = await renderPage();

  await update({
    username: "submitted_username",
    email: "submitted_email",
    password: "",
    image: "",
    bio: "",
  });

  await expect.element(page.getByText("username has already been taken")).toBeVisible();
});

test("successfully updates the user and redirects", async ({ worker }) => {
  login();

  let submittedRequest: UpdateUserRequest | null = null;

  worker.use(
    http("@put/user", async ({ request }) => {
      submittedRequest = await request.json();
      return HttpResponse.json({
        user: {
          username: submittedRequest.user.username!,
          email: submittedRequest.user.email!,
          token: "user_token",
          bio: submittedRequest.user.bio ?? null,
          image: submittedRequest.user.image ?? null,
        },
      });
    }),

    http("@get/profiles/:username", () =>
      HttpResponse.json({
        profile: {
          username: "updated_username",
          following: false,
          bio: "",
          image: "https://updated_image",
        },
      }),
    ),
  );

  const { update, router } = await renderPage();

  await update({
    username: "updated_username",
    email: "updated_email",
    password: "updated_password",
    bio: "",
    image: "https://updated_image",
  });

  await vi.waitUntil(() => router.history.location.pathname === "/profile/updated_username");

  expect(submittedRequest).toMatchInlineSnapshot(`
    {
      "user": {
        "bio": null,
        "email": "updated_email",
        "image": "https://updated_image",
        "password": "updated_password",
        "username": "updated_username",
      },
    }
  `);

  expect(getAuthenticatedUser()).toMatchInlineSnapshot(`
    {
      "bio": null,
      "email": "updated_email",
      "image": "https://updated_image",
      "token": "user_token",
      "username": "updated_username",
    }
  `);
});

test("allows logging out", async () => {
  login();

  const { router } = await renderPage();
  const logoutButton = page.getByRole("button", { name: /or click here to logout/i });

  await logoutButton.click();

  await vi.waitUntil(() => router.history.location.pathname === "/");
  expect(getAuthenticatedUser()).toBeUndefined();
});

async function renderPage() {
  const { router } = await renderRoute({ to: "/settings" });
  await page.screenshot();

  const usernameInput = page.getByPlaceholder("Your Name");
  const emailInput = page.getByPlaceholder("Email");
  const passwordInput = page.getByPlaceholder("Password");
  const bioInput = page.getByPlaceholder("Short bio about you");
  const imageInput = page.getByPlaceholder("URL of profile picture");
  const updateButton = page.getByRole("button", { name: /update settings/i });

  const update = async ({
    username,
    email,
    password,
    bio,
    image,
  }: {
    username: string;
    email: string;
    password: string;
    bio: string;
    image: string;
  }) => {
    await usernameInput.fill(username);
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await bioInput.fill(bio);
    await imageInput.fill(image);

    await updateButton.click();
  };

  return { usernameInput, emailInput, passwordInput, bioInput, imageInput, update, router };
}
