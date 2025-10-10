import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  email: string;
}

// JWT 토큰에서 사용자 정보 추출
const decodeToken = (token: string): Partial<User> | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    console.log("JWT 토큰 디코딩 결과:", {
      sub: decoded.sub,
      userId: decoded.userId,
      role: decoded.role,
      nickname: decoded.nickname,
      username: decoded.username,
      email: decoded.email,
    });

    // JWT에 nickname이 있으면 사용, 없으면 기본값 사용
    const userId = decoded.sub;
    const username = decoded.nickname || decoded.username || "사용자";

    return {
      id: userId,
      username: username,
      email: decoded.email || "test@naver.com",
    };
  } catch (error) {
    console.error("토큰 디코딩 실패:", error);
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userInfo = localStorage.getItem("userInfo");

        if (token) {
          // userInfo가 있으면 사용, 없으면 토큰에서 추출
          if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
          } else {
            // 토큰에서 사용자 정보 추출
            const decodedUser = decodeToken(token);
            if (decodedUser) {
              setUser(decodedUser as User);
              // 추출한 정보를 로컬 스토리지에 저장
              localStorage.setItem("userInfo", JSON.stringify(decodedUser));
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("인증 정보 확인 중 오류:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 사용자 정보 업데이트 함수 (로그인 시 호출)
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("refreshToken");
  };

  const isLoggedIn = !!user;
  const currentUserId = user?.id;

  return {
    user,
    isLoggedIn,
    currentUserId,
    isLoading,
    updateUser,
    logout,
  };
};
