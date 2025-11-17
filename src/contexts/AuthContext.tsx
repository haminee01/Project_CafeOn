"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/api";
import { AuthUser, useAuthStore } from "@/stores/authStore";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  currentUserId: string | undefined;
  login: (token: string, refreshToken: string, userData?: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (data: any): AuthUser => ({
  userId: data.userId || data.id || data.sub || "",
  id: data.userId || data.id,
  email: data.email,
  nickname: data.nickname || data.username || data.name || "",
  username: data.nickname || data.username,
  name: data.name,
  phone: data.phone,
  role: data.role,
  profileImageUrl: data.profileImageUrl ?? null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    setUser,
  } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? false
  );

  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration?.(() =>
      setHasHydrated(true)
    );
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []);

  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const profile = await getUserProfile();
      return profile;
    },
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (profileQuery.data) {
      const payload = profileQuery.data.data || profileQuery.data;
      setUser(normalizeUser(payload));
    }
  }, [profileQuery.data, setUser]);

  useEffect(() => {
    if (!accessToken && !profileQuery.isFetching) {
      setUser(null);
    }
  }, [accessToken, profileQuery.isFetching, setUser]);

  const login = useCallback(
    (token: string, newRefreshToken: string, userData?: AuthUser) => {
      storeLogin({
        accessToken: token,
        refreshToken: newRefreshToken || refreshToken || undefined,
        user: userData ?? user ?? null,
      });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    [storeLogin, refreshToken, user, queryClient]
  );

  const logout = useCallback(() => {
    storeLogout();
    queryClient.removeQueries({ queryKey: ["auth"] });
    router.push("/");
  }, [storeLogout, queryClient, router]);

  const updateUser = useCallback(
    (nextUser: AuthUser) => {
      setUser(nextUser);
      queryClient.setQueryData(["auth", "profile"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: nextUser,
        };
      });
    },
    [queryClient, setUser]
  );

  const isLoading =
    !hasHydrated || (Boolean(accessToken) && profileQuery.isFetching);

  const value = useMemo(
    () => ({
      user,
      token: accessToken,
      isAuthenticated,
      isLoading,
      isLoggedIn: isAuthenticated,
      currentUserId: user?.userId || user?.id,
      login,
      logout,
      updateUser,
    }),
    [user, accessToken, isAuthenticated, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
