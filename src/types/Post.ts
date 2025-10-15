// 게시글 타입 정의
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

// 댓글 타입 정의
export interface MyComment {
  id: number;
  content: string;
  postTitle: string;
  createdAt: string;
  likes: number;
  children?: MyComment[];
  author?: string;
  likedByMe?: boolean;
  parent_id?: number;
}

// 좋아요한 글 타입 정의
export interface MyLikedPost {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  likes: number;
  commentCount: number;
}

// 좋아요한 댓글 타입 정의
export interface MyLikedComment {
  id: number;
  content: string;
  postTitle: string;
  createdAt: string;
  likes: number;
}

// Spring Boot Page 객체 구조
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

// 백엔드 ApiResponse 구조
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

// API 호출 파라미터 타입
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

// 게시글 타입
export type PostType = "GENERAL" | "QUESTION" | "INFO";

// 커뮤니티 관련 타입들
export interface PostListItem {
  id: number;
  type: PostType;
  title: string;
  author: string;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
}

export interface PostListResponse {
  posts: PostListItem[];
  pages: number;
}

export interface PostDetail {
  id: number;
  type: PostType;
  title: string;
  author: string;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
  content: string;
  Images: string[];
  likedByMe: boolean;
}

export interface PostCreateResponse {
  id: number;
  message: string;
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  type: PostType;
  image?: File[];
}

export interface PostUpdateResponse {
  message: string;
}

export interface PostDeleteResponse {
  message: string;
}

export interface PostLikeResponse {
  message: string;
  liked: boolean;
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  likes: number;
  created_at: string;
  replies: Comment[];
  likedByMe: boolean;
  parent_id: number | null;
  children: Comment[];
}

export interface CommentCreateRequest {
  content: string;
  parentId?: number;
}

export interface CommentCreateResponse {
  message: string;
  data: {
    commentId: number;
    content: string;
    authorName: string;
    createdAt: string;
    likeCount: number;
    likedByMe: boolean;
    parentId: number | null;
    children: any[];
  };
}

export interface CommentUpdateResponse {
  message: string;
}

export interface CommentDeleteResponse {
  message: string;
}

export interface CommentLikeResponse {
  message: string;
  liked: boolean;
}

export interface ReportRequest {
  targetType: "POST" | "COMMENT";
  targetId: number;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  message: string;
  reportId: number;
}
