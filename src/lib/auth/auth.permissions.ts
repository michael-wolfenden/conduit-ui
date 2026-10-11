import { AbilityBuilder, Ability } from "@casl/ability";
import type { ForcedSubject, MatchConditions } from "@casl/ability";

import type { Article } from "#app/api/articles/articles.types.ts";
import type { Comment } from "#app/api/comments/comments.types.ts";
import type { Profile } from "#app/api/profile/profile.types.ts";
import type { User } from "#app/api/user/user.types.ts";

export { subject } from "@casl/ability";

// Subject<'profile', Profile> => 'profile' | (Profile & ForcedSubject<'profile'>)
// So CASL can map the literal 'profile' to the type Profile for condition matching
type Subject<SubjectName extends string, Subject> =
  | SubjectName
  | (Subject & ForcedSubject<SubjectName>);

type ProfileSubject = Subject<"profile", Profile>;
type CommentSubject = Subject<"comment", Comment>;
type ArticleSubject = Subject<"article", Article>;

type Abilities =
  | ["update" | "follow", ProfileSubject]
  | ["delete", CommentSubject]
  | ["modify", ArticleSubject];

const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

export function permissionsFor(user: User | undefined) {
  const { can: allow, build } = new AbilityBuilder<Ability<Abilities, MatchConditions>>(Ability);

  // all actions are denied by default, so unauthenticated users have no permissions
  if (user === undefined) return build({ conditionsMatcher: lambdaMatcher });

  allow("delete", "comment", (comment) => comment.author.username === user.username);
  allow(["modify"], "article", (article) => article.author.username === user.username);

  allow("update", "profile", (profile) => profile.username === user.username);
  allow("follow", "profile", (profile) => profile.username !== user.username);

  return build({ conditionsMatcher: lambdaMatcher });
}
