// src/types/Post.ts (타입 정의 파일)

/** 게시글의 카테고리 타입 */
export type PostType = "GENERAL" | "QUESTION" | "INFO";

/** 게시글 목록 응답 (GET /api/posts) 항목 타입 */
export interface PostListItem {
  id: number;
  type: PostType;
  title: string;
  author: string; // 작성자
  created_at: string; // "YYYY-MM-DD HH:MM:SS" 형식
  views: number | null; // null 허용 (백엔드에서 null이 올 수 있음)
  likes: number | null; // null 허용 (백엔드에서 null이 올 수 있음)
  comments: number; // 댓글 수
}

/** 특정 게시글 상세 응답 (GET /api/posts/{id}) 타입 */
export interface PostDetail extends PostListItem {
  content: string; // 글 내용
  Images: string[]; // 이미지 URL 배열 (백엔드 API 명세에 맞춤)
  // views와 likes는 PostListItem에서 상속받음 (number | null)
}

/** 게시글 목록 API 응답 전체 타입 */
export interface PostListResponse {
  posts: PostListItem[];
  pages: number; // 전체 페이지 수
}

/** POST /api/posts 요청 타입 */
export interface PostCreateRequest {
  title: string;
  content: string;
  type: PostType;
  Image?: File[]; // 이미지 파일 배열
}

/** POST /api/posts 응답 타입 */
export interface PostCreateResponse {
  id: number;
  message: string;
}

/** 게시글 수정 요청 타입 */
export interface PostUpdateRequest {
  title: string;
  content: string;
  type: PostType;
  image?: File[];
}

/** 게시글 수정 응답 타입 */
export interface PostUpdateResponse {
  message: string;
}

/** 게시글 삭제 응답 타입 */
export interface PostDeleteResponse {
  message: string;
}

/** 게시글 좋아요 응답 타입 */
export interface PostLikeResponse {
  postId: number;
  liked: boolean;
  likes: number;
  message: string;
}

/** 댓글 타입 */
export interface Comment {
  id: number;
  author: string;
  content: string;
  likes: number;
  created_at: string;
  replies: Comment[];
}

/** 댓글 작성 요청 타입 */
export interface CommentCreateRequest {
  content: string;
  parent_comment_id?: number;
}

/** 댓글 작성 응답 타입 */
export interface CommentCreateResponse {
  id: number;
  message: string;
}

/** 댓글 수정 응답 타입 */
export interface CommentUpdateResponse {
  message: string;
}

/** 댓글 삭제 응답 타입 */
export interface CommentDeleteResponse {
  message: string;
}

/** 댓글 좋아요 응답 타입 */
export interface CommentLikeResponse {
  commentId: number;
  liked: boolean;
  likes: number;
  message: string;
}

/** 신고하기 요청 타입 */
export interface ReportRequest {
  target_type: "post" | "comment";
  target_id: number;
  reason: string;
}

/** 신고하기 응답 타입 */
export interface ReportResponse {
  message: string;
}
