import { useState, useEffect } from "react";
import { MyPost, MyPostsResponse, MyPostsParams } from "@/types/Post";

export const useMyPosts = (params: MyPostsParams = {}) => {
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async (fetchParams: MyPostsParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
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

      const url = `http://localhost:8080/api/my/posts?${searchParams.toString()}`;

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
            `내가 쓴 글 목록을 가져오는데 실패했습니다. (${response.status})`
          );
        }
      }

      const apiResponse: MyPostsResponse = await response.json();

      const pageData = apiResponse.data;

      setPosts(pageData.content || []);
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
    fetchMyPosts(params);
  }, [params.page, params.size]);

  return {
    posts,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: () => fetchMyPosts(params),
    fetchWithParams: fetchMyPosts,
  };
};
