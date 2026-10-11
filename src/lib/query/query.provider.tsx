import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren, ReactNode } from "react";

import { queryClient } from "#app/lib/query/query.client.ts";

export function QueryClientProvider({ children }: PropsWithChildren): ReactNode {
  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>;
}
