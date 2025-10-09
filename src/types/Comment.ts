// src/types/Comment.ts

/** 댓글 항목 타입 */
export interface Comment {
  id: number;
  author: string;
  content: string;
  likes: number;
  created_at: string; // "YYYY-MM-DD HH:MM:SS" 형식
  parent_comment_id?: number; // 대댓글일 경우 부모 댓글 ID
  replies?: Comment[]; // 대댓글 목록 (GET /api/posts/{id}/comments 응답에 대댓글이 중첩되어 있다면)
}
