import { useNavigate } from "@tanstack/react-router";

import {
  useFollowProfileMutation,
  useUnfollowProfileMutation,
} from "#app/api/profile/profile.mutations.ts";
import type { Profile } from "#app/api/profile/profile.types.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { classNames } from "#app/lib/utils/classNames.ts";

interface ProfileFollowButtonProps {
  profile: Profile;
}

export function ProfileFollowButton({ profile }: ProfileFollowButtonProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated)();
  const unfollowProfileMutation = useUnfollowProfileMutation(profile.username);
  const followProfileMutation = useFollowProfileMutation(profile.username);
  const label = `${profile.following ? "Unfollow" : "Follow"} ${profile.username}`;
  const mutation = profile.following ? unfollowProfileMutation : followProfileMutation;

  return (
    <button
      type="button"
      className={classNames([
        "btn btn-sm action-btn",
        profile.following && "btn-secondary",
        !profile.following && "btn-outline-secondary",
      ])}
      onClick={() => {
        if (isAuthenticated) {
          mutation.mutate();
        } else {
          void navigate({ to: "/login" });
        }
      }}
      disabled={mutation.isPending}
      data-testid="follow-button"
    >
      <i className="ion-plus-round" /> {label}
    </button>
  );
}
