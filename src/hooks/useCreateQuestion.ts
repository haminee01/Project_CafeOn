import { useState } from "react";

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
      const token = localStorage.getItem("accessToken");
      console.log("🔍 토큰 확인:", token ? "토큰 존재" : "토큰 없음");

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 토큰이 "null" 문자열인지 확인
      if (token === "null" || token === "undefined") {
        console.log("🔍 잘못된 토큰 값:", token);
        throw new Error("유효하지 않은 토큰입니다. 다시 로그인해주세요.");
      }

      // 토큰 만료 시간 확인
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = decoded.exp;

        console.log("🔍 토큰 만료 시간:", new Date(expirationTime * 1000));
        console.log("🔍 현재 시간:", new Date(currentTime * 1000));
        console.log(
          "🔍 토큰 만료 여부:",
          currentTime >= expirationTime ? "만료됨" : "유효함"
        );

        if (currentTime >= expirationTime) {
          throw new Error("토큰이 만료되었습니다. 다시 로그인해주세요.");
        }
      } catch (e) {
        console.log("🔍 토큰 디코딩 실패:", e);
      }

      const url = "http://localhost:8080/api/qna/questions";
      console.log("🔍 API 호출 URL:", url);
      console.log("🔍 요청 데이터:", questionData);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      console.log("🔍 요청 헤더:", {
        ...headers,
        Authorization: `Bearer ${token.substring(0, 20)}...`, // 토큰 일부만 로깅
      });

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(questionData),
      });

      console.log("🔍 응답 상태:", response.status);
      console.log(
        "🔍 응답 헤더:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🔍 에러 응답 내용:", errorText);
        console.log("🔍 에러 응답 길이:", errorText.length);

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

      const apiResponse: ApiResponse<CreateQuestionResponse> =
        await response.json();
      console.log("🔍 API 응답 데이터:", apiResponse);

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
