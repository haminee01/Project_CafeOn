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
interface BackendPostListItem {
  id: number;
  type: string;
  title: string;
  authorNickname: string; // 백엔드에서 전송하는 필드명
  createdAt: string; // 백엔드에서 전송하는 필드명
  viewCount: number; // 백엔드에서 전송하는 필드명
  likeCount: number; // 백엔드에서 전송하는 필드명
  commentCount: number; // 백엔드에서 전송하는 필드명
  likedByMe: boolean; // 백엔드에서 전송하는 필드명
}

interface BackendPostListResponse {
  message: string;
  data: {
    content: BackendPostListItem[]; // 실제 게시글 리스트
    totalPages: number; // 총 페이지 수
    totalElements: number;
    number: number; // 현재 페이지 (0부터 시작)
    size: number; // 페이지 크기 // 기타 Pageable 정보...
  } | null; // data가 null일 수 있음을 처리
}

// 백엔드 PostDetail API 응답 구조
interface BackendPostDetailResponse {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  type: string;
  viewCount: number;
  images: Array<{
    id: number;
    originalFileName: string;
    storedFileName: string;
    imageUrl: string;
  }>;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

interface BackendPostDetailApiResponse {
  message: string;
  data: BackendPostDetailResponse;
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

  // 백엔드 응답을 프론트엔드 형식으로 변환
  const transformedPosts: PostListItem[] = data.content.map((backendPost) => ({
    id: backendPost.id,
    type: backendPost.type as PostListItem["type"],
    title: backendPost.title,
    author: backendPost.authorNickname, // authorNickname -> author로 매핑
    created_at: backendPost.createdAt, // createdAt -> created_at으로 매핑
    views: backendPost.viewCount, // viewCount -> views로 매핑
    likes: backendPost.likeCount, // likeCount -> likes로 매핑
    comments: backendPost.commentCount, // commentCount -> comments로 매핑
  }));

  const transformedData: PostListResponse = {
    posts: transformedPosts,
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

  const backendResponse = await fetcher<BackendPostDetailApiResponse>(url);

  // 백엔드 응답을 프론트엔드 형식으로 변환
  const backendData = backendResponse.data;

  const transformedData: PostDetailResponse = {
    id: backendData.id,
    type: backendData.type as PostDetailType["type"],
    title: backendData.title,
    author: backendData.authorNickname, // authorNickname -> author로 매핑
    created_at: backendData.createdAt, // createdAt -> created_at으로 매핑
    views: backendData.viewCount, // viewCount -> views로 매핑
    likes: backendData.likeCount, // likeCount -> likes로 매핑
    comments: 0, // 댓글 수는 별도 API로 조회
    content: backendData.content,
    Images: backendData.images.map((img) => img.imageUrl), // 이미지 URL 배열로 변환
    likedByMe: backendData.likedByMe,
  };

  return transformedData;
};

// 백엔드 댓글 응답 구조
interface BackendComment {
  commentId: number;
  parentId: number | null;
  postId: number;
  authorName: string;
  content: string;
  createdAt: string;
  children: BackendComment[];
  likeCount: number;
  likedByMe: boolean;
}

interface BackendCommentListResponse {
  message: string;
  data: {
    content: BackendComment[];
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

/**
 * GET /api/posts/{id}/comments - 특정 게시글 댓글 목록 조회
 * @param postId 댓글을 조회할 게시글 ID
 */
export const getComments = async (
  postId: number
): Promise<CommentListResponse> => {
  const url = `/api/posts/${postId}/comments`;

  console.log(`[API] Fetching comments for post ${postId}`);

  try {
    const backendResponse = await fetcher<BackendCommentListResponse>(url);
    console.log("댓글 목록 응답:", backendResponse);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const commentsData = backendResponse.data?.content || [];
    console.log("댓글 데이터:", commentsData);

    const transformedComments: Comment[] = commentsData.map(
      (backendComment) => ({
        id: backendComment.commentId,
        author: backendComment.authorName,
        content: backendComment.content,
        likes: backendComment.likeCount,
        created_at: backendComment.createdAt,
        replies:
          backendComment.children?.map((child) => ({
            id: child.commentId,
            author: child.authorName,
            content: child.content,
            likes: child.likeCount,
            created_at: child.createdAt,
            replies: [],
            likedByMe: child.likedByMe,
            parent_id: child.parentId,
            children: [],
          })) || [],
        likedByMe: backendComment.likedByMe,
        parent_id: backendComment.parentId,
        children:
          backendComment.children?.map((child) => ({
            id: child.commentId,
            author: child.authorName,
            content: child.content,
            likes: child.likeCount,
            created_at: child.createdAt,
            replies: [],
            likedByMe: child.likedByMe,
            parent_id: child.parentId,
            children: [],
          })) || [],
      })
    );

    console.log("변환된 댓글 목록:", transformedComments);
    return transformedComments;
  } catch (error) {
    console.error("댓글 목록 조회 실패:", error);
    throw error;
  }
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

  // 게시글 데이터를 JSON으로 추가 (백엔드 @RequestPart 구조에 맞춤)
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
    tokenPreview: authToken ? authToken.substring(0, 20) + "..." : null,
    formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? `File: ${value.name}` : value,
    })),
  });

  // 이미지가 없으면 JSON API 사용
  if (!arg.Image || arg.Image.length === 0) {
    console.log("이미지 없음 - JSON API 사용");

    const jsonResponse = await fetch(fullUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: arg.title,
        content: arg.content,
        type: arg.type,
      }),
    });

    console.log("JSON API 응답:", {
      status: jsonResponse.status,
      statusText: jsonResponse.statusText,
      ok: jsonResponse.ok,
    });

    if (!jsonResponse.ok) {
      let errorMessage = "게시글 작성 실패";
      let errorDetail = "";

      try {
        const errorData = await jsonResponse.json();
        errorMessage = errorData.message || errorMessage;
        errorDetail = JSON.stringify(errorData);
      } catch {
        const responseText = await jsonResponse.text();
        errorMessage = `HTTP ${jsonResponse.status}: ${jsonResponse.statusText}`;
        errorDetail = responseText;
      }

      console.error("JSON API 에러 상세:", {
        status: jsonResponse.status,
        statusText: jsonResponse.statusText,
        errorMessage,
        errorDetail,
      });

      throw new Error(errorMessage);
    }

    const result = await jsonResponse.json();
    console.log("JSON API 게시글 작성 성공:", result);

    if (result.data) {
      const postData = result.data;
      return {
        id: postData.id,
        message: result.message || "게시글이 작성되었습니다.",
      };
    }

    return result;
  }

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
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // 이미지가 있는 경우 FormData 사용, 없는 경우 JSON 사용
  const hasImages = arg.image && arg.image.length > 0;

  let response: Response;

  if (hasImages) {
    // 이미지가 있는 경우 FormData 사용
    const formData = new FormData();

    // 게시글 데이터를 JSON으로 추가 (백엔드 @RequestPart 구조에 맞춤)
    formData.append(
      "postRequestDTO",
      JSON.stringify({
        title: arg.title,
        content: arg.content,
        type: arg.type,
      })
    );

    // 이미지 파일들 추가
    arg.image?.forEach((file: File) => {
      formData.append("image", file);
    });

    // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
    delete headers["Content-Type"];

    response = await fetch(fullUrl, {
      method: "PUT",
      headers,
      body: formData,
    });
  } else {
    // 이미지가 없는 경우 JSON으로만 전송
    const requestBody = {
      title: arg.title,
      content: arg.content,
      type: arg.type,
    };

    response = await fetch(fullUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(requestBody),
    });
  }

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

  // 응답이 비어있거나 JSON이 아닐 수 있으므로 안전하게 처리
  try {
    const responseText = await response.text();
    if (responseText) {
      return JSON.parse(responseText);
    } else {
      // 빈 응답인 경우 기본 메시지 반환
      return { message: "게시글이 삭제되었습니다." };
    }
  } catch {
    // JSON 파싱 실패 시 기본 메시지 반환
    return { message: "게시글이 삭제되었습니다." };
  }
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

  console.log("댓글 작성 API 요청:", {
    url: fullUrl,
    method: "POST",
    headers,
    body: JSON.stringify(arg),
    arg,
  });

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
 * POST /api/posts/{postId}/reports - 게시글 신고하기
 * @param postId 신고할 게시글 ID
 * @param content 신고 사유
 */
export const createPostReport = async (
  postId: number,
  content: string
): Promise<{ message: string }> => {
  const url = `/api/posts/${postId}/reports`;
  const fullUrl = buildFullUrl(url);

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  console.log("게시글 신고 API 요청:", {
    url: fullUrl,
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
    postId,
    content,
  });

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
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

  const result = await response.json();
  console.log("게시글 신고 API 응답:", result);
  return result;
};

/**
 * POST /api/reports - 신고하기 (기존 함수 유지)
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

  console.log("신고 API 요청:", {
    url: fullUrl,
    method: "POST",
    headers,
    body: JSON.stringify(reportData),
    reportData,
  });

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

  const result = await response.json();
  console.log("신고 API 응답:", result);
  return result;
};

// 댓글 신고 API
export const createCommentReport = async (
  commentId: number,
  content: string
): Promise<{ message: string }> => {
  const url = `/api/comment/${commentId}/reports`;
  const fullUrl = buildFullUrl(url);

  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  console.log("댓글 신고 API 요청:", {
    url: fullUrl,
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
    commentId,
    content,
  });

  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
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

  const result = await response.json();
  console.log("댓글 신고 API 응답:", result);
  return result;
};
