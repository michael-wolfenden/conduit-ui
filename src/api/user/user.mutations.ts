import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "#app/api/api.instance.ts";
import type {
  LoginUserRequest,
  NewUserRequest,
  UpdateUserRequest,
} from "#app/api/user/user.types.ts";
import { useAuthStore } from "#app/lib/auth/auth.store.ts";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (request: LoginUserRequest) => {
      const data = await api("@post/users/login", { body: request });
      return data.user;
    },

    onSuccess: (user) => {
      queryClient.clear();
      login(user);
    },
  });
}

export function useNewUserMutation() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (request: NewUserRequest) => {
      const data = await api("@post/users", { body: request });
      return data.user;
    },

    onSuccess: (user) => {
      queryClient.clear();
      login(user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      /* noop */
    },
    onSuccess: () => {
      queryClient.clear();
      logout();
    },
  });
}

export function useUpdateMutation() {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: async (request: UpdateUserRequest) => {
      const data = await api("@put/user", { body: request });
      return data.user;
    },

    onSuccess: (user) => login(user),
  });
}
