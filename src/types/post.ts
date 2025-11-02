// 커뮤니티 게시글 타입 정의

// 게시글 타입 (카테고리)
export type PostType = "GENERAL" | "QUESTION" | "INFO";

// 댓글 타입 (Comment.ts에서 가져옴)
export interface Comment {
  id: number;
  author: string;
  content: string;
  likes: number;
  created_at: string;
  parent_comment_id?: number;
  replies?: Comment[];
  likedByMe?: boolean;
  parent_id?: number | null;
  children?: Comment[];
}

// 게시글 목록 항목 타입
export interface PostListItem {
  id: number;
  type: PostType;
  title: string;
  author: string;
  authorProfileImageUrl?: string | null;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
  likedByMe?: boolean;
}

// 게시글 상세 타입
export interface PostDetail {
  id: number;
  type: PostType;
  title: string;
  content: string;
  author: string;
  authorId?: string; // 작성자 userId 추가
  authorProfileImageUrl?: string | null;
  created_at: string;
  updated_at?: string;
  views: number;
  likes: number;
  comments: number;
  Images?: string[];
  likedByMe: boolean;
}

// 게시글 목록 응답 타입
export interface PostListResponse {
  posts: PostListItem[];
  pages: number;
}

// 게시글 생성 응답 타입
export interface PostCreateResponse {
  id: number;
  message: string;
}

// 게시글 수정 요청 타입
export interface PostUpdateRequest {
  title: string;
  content: string;
  type: PostType;
  image?: File[];
}

// 게시글 수정 응답 타입
export interface PostUpdateResponse {
  message: string;
}

// 게시글 삭제 응답 타입
export interface PostDeleteResponse {
  message: string;
}

// 게시글 좋아요 응답 타입
export interface PostLikeResponse {
  message: string;
  data: {
    postId: number;
    liked: boolean;
    likes: number;
  };
}

// 댓글 생성 요청 타입
export interface CommentCreateRequest {
  content: string;
  parentId?: number;
}

// 댓글 생성 응답 타입
export interface CommentCreateResponse {
  message: string;
  data: {
    commentId: number;
    content: string;
    authorName: string;
    authorNickname?: string;
    createdAt: string;
    likeCount: number;
    likedByMe: boolean;
    parentId: number | null;
    postId: number;
    children?: any[];
  };
}

// 댓글 수정 응답 타입
export interface CommentUpdateResponse {
  message: string;
}

// 댓글 삭제 응답 타입
export interface CommentDeleteResponse {
  message: string;
}

// 댓글 좋아요 응답 타입
export interface CommentLikeResponse {
  message: string;
  data: {
    commentId: number;
    liked: boolean;
    likes: number;
  };
}

// 신고 요청 타입
export interface ReportRequest {
  content: string;
  type?: string;
}

// 신고 응답 타입
export interface ReportResponse {
  message: string;
}

// --- 하위 호환성을 위한 기존 타입들 ---

export interface MyPost {
  id: number;
  type: string;
  title: string;
  authorNickname: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface MyComment {
  commentId: number;
  parentId: number | null;
  postId: number;
  authorName: string;
  content: string;
  createdAt: string;
  children: MyComment[];
  likeCount: number;
  likedByMe: boolean;
}

export interface MyLikedPost {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  likes: number;
  commentCount: number;
}

export interface MyLikedComment {
  commentId: number;
  parentId: number | null;
  postId: number;
  authorName: string;
  content: string;
  createdAt: string;
  children: MyLikedComment[];
  likeCount: number;
  likedByMe: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      empty: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    unsorted: boolean;
    empty: boolean;
    sorted: boolean;
  };
}

export interface MyPostsResponse {
  data: PageResponse<MyPost>;
  message: string;
  success?: boolean;
}

export interface MyCommentsResponse {
  data: PageResponse<MyComment>;
  message: string;
  success?: boolean;
}

export interface MyLikedPostsResponse {
  data: PageResponse<MyLikedPost>;
  message: string;
  success?: boolean;
}

export interface MyLikedCommentsResponse {
  data: PageResponse<MyLikedComment>;
  message: string;
  success?: boolean;
}

export interface MyPostsParams {
  page?: number;
  size?: number;
}

export interface MyCommentsParams {
  page?: number;
  size?: number;
}

export interface MyLikedPostsParams {
  page?: number;
  size?: number;
}

export interface MyLikedCommentsParams {
  page?: number;
  size?: number;
}
