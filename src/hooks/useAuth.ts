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

    // JWT에서 사용자 정보 추출 (여러 필드 시도)
    const userId = decoded.sub || decoded.userId || decoded.id;
    const username = decoded.nickname || decoded.username || "사용자";
    const userEmail = decoded.email || "test@naver.com";

    console.log("JWT 토큰에서 추출한 사용자 정보:", {
      userId,
      username,
      userEmail,
      decoded,
    });

    return {
      id: userId,
      username: username,
      email: userEmail,
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
