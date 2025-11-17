import { useState, useEffect } from "react";
import {
  MyLikedPost,
  MyLikedPostsResponse,
  MyLikedPostsParams,
} from "@/types/Post";
import { getAccessToken } from "@/stores/authStore";

export const useMyLikedPosts = (params: MyLikedPostsParams = {}) => {
  const [likedPosts, setLikedPosts] = useState<MyLikedPost[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyLikedPosts = async (fetchParams: MyLikedPostsParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAccessToken();

      if (!token || token === "null" || token === "undefined") {
        throw new Error("로그인이 필요합니다.");
      }

      const searchParams = new URLSearchParams();
      if (fetchParams.page) {
        searchParams.append("page", fetchParams.page.toString());
      }
      if (fetchParams.size) {
        searchParams.append("size", fetchParams.size.toString());
      }

      const url = `http://localhost:8080/api/my/likes/posts?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401) {
          throw new Error("인증이 필요합니다.");
        } else if (response.status === 403) {
          throw new Error("접근 권한이 없습니다.");
        } else if (response.status === 404) {
          throw new Error("API 엔드포인트를 찾을 수 없습니다.");
        } else {
          throw new Error(
            `내가 좋아요한 글 목록을 가져오는데 실패했습니다. (${response.status})`
          );
        }
      }

      const apiResponse: MyLikedPostsResponse = await response.json();

      const pageData = apiResponse.data;

      setLikedPosts(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLikedPosts(params);
  }, [params.page, params.size]);

  return {
    likedPosts,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: () => fetchMyLikedPosts(params),
    fetchWithParams: fetchMyLikedPosts,
  };
};
