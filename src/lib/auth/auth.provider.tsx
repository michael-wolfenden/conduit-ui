import { useQuery } from "@tanstack/react-query";
import type { PropsWithChildren, ReactNode } from "react";

import { getCurrentUser } from "#app/api/user/user.queries.ts";
import { Spinner } from "#app/ui/spinner.tsx";

export function AuthProvider({ children }: PropsWithChildren): ReactNode {
  // isPending will be true even if this query is disabled, so use isLoading which equals isFetching && isPending
  const { isLoading } = useQuery(getCurrentUser);

  return isLoading ? <Spinner /> : children;
}
