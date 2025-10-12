import { useState, useEffect } from "react";

// 문의 상태 enum
export enum QuestionStatus {
  PENDING = "PENDING",
  ANSWERED = "ANSWERED",
}

// 가시성 enum
export enum QuestionVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// 문의 데이터 타입
export interface MyQuestion {
  id: number;
  title: string;
  authorNickname: string;
  createdAt: string;
  visibility: QuestionVisibility;
  status: QuestionStatus;
  content?: string; // 상세 내용은 별도 API로 가져올 수 있음
}

// Spring Boot Page 객체 구조
interface PageResponse {
  content: MyQuestion[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 백엔드 ApiResponse 구조
interface MyQuestionsResponse {
  data: PageResponse;
  message: string;
  success?: boolean;
}

// API 호출 파라미터 타입
interface MyQuestionsParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const useMyQuestions = (params: MyQuestionsParams = {}) => {
  const [questions, setQuestions] = useState<MyQuestion[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyQuestions = async (fetchParams: MyQuestionsParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      console.log("🔍 토큰 확인:", token ? "토큰 존재" : "토큰 없음");
      console.log("🔍 토큰 길이:", token ? token.length : 0);
      console.log(
        "🔍 토큰 형식:",
        token
          ? token.includes(".")
            ? "JWT 형식"
            : "JWT 형식 아님"
          : "토큰 없음"
      );

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 토큰이 "null" 문자열인지 확인
      if (token === "null" || token === "undefined") {
        console.log("🔍 잘못된 토큰 값:", token);
        throw new Error("유효하지 않은 토큰입니다. 다시 로그인해주세요.");
      }

      // 토큰에서 role 확인
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        console.log("🔍 토큰 payload:", decoded);
        console.log("🔍 토큰 role:", decoded.role);
        console.log("🔍 토큰 userId:", decoded.userId);
      } catch (e) {
        console.log("🔍 토큰 디코딩 실패:", e);
      }

      // URL 파라미터 구성
      const searchParams = new URLSearchParams();
      if (fetchParams.page)
        searchParams.append("page", fetchParams.page.toString());
      if (fetchParams.size)
        searchParams.append("size", fetchParams.size.toString());
      if (fetchParams.keyword)
        searchParams.append("keyword", fetchParams.keyword);

      const url = `http://localhost:8080/api/my/questions?${searchParams.toString()}`;
      console.log("🔍 API 호출 URL:", url);

      // 다른 API 테스트 (권한이 있는 엔드포인트)
      console.log(
        "🔍 다른 API 테스트를 위해 /api/user 엔드포인트도 시도해보겠습니다."
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
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
        } else if (response.status === 404) {
          throw new Error("API 엔드포인트를 찾을 수 없습니다.");
        } else {
          throw new Error(
            `문의 목록을 가져오는데 실패했습니다. (${response.status})`
          );
        }
      }

      const apiResponse: MyQuestionsResponse = await response.json();
      console.log("🔍 API 응답 데이터:", apiResponse);

      const pageData = apiResponse.data;

      setQuestions(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("문의 목록 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMyQuestions(params);
  }, [params.page, params.size, params.keyword]);

  return {
    questions,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: () => fetchMyQuestions(params),
    fetchWithParams: fetchMyQuestions,
  };
};
