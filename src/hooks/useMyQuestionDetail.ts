import { useState, useEffect } from "react";
import { getAccessToken } from "@/stores/authStore";

// 문의 상세 응답 타입
export interface MyQuestionDetailResponse {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "ANSWERED";
  visibility: "PUBLIC" | "PRIVATE";
}

// 백엔드 ApiResponse 구조
interface ApiResponse<T> {
  data: T;
  message: string;
  success?: boolean;
}

export const useMyQuestionDetail = (questionId: number | null) => {
  const [question, setQuestion] = useState<MyQuestionDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionDetail = async () => {
    if (!questionId) {
      setQuestion(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAccessToken();

      if (!token || token === "null" || token === "undefined") {
        throw new Error("로그인이 필요합니다.");
      }

      // 토큰 만료 시간 확인
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = decoded.exp;

        if (currentTime >= expirationTime) {
          throw new Error("토큰이 만료되었습니다. 다시 로그인해주세요.");
        }
      } catch (e) {}

      const url = `http://localhost:8080/api/my/questions/${questionId}`;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();

        // JSON 응답 파싱 시도
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            throw new Error(errorJson.message);
          }
        } catch (parseError) {}

        if (response.status === 401) {
          throw new Error("인증이 필요합니다.");
        } else if (response.status === 403) {
          throw new Error("접근 권한이 없습니다.");
        } else if (response.status === 404) {
          throw new Error("존재하지 않는 문의입니다.");
        } else {
          throw new Error(
            `문의 상세 조회에 실패했습니다. (${response.status})`
          );
        }
      }

      const responseText = await response.text();

      const apiResponse: ApiResponse<MyQuestionDetailResponse> =
        JSON.parse(responseText);

      setQuestion(apiResponse.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionDetail();
  }, [questionId]);

  const refetch = () => {
    fetchQuestionDetail();
  };

  return {
    question,
    isLoading,
    error,
    refetch,
    clearError: () => setError(null),
  };
};
