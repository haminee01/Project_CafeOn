"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { tokenManager, authApi, ApiResponse, AuthResponse } from "@/lib/api";

interface User {
  userId: string;
  email: string;
  nickname: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  signup: (
    email: string,
    password: string,
    nickname: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      if (tokenManager.isLoggedIn()) {
        await refreshAuth();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // 인증 상태 갱신
  const refreshAuth = async () => {
    try {
      const response = await authApi.refreshTokens();
      if (response.success && response.data) {
        const { user: userData } = response.data;
        setUser(userData);
        return;
      }
    } catch (error) {
      console.error("인증 상태 갱신 실패:", error);
    }

    // 갱신 실패 시 로그아웃 처리
    tokenManager.clearTokens();
    setUser(null);
  };

  // 로그인
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response: ApiResponse<AuthResponse> = await authApi.login({
        email,
        password,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;

        // 토큰 저장
        tokenManager.setTokens(accessToken, refreshToken);

        // 사용자 정보 저장
        setUser(userData);

        return { success: true };
      } else {
        return {
          success: false,
          message: response.error?.message || "로그인에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      return {
        success: false,
        message: "로그인 중 오류가 발생했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입
  const signup = async (
    email: string,
    password: string,
    nickname: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response: ApiResponse<AuthResponse> = await authApi.signup({
        email,
        password,
        nickname,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;

        // 토큰 저장
        tokenManager.setTokens(accessToken, refreshToken);

        // 사용자 정보 저장
        setUser(userData);

        return { success: true };
      } else {
        return {
          success: false,
          message: response.error?.message || "회원가입에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      return {
        success: false,
        message: "회원가입 중 오류가 발생했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    } finally {
      // 성공하든 실패하든 로컬 상태는 초기화
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 훅으로 컨텍스트 사용
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내에서 사용해야 합니다.");
  }
  return context;
}
