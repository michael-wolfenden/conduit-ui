import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "#app/api/user/user.types.ts";

interface AuthStore {
  authenticatedUser?: User;
  token?: string;
  login: (authenticatedUser: User) => void;
  logout: () => void;
  isUnauthenticated: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authenticatedUser: undefined,
      token: undefined,
      isAuthenticated: () => get().token !== undefined,
      isUnauthenticated: () => get().token === undefined,
      login: (authenticatedUser: User) => {
        set(() => ({ authenticatedUser, token: authenticatedUser.token }));
      },
      logout: () => {
        set(() => ({ authenticatedUser: undefined, token: undefined }));
      },
    }),
    {
      name: "jwtToken",
      // we would normally just use the following to just store the token,
      // partialize: state => state.token,
      // however the e2e tests are expecting the token stored as a string rather than
      // { state: { token: '...' }, version: 0 } so we have to implement our own storage
      storage: {
        getItem: (name) => {
          const token = localStorage.getItem(name);
          if (token == null) return null;
          return { state: { token }, version: 0 };
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
        setItem: (name, { state }) => {
          if (state.token) {
            localStorage.setItem(name, state.token);
          } else {
            localStorage.removeItem(name);
          }
        },
      },
    },
  ),
);

// use this for reading / writing auth state outside of react components, ie in route loaders or tests
export function authStore(): AuthStore {
  return useAuthStore.getState();
}
