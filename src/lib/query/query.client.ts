import { QueryClient } from "@tanstack/react-query";

import { isInternalServerError } from "#app/lib/utils/errors.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      throwOnError: (err) => isInternalServerError(err),
    },
  },
});
