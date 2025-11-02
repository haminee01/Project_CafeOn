"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  id?: string; // userId의 alias (호환성)
  email: string;
  nickname: string;
  username?: string; // 호환성을 위한 필드 (nickname의 alias)
  name?: string;
  phone?: string;
  role?: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggedIn: boolean; // useAuth.ts 호환성
  currentUserId: string | undefined; // useAuth.ts 호환성
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
    const fetchUserInfo = async () => {
      const storedToken = localStorage.getItem("accessToken");

      console.log("[AuthContext] 초기 로드 - 토큰 존재:", !!storedToken);

      // 토큰이 없으면 인증되지 않은 상태로 처리
      if (!storedToken) {
        console.log("[AuthContext] 토큰 없음 - 비인증 상태로 처리");
        // 토큰이 없는데 사용자 정보만 남아있으면 정리
        if (localStorage.getItem("user") || localStorage.getItem("userInfo")) {
          localStorage.removeItem("user");
          localStorage.removeItem("userInfo");
        }
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // 토큰이 있으면 API로 사용자 정보 조회
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("✅ [AuthContext] /api/users/me 응답:", userData);

          const data = userData.data || userData;
          const authUser: User = {
            userId: data.userId || data.id,
            id: data.userId || data.id,
            nickname: data.nickname,
            username: data.nickname,
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: data.role,
            profileImageUrl: data.profileImageUrl,
          };

          console.log("✅ [AuthContext] 사용자 정보 설정:", authUser);
          setUser(authUser);
          setToken(storedToken);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(authUser));
        } else {
          console.error("[AuthContext] /api/users/me 실패:", response.status);
          // API 실패 시 토큰 삭제
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("userInfo");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("[AuthContext] API 호출 오류:", error);
        // 에러 시 토큰 삭제
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userInfo");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
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
        isLoggedIn: isAuthenticated, // useAuth.ts 호환성
        currentUserId: user?.userId || user?.id, // useAuth.ts 호환성
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
