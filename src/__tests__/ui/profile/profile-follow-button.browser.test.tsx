import { http, HttpResponse } from "#app/__msw__/msw.utils.ts";
import { createProfile } from "#app/__tests__/test.builders.ts";
import { expect, login, page, renderComponent, test } from "#app/__tests__/test.utils.tsx";
import type { Profile } from "#app/api/profile/profile.types.ts";
import { ProfileFollowButton } from "#app/ui/profile/profile-follow-button.tsx";

test("can follow a profile", async ({ worker }) => {
  login();

  const profileToFollow = createProfile({ username: "test_user", following: false });
  let submittedUsername: string | null = null;

  worker.use(
    http("@post/profiles/:username/follow", ({ params: { username } }) => {
      submittedUsername = username;
      return HttpResponse.json({ profile: { ...profileToFollow, following: true } });
    }),
  );

  await renderFollowButton({ profile: profileToFollow });

  const followButton = page.getByRole("button");
  await expect.element(followButton).toBeVisible();
  await expect.element(followButton).toHaveClass("btn-outline-secondary");
  await expect.element(page.getByText("Follow test_user")).toBeVisible();

  await followButton.click();

  expect(submittedUsername).toBe("test_user");
});

test("can unfollow a profile", async ({ worker }) => {
  const profileToUnfollow = createProfile({ username: "test_user", following: true });
  let submittedUsername: string | null = null;

  login();

  worker.use(
    http("@delete/profiles/:username/follow", ({ params: { username } }) => {
      submittedUsername = username;
      return HttpResponse.json({ profile: { ...profileToUnfollow, following: false } });
    }),
  );

  await renderFollowButton({ profile: profileToUnfollow });

  const unfollowButton = page.getByRole("button");

  await expect.element(unfollowButton).toBeVisible();
  await expect.element(unfollowButton).toHaveClass("btn-secondary");
  await expect.element(page.getByText("Unfollow test_user")).toBeVisible();

  await unfollowButton.click();

  expect(submittedUsername).toBe("test_user");
});

async function renderFollowButton({ profile }: { profile: Profile }) {
  await renderComponent(<ProfileFollowButton profile={profile} />);
}
