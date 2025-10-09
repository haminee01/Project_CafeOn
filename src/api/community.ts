import { fetcher, buildFullUrl } from "./fetcher";
import {
  PostListItem,
  PostListResponse,
  PostDetail as PostDetailType,
  PostCreateResponse,
  PostUpdateRequest,
  PostUpdateResponse,
  PostDeleteResponse,
  PostLikeResponse,
  Comment,
  CommentCreateRequest,
  CommentCreateResponse,
  CommentUpdateResponse,
  CommentDeleteResponse,
  CommentLikeResponse,
  ReportRequest,
  ReportResponse,
} from "@/types/Post";

// BASE_URL은 환경에 따라 다를 수 있습니다. 예: http://localhost:8080
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// --- [ 1. 타입 정의 ] ---

// GET /api/posts/{id}/comments 응답 타입 (댓글 목록)
export type CommentListResponse = Comment[];

// **[추가/수정된 부분]** 백엔드 API의 실제 응답 구조를 정의 (Spring Pageable 응답)
interface BackendPostListResponse {
  message: string;
  data: {
    content: PostListItem[]; // 실제 게시글 리스트
    totalPages: number; // 총 페이지 수
    totalElements: number;
    number: number; // 현재 페이지 (0부터 시작)
    size: number; // 페이지 크기 // 기타 Pageable 정보...
  } | null; // data가 null일 수 있음을 처리
}

// PostDetailResponse는 PostDetail 타입을 사용
export type PostDetailResponse = PostDetailType;

// --- [ 2. API 함수 구현 ] ---

/**
 * GET /api/posts - 커뮤니티 글 목록 조회
 * @param query 검색, 필터링, 정렬을 위한 쿼리 파라미터
 */
export const getPosts = async (
  query: {
    // page 속성을 추가합니다. CommunityList에서 이 값을 사용합니다.
    page: number; // 클라이언트는 1부터 시작하는 페이지 번호를 사용합니다.
    keyword?: string;
    type?: PostListItem["type"];
    sort?: "latest" | "likes" | "views";
  } = { page: 1 } // 기본값으로 page: 1을 설정합니다.
): Promise<PostListResponse> => {
  // URLSearchParams를 사용하여 쿼리 스트링을 깔끔하게 만듭니다.
  const params = new URLSearchParams(); // **[핵심 수정]** 클라이언트 페이지 번호(1부터 시작)에서 1을 빼서 // 백엔드 Spring Data JPA가 사용하는 0부터 시작하는 페이지 번호로 변환합니다.

  const backendPageNumber = Math.max(0, query.page - 1); // 1페이지 요청 시 0으로 변환
  params.append("page", String(backendPageNumber));

  if (query.keyword) params.append("keyword", query.keyword);
  if (query.type) params.append("type", query.type);
  if (query.sort) params.append("sort", query.sort);

  const url = `/api/posts?${params.toString()}`; // 1. fetcher를 사용하여 API 호출. 백엔드 응답 구조를 예상합니다.

  console.log("API 호출 URL:", url);
  console.log("쿼리 파라미터:", {
    page: backendPageNumber,
    keyword: query.keyword,
    type: query.type,
    sort: query.sort,
  });

  const backendResponse = await fetcher<BackendPostListResponse>(url); // 2. 백엔드 응답을 프론트엔드에서 기대하는 PostListResponse 구조로 변환합니다.

  const data = backendResponse.data; // 데이터가 없거나 content가 없는 경우 빈 리스트 반환

  if (!data || !data.content) {
    return {
      posts: [],
      pages: data?.totalPages || 1,
    };
  } // 3. 데이터를 프론트엔드 구조로 매핑하여 반환

  const transformedData: PostListResponse = {
    posts: data.content,
    pages: data.totalPages,
  };

  return transformedData;
};

/**
 * GET /api/posts/{id} - 특정 게시글 상세 조회
 * @param postId 조회할 게시글 ID
 */
export const getPostDetail = async (
  postId: number
): Promise<PostDetailResponse> => {
  const url = `/api/posts/${postId}`;

  console.log(`[API] Fetching post ${postId}`);

  return fetcher<PostDetailResponse>(url);
};

/**
 * GET /api/posts/{id}/comments - 특정 게시글 댓글 목록 조회
 * @param postId 댓글을 조회할 게시글 ID
 */
export const getComments = async (
  postId: number
): Promise<CommentListResponse> => {
  const url = `/api/posts/${postId}/comments`; // 댓글 목록을 가져오는 fetcher 사용
  return fetcher<CommentListResponse>(url);
};

/**
 * POST /api/posts - 게시글 작성 (이미지 포함: FormData 사용)
 */
export async function createPostMutator(
  url: string,
  {
    arg,
  }: {
    arg: {
      title: string;
      content: string;
      type: PostListItem["type"];
      Image?: File[];
    };
  }
): Promise<PostCreateResponse> {
  const formData = new FormData();

  // 게시글 데이터를 JSON으로 추가
  formData.append(
    "postRequestDTO",
    JSON.stringify({
      title: arg.title,
      content: arg.content,
      type: arg.type,
    })
  );

  // 이미지 파일들 추가 (백엔드에서는 "image"로 받음)
  if (arg.Image && arg.Image.length > 0) {
    arg.Image.forEach((file) => {
      formData.append("image", file);
    });
  }

  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {};

  // 토큰이 있는 경우에만 Authorization 헤더 추가
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  console.log("게시글 작성 API 호출:", {
    url: fullUrl,
    hasToken: !!authToken,
    formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? `File: ${value.name}` : value,
    })),
  });

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: formData,
  });

  console.log("API 응답:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    let errorMessage = "게시글 작성 실패";
    let errorDetail = "";

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetail = JSON.stringify(errorData);
    } catch {
      const responseText = await response.text();
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      errorDetail = responseText;
    }

    console.error("API 에러 상세:", {
      status: response.status,
      statusText: response.statusText,
      errorMessage,
      errorDetail,
    });

    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("게시글 작성 성공:", result);

  // 백엔드 응답을 프론트엔드 형식으로 변환
  if (result.data) {
    const postData = result.data;
    return {
      id: postData.id,
      message: result.message || "게시글이 작성되었습니다.",
    };
  }

  return result;
}

/**
 * PUT /api/posts/{id} - 게시글 수정 (이미지 포함: FormData 사용)
 */
export async function updatePostMutator(
  url: string,
  {
    arg,
  }: {
    arg: PostUpdateRequest;
  }
): Promise<PostUpdateResponse> {
  const formData = new FormData();

  // 게시글 데이터를 JSON으로 추가
  formData.append(
    "postRequestDTO",
    JSON.stringify({
      title: arg.title,
      content: arg.content,
      type: arg.type,
    })
  );

  // 이미지 파일들 추가
  if (arg.image && arg.image.length > 0) {
    arg.image.forEach((file) => {
      formData.append("image", file);
    });
  }

  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "PUT",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "게시글 수정 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * DELETE /api/posts/{id} - 게시글 삭제
 */
export async function deletePostMutator(
  postId: number
): Promise<PostDeleteResponse> {
  const url = `/api/posts/${postId}`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    let errorMessage = "게시글 삭제 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * POST /api/posts/{id}/comments - 댓글/대댓글 작성
 * @param postId 게시글 ID
 * @param arg 댓글 내용 및 부모 댓글 ID (대댓글일 경우)
 */
export async function createCommentMutator(
  postId: number,
  arg: CommentCreateRequest
): Promise<CommentCreateResponse> {
  const url = `/api/posts/${postId}/comments`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    let errorMessage = "댓글 작성 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * PUT /api/posts/{post_id}/comments/{comment_id} - 댓글 수정
 */
export const updateCommentMutator = async (
  postId: number,
  commentId: number,
  arg: { content: string }
): Promise<CommentUpdateResponse> => {
  const url = `/api/posts/${postId}/comments/${commentId}`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    let errorMessage = "댓글 수정 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * DELETE /api/posts/{post_id}/comments/{comment_id} - 댓글 삭제
 */
export const deleteCommentMutator = async (
  postId: number,
  commentId: number
): Promise<CommentDeleteResponse> => {
  const url = `/api/posts/${postId}/comments/${commentId}`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "DELETE",
    headers,
  });

  if (response.status === 204 || response.status === 200) {
    return { message: "댓글이 삭제되었습니다." };
  }

  if (!response.ok) {
    let errorMessage = "댓글 삭제 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * POST /api/comments/{id}/like - 댓글 좋아요/취소 토글
 * @param commentId 좋아요를 누를 댓글 ID
 */
export const toggleCommentLike = async (
  commentId: number
): Promise<CommentLikeResponse> => {
  const url = `/api/comments/${commentId}/like`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    let errorMessage = "좋아요 처리 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * POST /api/posts/{id}/like - 게시글 좋아요/취소 토글
 * @param postId 좋아요를 누를 게시글 ID
 */
export const togglePostLike = async (
  postId: number
): Promise<PostLikeResponse> => {
  const url = `/api/posts/${postId}/like`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    let errorMessage = "좋아요 처리 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * POST /api/reports - 신고하기
 * @param reportData 신고 데이터
 */
export const createReport = async (
  reportData: ReportRequest
): Promise<ReportResponse> => {
  const url = `/api/reports`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    let errorMessage = "신고 처리 실패";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};
