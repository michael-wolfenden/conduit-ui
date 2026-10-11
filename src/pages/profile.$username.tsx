import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, stripSearchParams } from "@tanstack/react-router";
import * as z from "zod";

import { getProfileByUsername } from "#app/api/profile/profile.queries.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { subject, usePermissions } from "#app/lib/auth/auth.use-permissions.tsx";
import { fallback } from "#app/lib/utils/zod.ts";
import { ProfileFollowButton } from "#app/ui/profile/profile-follow-button.tsx";
import { ProfileImage } from "#app/ui/profile/profile-image.tsx";

const searchDefaults = {
  page: 1,
  limit: 10,
};

const searchSchema = z.object({
  page: fallback(z.number(), searchDefaults.page),
  limit: fallback(z.number(), searchDefaults.limit),
});

export const Route = createFileRoute("/profile/$username")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(searchDefaults)] },
  context: ({ params }) => ({ getProfileByUsername: getProfileByUsername(params.username) }),
  loader: async ({ context: { queryClient, getProfileByUsername } }) =>
    queryClient.query({ ...getProfileByUsername, staleTime: "static" }),
  component: RouteComponent,
});

function RouteComponent() {
  const { getProfileByUsername } = Route.useRouteContext();
  const profile = useSuspenseQuery(getProfileByUsername).data;
  const permissions = usePermissions();
  const canUpdate = permissions.can("update", subject("profile", profile));
  const canFollow = permissions.can("follow", subject("profile", profile));
  const isUnauthenticated = useAuthStore((store) => store.isUnauthenticated)();

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <ProfileImage user={profile} className="user-img" />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {(isUnauthenticated || canFollow) && <ProfileFollowButton profile={profile} />}
              {canUpdate && (
                <Link to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                  <i className="ion-gear-a" /> Edit Profile Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <Link
                    to="/profile/$username"
                    className="nav-link"
                    activeOptions={{ exact: true }}
                    params={{ username: profile.username }}
                  >
                    My Posts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/profile/$username/favorites"
                    className="nav-link"
                    params={{ username: profile.username }}
                  >
                    Favorited Posts
                  </Link>
                </li>
              </ul>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
