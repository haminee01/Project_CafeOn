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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          // API로 실제 사용자 정보 조회 (닉네임 포함)
          try {
            const API_BASE_URL =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const userData = await response.json();

              // 응답에서 사용자 정보 추출
              const data = userData.data || userData;
              const userId = data.userId || data.id || data.sub;
              const nickname = data.nickname || data.name || data.username;
              const email = data.email;

              const userInfo: User = {
                id: userId,
                username: nickname,
                email: email || "test@naver.com",
              };

              setUser(userInfo);
              localStorage.setItem("userInfo", JSON.stringify(userInfo));
              setIsLoading(false);
              return;
            }
          } catch (apiError) {
            console.error("/api/users/me 호출 실패, 토큰에서 추출:", apiError);
          }

          // API 실패 시 토큰에서 추출
          const decodedUser = decodeToken(token);
          if (decodedUser) {
            setUser(decodedUser as User);
            localStorage.setItem("userInfo", JSON.stringify(decodedUser));
          }
        } else {
          setUser(null);
        }
      } catch (error) {
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
