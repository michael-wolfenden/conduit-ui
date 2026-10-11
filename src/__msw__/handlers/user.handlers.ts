import { dbUsers } from "#app/__msw__/db.ts";
import type { DbUser } from "#app/__msw__/db.ts";
import {
  conflict,
  getAuthenticatedUserOrThrow,
  http,
  HttpResponse,
  unauthorized,
  unprocessableContent,
} from "#app/__msw__/msw.utils.ts";

export const userHandlers = [
  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/user/index.get.ts
  http("@get/user", ({ request }) => {
    const authUser = getAuthenticatedUserOrThrow(request);
    return HttpResponse.json(mapUser(authUser));
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/users/index.post.ts
  http("@post/users/login", async ({ request }) => {
    const {
      user: { email, password },
    } = await request.json();

    if (!email) throw unprocessableContent({ email: ["can't be blank"] });
    if (!password) throw unprocessableContent({ password: ["can't be blank"] });

    const userByEmail = dbUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userByEmail?.password !== password) throw unauthorized({ credentials: ["invalid"] });

    return HttpResponse.json(mapUser(userByEmail));
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/users/index.post.ts
  http("@post/users", async ({ request }) => {
    const {
      user: { username, email, password },
    } = await request.json();

    if (!email) throw unprocessableContent({ email: ["can't be blank"] });
    if (!username) throw unprocessableContent({ username: ["can't be blank"] });
    if (!password) throw unprocessableContent({ password: ["can't be blank"] });

    const userByUsername = dbUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (userByUsername) throw conflict({ username: ["has already been taken"] });

    const userByEmail = dbUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userByEmail) throw conflict({ email: ["has already been taken"] });

    const nextId = Math.max(...dbUsers.map((item) => item.id)) + 1;

    const newUser = {
      id: nextId,
      username,
      email,
      password,
      bio: null,
      image: null,
      followedBy: [],
    };

    dbUsers.push(newUser);

    return HttpResponse.json(mapUser(newUser), { status: 201 });
  }),

  // https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app/blob/main/server/routes/api/user/index.put.ts
  http("@put/user", async ({ request }) => {
    const authUser = getAuthenticatedUserOrThrow(request);

    const {
      user: { username, email, password, bio, image },
    } = await request.json();

    if (username && username === "") throw unprocessableContent({ email: ["can't be blank"] });
    if (email && email === "") throw unprocessableContent({ username: ["can't be blank"] });
    if (password && password.length < 8) {
      throw unprocessableContent({ password: ["must be at least 8 characters long"] });
    }

    if (username) {
      const userByUsername = dbUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase(),
      );
      if (userByUsername) throw conflict({ username: ["has already been taken"] });
    }

    if (email) {
      const userByEmail = dbUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userByEmail) throw conflict({ email: ["has already been taken"] });
    }

    authUser.username = username ?? authUser.username;
    authUser.email = email ?? authUser.email;
    authUser.password = password ?? authUser.password;
    authUser.bio = bio ?? null;
    authUser.image = image ?? null;

    return HttpResponse.json(mapUser(authUser));
  }),
];

function mapUser(user: DbUser) {
  return {
    user: {
      bio: user.bio ?? null,
      email: user.email,
      image: user.image ?? null,
      token: btoa(JSON.stringify({ sub: user.id })),
      username: user.username,
    },
  };
}
