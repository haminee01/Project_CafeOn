import { useState } from "react";

// 문의 수정 요청 타입
export interface UpdateQuestionRequest {
  title: string;
  content: string;
  visibility: "PUBLIC" | "PRIVATE";
}

// 백엔드 ApiResponse 구조
interface ApiResponse<T> {
  data?: T;
  message: string;
  success?: boolean;
}

export const useMyQuestionActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 문의 수정
  const updateQuestion = async (
    questionId: number,
    updateData: UpdateQuestionRequest
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");

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
      } catch (e) {
        console.log("🔍 토큰 디코딩 실패:", e);
      }

      const url = `http://localhost:8080/api/my/questions/${questionId}`;
      console.log("🔍 문의 수정 URL:", url);
      console.log("🔍 수정 데이터:", updateData);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      console.log("🔍 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🔍 에러 응답 내용:", errorText);

        // JSON 응답 파싱 시도
        try {
          const errorJson = JSON.parse(errorText);
          console.log("🔍 파싱된 에러 응답:", errorJson);
          if (errorJson.message) {
            throw new Error(errorJson.message);
          }
        } catch (parseError) {
          console.log("🔍 JSON 파싱 실패:", parseError);
        }

        if (response.status === 401) {
          throw new Error("인증이 필요합니다.");
        } else if (response.status === 403) {
          throw new Error("접근 권한이 없습니다.");
        } else if (response.status === 404) {
          throw new Error("존재하지 않는 문의입니다.");
        } else if (response.status === 409) {
          throw new Error("답변이 등록된 문의는 수정할 수 없습니다.");
        } else {
          throw new Error(`문의 수정에 실패했습니다. (${response.status})`);
        }
      }

      const responseText = await response.text();
      console.log("🔍 원본 응답 텍스트:", responseText);

      const apiResponse: ApiResponse<any> = JSON.parse(responseText);
      console.log("🔍 파싱된 API 응답 데이터:", apiResponse);

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("문의 수정 실패:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 문의 삭제
  const deleteQuestion = async (questionId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");

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
      } catch (e) {
        console.log("🔍 토큰 디코딩 실패:", e);
      }

      const url = `http://localhost:8080/api/my/questions/${questionId}`;
      console.log("🔍 문의 삭제 URL:", url);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
        credentials: "include",
      });

      console.log("🔍 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🔍 에러 응답 내용:", errorText);

        // JSON 응답 파싱 시도
        try {
          const errorJson = JSON.parse(errorText);
          console.log("🔍 파싱된 에러 응답:", errorJson);
          if (errorJson.message) {
            throw new Error(errorJson.message);
          }
        } catch (parseError) {
          console.log("🔍 JSON 파싱 실패:", parseError);
        }

        if (response.status === 401) {
          throw new Error("인증이 필요합니다.");
        } else if (response.status === 403) {
          throw new Error("접근 권한이 없습니다.");
        } else if (response.status === 404) {
          throw new Error("존재하지 않는 문의입니다.");
        } else if (response.status === 409) {
          throw new Error("답변이 등록된 문의는 삭제할 수 없습니다.");
        } else {
          throw new Error(`문의 삭제에 실패했습니다. (${response.status})`);
        }
      }

      const responseText = await response.text();
      console.log("🔍 원본 응답 텍스트:", responseText);

      const apiResponse: ApiResponse<any> = JSON.parse(responseText);
      console.log("🔍 파싱된 API 응답 데이터:", apiResponse);

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("문의 삭제 실패:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateQuestion,
    deleteQuestion,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
