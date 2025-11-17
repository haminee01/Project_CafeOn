import { fetcher, buildFullUrl, API_BASE_URL } from "./fetcher";
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// GET /api/posts/{id}/comments 응답 타입 (댓글 목록)
export type CommentListResponse = Comment[];

interface BackendPostListItem {
  id: number;
  type: string;
  title: string;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

interface BackendPostListResponse {
  message: string;
  data: {
    content: BackendPostListItem[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
  } | null;
}

// 백엔드 PostDetail API 응답 구조
interface BackendPostDetailResponse {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  authorId?: string;
  authorUserId?: string;
  authorProfileImageUrl: string | null;
  type: string;
  viewCount: number;
  images?: Array<
    | {
        imageId?: number;
        id?: number;
        fileName?: string;
        publicUrl?: string; // S3 공개 URL
        imageUrl?: string;
        url?: string;
      }
    | string
  >;
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

/**
 * GET /api/posts - 커뮤니티 글 목록 조회
 * @param query 검색, 필터링, 정렬을 위한 쿼리 파라미터
 */
export const getPosts = async (
  query: {
    page: number;
    keyword?: string;
    type?: PostListItem["type"];
    sort?: "latest" | "likes" | "views";
  } = { page: 1 }
): Promise<PostListResponse> => {
  const params = new URLSearchParams();

  const backendPageNumber = Math.max(0, query.page - 1);
  params.append("page", String(backendPageNumber));

  if (query.keyword) params.append("keyword", query.keyword);
  if (query.type) params.append("type", query.type);
  if (query.sort) params.append("sort", query.sort);

  const url = `/api/posts?${params.toString()}`;

  const backendResponse = await fetcher<BackendPostListResponse>(url);

  const data = backendResponse.data;

  if (!data || !data.content) {
    return {
      posts: [],
      pages: data?.totalPages || 1,
    };
  }

  const transformedPosts: PostListItem[] = data.content.map((backendPost) => ({
    id: backendPost.id,
    type: backendPost.type as PostListItem["type"],
    title: backendPost.title,
    author: backendPost.authorNickname,
    authorProfileImageUrl: backendPost.authorProfileImageUrl,
    created_at: backendPost.createdAt,
    views: backendPost.viewCount,
    likes: backendPost.likeCount,
    comments: backendPost.commentCount,
    likedByMe: backendPost.likedByMe,
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

  const backendResponse = await fetcher<BackendPostDetailApiResponse>(url);

  const backendData = backendResponse.data;

  let imageUrls: string[] = [];

  if (backendData.images && Array.isArray(backendData.images)) {
    if (backendData.images.length > 0) {
      const firstItem = backendData.images[0];

      if (typeof firstItem === "string") {
        imageUrls = backendData.images as string[];
      } else if (firstItem && typeof firstItem === "object") {
        imageUrls = backendData.images
          .map((img: any) => {
            const url = img.publicUrl || img.imageUrl || img.url || "";
            return url ? decodeURIComponent(url) : "";
          })
          .filter(Boolean) as string[];
      }
    }
  }

  const transformedData: PostDetailResponse = {
    id: backendData.id,
    type: backendData.type as PostDetailType["type"],
    title: backendData.title,
    author: backendData.authorNickname,
    authorId: backendData.authorId || backendData.authorUserId,
    authorProfileImageUrl: backendData.authorProfileImageUrl,
    created_at: backendData.createdAt,
    updated_at: backendData.updatedAt,
    views: backendData.viewCount,
    likes: backendData.likeCount,
    comments: 0,
    content: backendData.content,
    Images: imageUrls,
    likedByMe: backendData.likedByMe,
  };

  return transformedData;
};

interface BackendComment {
  commentId: number;
  parentId: number | null;
  postId: number;
  authorName?: string;
  authorNickname?: string;
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

  try {
    const backendResponse = await fetcher<BackendCommentListResponse>(url);

    const commentsData = backendResponse.data?.content || [];

    const transformedComments: Comment[] = commentsData.map(
      (backendComment) => ({
        id: backendComment.commentId,
        author:
          backendComment.authorName || backendComment.authorNickname || "익명",
        content: backendComment.content,
        likes: backendComment.likeCount,
        created_at: backendComment.createdAt,
        replies:
          backendComment.children?.map((child) => ({
            id: child.commentId,
            author: child.authorName || child.authorNickname || "익명",
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
            author: child.authorName || child.authorNickname || "익명",
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
  const jsonBlob = new Blob(
    [
      JSON.stringify({
        title: arg.title,
        content: arg.content,
        type: arg.type,
      }),
    ],
    { type: "application/json" }
  );
  formData.append("post", jsonBlob);

  // 이미지 파일들 추가 (백엔드에서는 "images"로 받음)
  if (arg.Image && arg.Image.length > 0) {
    arg.Image.forEach((file) => {
      formData.append("images", file);
    });
  }

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {};

  // 토큰이 있는 경우에만 Authorization 헤더 추가
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const correctUrl = `${API_BASE_URL}/api/posts`;

  const response = await fetch(correctUrl, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    // 응답 본문 복제해서 에러 처리
    const responseClone = response.clone();
    let errorMessage = "게시글 작성 실패";
    let errorDetail = "";

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetail = JSON.stringify(errorData);
    } catch {
      const responseText = await responseClone.text();
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      errorDetail = responseText;
    }

    console.error("API 에러 상세:", {
      status: response.status,
      statusText: response.statusText,
      errorMessage,
      errorDetail,
    });

    if (response.status === 403) {
      throw new Error(
        "권한이 없습니다. 토큰이 만료되었거나 유효하지 않습니다."
      );
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();

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
  // URL에서 postId 추출
  const postId = url.split("/").pop();
  const correctUrl = `${API_BASE_URL}/api/posts/${postId}`;

  // 로컬 스토리지에서 인증 토큰 가져오기
  const authToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // 백엔드는 항상 multipart/form-data를 기대하므로 항상 FormData 사용
  const formData = new FormData();

  // 게시글 데이터를 JSON으로 추가 (백엔드 @RequestPart 구조에 맞춤)
  const jsonBlob = new Blob(
    [
      JSON.stringify({
        title: arg.title,
        content: arg.content,
        type: arg.type,
      }),
    ],
    { type: "application/json" }
  );
  formData.append("post", jsonBlob);

  // 이미지 파일들 추가
  const images = (arg as any).Image || arg.image;
  if (images && images.length > 0) {
    images.forEach((file: File, idx: number) => {
      formData.append("images", file);
    });
  }

  // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
  delete headers["Content-Type"];

  const response = await fetch(correctUrl, {
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
  return result;
};

// 댓글 신고 API
export const createCommentReport = async (
  commentId: number,
  content: string
): Promise<{ message: string }> => {
  const url = `/api/comments/${commentId}/reports`;
  const fullUrl = buildFullUrl(url);

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
  return result;
};
