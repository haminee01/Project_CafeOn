// QnA 관련 타입 정의

export enum QuestionVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum QuestionStatus {
  PENDING = "PENDING",
  ANSWERED = "ANSWERED",
}

// API 응답 공통 구조
export interface ApiResponse<T> {
  message: string;
  data: T;
}

// 문의 목록 아이템
export interface QuestionListItem {
  id: number;
  title: string;
  authorNickname: string;
  createdAt: string;
  status: QuestionStatus | null;
  visibility: QuestionVisibility;
}

// 답변 정보
export interface Answer {
  answerId: number;
  questionId: number;
  adminNickname: string | null;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

// 문의 상세 정보
export interface QuestionDetail {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
  status: QuestionStatus | null;
  visibility: QuestionVisibility;
}

// 문의 등록 요청
export interface CreateQuestionRequest {
  title: string;
  content: string;
  visibility: QuestionVisibility;
}

// 문의 등록 응답
export interface CreateQuestionResponse {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
  status: QuestionStatus;
  visibility: QuestionVisibility;
}

// 페이지네이션 정보
export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableInfo {
  offset: number;
  sort: SortInfo;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

// 문의 목록 조회 응답
export interface QuestionListResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: QuestionListItem[];
  number: number;
  sort: SortInfo;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: PageableInfo;
  empty: boolean;
}

// 문의 목록 조회 파라미터
export interface QuestionListParams {
  page: number;
  size: number;
  keyword?: string;
}
