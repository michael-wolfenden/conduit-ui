import { permissionsFor } from "#app/lib/auth/auth.permissions.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";

export { subject } from "#app/lib/auth/auth.permissions.ts";

export function usePermissions() {
  const authenticatedUser = useAuthStore((store) => store.authenticatedUser);
  return permissionsFor(authenticatedUser);
}
