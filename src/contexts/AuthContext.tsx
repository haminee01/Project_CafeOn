"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  email: string;
  nickname: string;
  name?: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 초기 로드 시 로컬 스토리지에서 인증 정보 복원
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    
    // 토큰이 없으면 인증되지 않은 상태로 처리
    if (!storedToken) {
      // 토큰이 없는데 사용자 정보만 남아있으면 정리
      if (localStorage.getItem("user") || localStorage.getItem("userInfo")) {
        localStorage.removeItem("user");
        localStorage.removeItem("userInfo");
      }
      setIsLoading(false);
      return;
    }

    // 토큰이 있으면 사용자 정보 확인
    const storedUser =
      localStorage.getItem("user") || localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        setToken(storedToken);
        const userData = JSON.parse(storedUser);
        // userInfo 형식을 AuthContext User 형식으로 변환
        const authUser = userData.userId
          ? userData
          : {
              userId: userData.id,
              nickname: userData.username || userData.nickname,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              role: userData.role,
            };
        setUser(authUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
        // 파싱 오류 시 모든 정보 삭제
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userInfo");
        setIsAuthenticated(false);
      }
    } else {
      // 토큰은 있지만 사용자 정보가 없으면 토큰도 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const login = (
    accessToken: string,
    refreshToken: string,
    userData?: User
  ) => {
    // 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // 사용자 정보 저장
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    setToken(accessToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // 로컬 스토리지 정리 (모든 관련 데이터 삭제)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo"); // userInfo도 삭제

    // 상태 초기화
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // 홈 페이지로 리다이렉트
    router.push("/");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
