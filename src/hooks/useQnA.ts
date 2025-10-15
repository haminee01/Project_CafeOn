import { useState, useEffect } from "react";
import {
  QuestionListItem,
  QuestionDetail,
  CreateQuestionRequest,
  CreateQuestionResponse,
  QuestionListParams,
  QuestionListResponse,
  QuestionVisibility,
  ApiResponse,
  Answer,
} from "@/types/qna";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// 토큰 가져오기 함수
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// 문의 목록 조회 훅
export const useQuestionList = (params: QuestionListParams) => {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString(),
      });

      if (params.keyword) {
        queryParams.append("keyword", params.keyword);
      }

      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/qna/questions?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<QuestionListResponse> =
        await response.json();
      const data = apiResponse.data;

      // 비공개 글 제목 및 작성자 마스킹 처리
      const maskedQuestions = data.content.map((question) => ({
        ...question,
        title:
          question.visibility === QuestionVisibility.PRIVATE
            ? "비공개 문의"
            : question.title,
        authorNickname:
          question.visibility === QuestionVisibility.PRIVATE
            ? "***"
            : question.authorNickname,
      }));

      setQuestions(maskedQuestions);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "문의 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [params.page, params.size, params.keyword]);

  return {
    questions,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: fetchQuestions,
  };
};

// 문의 상세 조회 훅
export const useQuestionDetail = (id: number) => {
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/qna/questions/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<QuestionDetail> = await response.json();
      setQuestion(apiResponse.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문의를 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  return {
    question,
    isLoading,
    error,
    refetch: fetchQuestion,
  };
};

// 문의 등록 훅
export const useCreateQuestion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = async (
    data: CreateQuestionRequest
  ): Promise<CreateQuestionResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        // 다양한 토큰 형식 시도
        headers.Authorization = `Bearer ${token}`;
        headers["X-Auth-Token"] = token; // 대안 1
        headers["Accept"] = "application/json";
        console.log(
          "🔍 QnA API 요청 - 토큰 존재:",
          token.substring(0, 20) + "..."
        );
        console.log("🔍 QnA API 요청 - 전체 토큰:", token);
      } else {
        console.log("🔍 QnA API 요청 - 토큰 없음");
      }

      console.log("🔍 QnA API 요청 데이터:", data);
      console.log("🔍 QnA API 요청 헤더:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      });
      console.log("🔍 QnA API 전체 토큰:", token);

      // Authorization Bearer 토큰으로 시도
      const response = await fetch(`${API_BASE_URL}/api/qna/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      console.log("🔍 QnA API 응답 상태:", response.status);
      console.log(
        "🔍 QnA API 응답 헤더:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🔍 QnA API 에러 응답:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const apiResponse: ApiResponse<CreateQuestionResponse> =
        await response.json();
      return apiResponse.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문의 등록에 실패했습니다."
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createQuestion,
    isLoading,
    error,
  };
};

// 답변 목록 조회 훅
export const useAnswerList = (questionId: number) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = async () => {
    if (!questionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/qna/questions/${questionId}/answers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      console.log("답변 API 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("답변 API 에러 응답:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const apiResponse: ApiResponse<Answer[]> = await response.json();
      console.log("답변 API 성공 응답:", apiResponse);
      setAnswers(apiResponse.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "답변을 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [questionId]);

  return {
    answers,
    isLoading,
    error,
    refetch: fetchAnswers,
  };
};
