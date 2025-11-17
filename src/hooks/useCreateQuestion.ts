import { useState } from "react";
import { getAccessToken } from "@/stores/authStore";

// 가시성 enum
export enum QuestionVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// 문의 등록 요청 타입
export interface CreateQuestionRequest {
  title: string;
  content: string;
  visibility: QuestionVisibility;
}

// 문의 등록 응답 타입
export interface CreateQuestionResponse {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  visibility: QuestionVisibility;
}

// 백엔드 ApiResponse 구조
interface ApiResponse<T> {
  data: T;
  message: string;
  success?: boolean;
}

export const useCreateQuestion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = async (
    questionData: CreateQuestionRequest
  ): Promise<CreateQuestionResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 토큰이 "null" 문자열인지 확인
      if (token === "null" || token === "undefined") {
        throw new Error("유효하지 않은 토큰입니다. 다시 로그인해주세요.");
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

      const url = "http://localhost:8080/api/qna/questions";

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(questionData),
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
        } else if (response.status === 400) {
          throw new Error("요청 데이터가 올바르지 않습니다.");
        } else {
          throw new Error(`문의 등록에 실패했습니다. (${response.status})`);
        }
      }

      const responseText = await response.text();

      const apiResponse: ApiResponse<CreateQuestionResponse> =
        JSON.parse(responseText);

      return apiResponse.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("문의 등록 실패:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createQuestion,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
