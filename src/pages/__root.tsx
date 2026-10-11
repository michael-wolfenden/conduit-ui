import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";

import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { DevtoolsProvider } from "#app/lib/devtools/devtools.provider.tsx";
import { RouterLoadingBar } from "#app/lib/router/router-loading-bar.tsx";
import { ConduitLogo } from "#app/ui/conduit-logo.tsx";
import { ProfileImage } from "#app/ui/profile/profile-image.tsx";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
});

function RootLayout() {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
  // oxlint-disable-next-line react/hook-use-state - setter not needed
  const [year] = useState(() => new Date().getFullYear());

  return (
    <>
      <RouterLoadingBar />
      <nav className="navbar navbar-light">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <ConduitLogo className="navbar-logo" />
          </Link>
          <ul className="nav navbar-nav pull-xs-right">
            {authenticatedUser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/editor">
                    <i className="ion-compose" />
                    &nbsp;New Article
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/settings">
                    <i className="ion-gear-a" />
                    &nbsp;Settings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/profile/$username"
                    params={{ username: authenticatedUser.username }}
                  >
                    <ProfileImage user={authenticatedUser} className="user-pic" />
                    {authenticatedUser.username}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    Sign in
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link nav-signup">
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <Outlet />
      <app-layout-footer>
        <footer>
          <div className="container">
            <Link to="/" className="logo-font">
              <ConduitLogo className="footer-logo" />
            </Link>
            <span className="attribution">
              &copy; {year}. An interactive learning project from
              <a href="https://github.com/gothinkster/realworld">RealWorld OSS Project</a>. Code
              licensed under MIT.
            </span>
          </div>
        </footer>
      </app-layout-footer>
      <DevtoolsProvider />
    </>
  );
}
