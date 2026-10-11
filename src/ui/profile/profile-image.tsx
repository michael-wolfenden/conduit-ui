import type { Profile } from "#app/api/profile/profile.types.ts";
import type { User } from "#app/api/user/user.types.ts";
import defaultAvatarUrl from "#realworld-submodule/assets/media/default-avatar.svg";

interface ProfileImageProps {
  user: User | Profile;
  className?: string;
}

export function ProfileImage({ user, className }: ProfileImageProps) {
  return (
    <img
      alt={`${user.username}'s profile picture`}
      src={user.image ?? defaultAvatarUrl}
      className={className}
    />
  );
}
