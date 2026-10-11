import { dbUsers } from "#app/__msw__/db.ts";
import type { DbUser } from "#app/__msw__/db.ts";
import {
  getAuthenticatedUser,
  getAuthenticatedUserOrThrow,
  http,
  HttpResponse,
  notFound,
} from "#app/__msw__/msw.utils.ts";

export const profileHandlers = [
  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/profiles/%5Busername%5D/index.get.ts
  http("@get/profiles/:username", ({ request, params: { username } }) => {
    const authUser = getAuthenticatedUser(request);
    const profile = getProfileOrThrow(username);

    return HttpResponse.json(mapProfile(profile, authUser));
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/profiles/%5Busername%5D/follow/index.post.ts
  http("@post/profiles/:username/follow", ({ request, params: { username } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const profile = getProfileOrThrow(username);

    if (!profile.followedBy.includes(authUser)) {
      profile.followedBy.push(authUser);
    }

    return HttpResponse.json(mapProfile(profile, authUser));
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/profiles/%5Busername%5D/follow/index.delete.ts
  http("@delete/profiles/:username/follow", ({ request, params: { username } }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    const profile = getProfileOrThrow(username);

    if (profile.followedBy.includes(authUser)) {
      profile.followedBy = profile.followedBy.filter((user) => user !== authUser);
    }

    return HttpResponse.json(mapProfile(profile, authUser));
  }),
];

function getProfileOrThrow(username: string) {
  const profile = dbUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (profile === undefined) throw notFound();

  return profile;
}

function mapProfile(profile: DbUser, authUser: DbUser | undefined) {
  return {
    profile: {
      username: profile.username,
      bio: profile.bio,
      image: profile.image,
      following: authUser === undefined ? false : profile.followedBy.includes(authUser),
    },
  };
}
