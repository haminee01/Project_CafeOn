import { useState, useEffect } from "react";
import { MyComment, MyCommentsResponse, MyCommentsParams } from "@/types/post";

export const useMyComments = (params: MyCommentsParams = {}) => {
  const [comments, setComments] = useState<MyComment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyComments = async (fetchParams: MyCommentsParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      console.log(
        "🔍 내가 쓴 댓글 조회 - 토큰 확인:",
        token ? "토큰 존재" : "토큰 없음"
      );

      if (!token || token === "null" || token === "undefined") {
        throw new Error("로그인이 필요합니다.");
      }

      // URL 파라미터 구성
      const searchParams = new URLSearchParams();
      if (fetchParams.page) {
        searchParams.append("page", fetchParams.page.toString());
      }
      if (fetchParams.size) {
        searchParams.append("size", fetchParams.size.toString());
      }

      const url = `http://localhost:8080/api/my/comments?${searchParams.toString()}`;
      console.log("🔍 내가 쓴 댓글 조회 API 호출 URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      console.log("🔍 내가 쓴 댓글 조회 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🔍 내가 쓴 댓글 조회 에러 응답:", errorText);

        if (response.status === 401) {
          throw new Error("인증이 필요합니다.");
        } else if (response.status === 403) {
          throw new Error("접근 권한이 없습니다.");
        } else if (response.status === 404) {
          throw new Error("API 엔드포인트를 찾을 수 없습니다.");
        } else {
          throw new Error(
            `내가 쓴 댓글 목록을 가져오는데 실패했습니다. (${response.status})`
          );
        }
      }

      const apiResponse: MyCommentsResponse = await response.json();
      console.log("🔍 내가 쓴 댓글 조회 API 응답 데이터:", apiResponse);

      const pageData = apiResponse.data;

      setComments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("내가 쓴 댓글 목록 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMyComments(params);
  }, [params.page, params.size]);

  return {
    comments,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: () => fetchMyComments(params),
    fetchWithParams: fetchMyComments,
  };
};
