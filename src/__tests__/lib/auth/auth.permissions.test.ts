import { describe, expect, test } from "vitest";

import {
  createArticle,
  createComment,
  createProfile,
  createUser,
} from "#app/__tests__/test.builders.ts";
import { permissionsFor, subject } from "#app/lib/auth/auth.permissions.ts";

describe("an authenticated user", () => {
  const permissions = permissionsFor(createUser({ username: "authenticated-user" }));

  test("can delete their own comment", () => {
    const comment = createComment({ author: { username: "authenticated-user" } });
    expect(permissions.can("delete", subject("comment", comment))).toBe(true);
  });

  test("cannot delete another users comment", () => {
    const comment = createComment({ author: { username: "different-user" } });
    expect(permissions.can("delete", subject("comment", comment))).toBe(false);
  });

  test("can modify their own article", () => {
    const article = createArticle({ author: { username: "authenticated-user" } });
    expect(permissions.can("modify", subject("article", article))).toBe(true);
  });

  test("cannot modify another users article", () => {
    const article = createArticle({ author: { username: "different-user" } });
    expect(permissions.can("modify", subject("article", article))).toBe(false);
  });

  test("cannot update another users profile", () => {
    const profile = createProfile({ username: "different-user" });
    expect(permissions.can("update", subject("profile", profile))).toBe(false);
  });

  test("can follow another users profile", () => {
    const profile = createProfile({ username: "different-user" });
    expect(permissions.can("follow", subject("profile", profile))).toBe(true);
  });

  test("cannot follow their own profile", () => {
    const profile = createProfile({ username: "authenticated-user" });
    expect(permissions.can("follow", subject("profile", profile))).toBe(false);
  });
});

describe("an unauthenticated user", () => {
  const permissions = permissionsFor(undefined);

  test("cannot delete comments", () => expect(permissions.can("delete", "comment")).toBe(false));

  test("cannot modify articles", () => expect(permissions.can("modify", "article")).toBe(false));

  test("cannot edit profiles", () => expect(permissions.can("update", "profile")).toBe(false));

  test("cannot follow profiles", () => expect(permissions.can("follow", "profile")).toBe(false));
});
