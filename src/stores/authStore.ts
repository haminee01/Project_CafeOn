"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  userId: string;
  id?: string;
  email: string;
  nickname: string;
  username?: string;
  name?: string;
  phone?: string;
  role?: string;
  profileImageUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (payload: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser | null;
  }) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const createInitialState = (): Omit<
  AuthState,
  "login" | "logout" | "setUser"
> => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
});

const noopStorage: Storage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => undefined,
  removeItem: (_key: string) => undefined,
  clear: () => undefined,
  key: (_index: number) => null,
  get length() {
    return 0;
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      login: ({ accessToken, refreshToken, user }) => {
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: true,
        });
        if (user) {
          set({ user });
        }
      },
      logout: () => {
        set(createInitialState());
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "cafeon-auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const getRefreshToken = () => useAuthStore.getState().refreshToken;
