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
