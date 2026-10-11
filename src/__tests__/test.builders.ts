import * as Factory from "factory.ts";

import type { Article } from "#app/api/articles/articles.types.ts";
import type { Comment } from "#app/api/comments/comments.types.ts";
import type { Profile } from "#app/api/profile/profile.types.ts";
import type { User } from "#app/api/user/user.types.ts";

export const createUser = Factory.Sync.makeFactory<User>({
  bio: "user_bio",
  email: "user_email",
  image: "user_image",
  token: "user_token",
  username: "user_username",
}).build;

export const createProfile = Factory.Sync.makeFactory<Profile>({
  username: "profile_username",
  following: true,
  bio: "profile_bio",
  image: "profile_image",
}).build;

export const createArticle = Factory.Sync.makeFactory<Article>({
  slug: "article-slug",
  title: "article-title",
  description: "article-description",
  body: "article-body",
  tagList: ["article-tag"],
  createdAt: "2000-01-01T00:00:00.000Z",
  updatedAt: "2000-01-01T00:00:00.000Z",
  favorited: true,
  favoritesCount: 2,
  author: createProfile(),
}).build;

export const createComment = Factory.Sync.makeFactory<Comment>({
  id: 1,
  body: "comment_body",
  createdAt: "2000-01-01T00:00:00.000Z",
  updatedAt: "2000-01-01T00:00:00.000Z",
  author: createProfile(),
}).build;
