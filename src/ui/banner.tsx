import { useAuthStore } from "#app/lib/auth/auth.store.ts";
import { ConduitLogo } from "#app/ui/conduit-logo.tsx";

export function Banner() {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated)();
  if (isAuthenticated) return null;

  return (
    <div className="banner">
      <div className="container">
        <h1 className="logo-font">
          <ConduitLogo className="banner-logo" />
        </h1>
        <p>
          The mother of all demo apps from the{" "}
          <a href="https://github.com/realworld-apps/realworld">Realworld</a> project.
        </p>
      </div>
    </div>
  );
}
