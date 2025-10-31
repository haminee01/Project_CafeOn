// src/components/community/CommentSection.tsx
"use client";

import { Comment } from "@/types/Post";
import { useState } from "react";
import CommentItem from "./CommentItem";
import { createCommentMutator, getComments } from "@/api/community";
import { useToastContext } from "@/components/common/ToastProvider";

interface CommentSectionProps {
  postId: number;
  initialComments: Comment[];
  onCommentsChange?: (comments: Comment[]) => void;
}

export default function CommentSection({
  postId,
  initialComments,
  onCommentsChange,
}: CommentSectionProps) {
  // 실제 API 호출 시에는 SWR 등으로 댓글 목록 상태 관리
  const [comments, setComments] = useState(initialComments);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToastContext();

  // 댓글과 대댓글을 모두 포함한 총 댓글 수 계산
  const calculateTotalComments = (comments: Comment[]): number => {
    let total = 0;
    comments.forEach((comment) => {
      total += 1; // 댓글 자체
      if (comment.children && comment.children.length > 0) {
        total += comment.children.length; // 대댓글들
      }
    });
    return total;
  };

  // 댓글 목록 새로고침 함수
  const refreshComments = async () => {
    try {
      const updatedComments = await getComments(postId);
      setComments(updatedComments);
      // 상태 업데이트 후 콜백 호출을 setTimeout으로 분리
      setTimeout(() => {
        onCommentsChange?.(updatedComments);
      }, 0);
    } catch (error) {
      console.error("댓글 목록 새로고침 실패:", error);
    }
  };

  // 실제 댓글 작성 핸들러
  const handleSubmitComment = async () => {
    if (!newCommentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await createCommentMutator(postId, {
        content: newCommentContent,
      });

      console.log("댓글 작성 성공:", response);
      console.log("response.data:", response?.data);

      // 새 댓글을 상태에 직접 추가 (API 응답에서 받은 데이터 사용)
      if (response?.data) {
        const newComment: Comment = {
          id: response.data.commentId,
          content: response.data.content,
          author:
            response.data.authorName || response.data.authorNickname || "익명",
          likes: response.data.likeCount,
          created_at: response.data.createdAt,
          replies: [],
          likedByMe: response.data.likedByMe,
          parent_id: response.data.parentId,
          children: response.data.children || [],
        };

        setComments((prev) => {
          const updatedComments = [...prev, newComment];
          // 상태 업데이트 후 콜백 호출을 useEffect로 분리
          setTimeout(() => {
            onCommentsChange?.(updatedComments);
          }, 0);
          return updatedComments;
        });
      } else {
        // Fallback: 전체 새로고침
        await refreshComments();
      }

      setNewCommentContent("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      showToast("댓글 작성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="comment-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {calculateTotalComments(comments)}개의 댓글
      </h2>

      {/* 1. 새 댓글 작성 폼 */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <textarea
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          placeholder="댓글을 작성해 주세요. (최대 500자)"
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {newCommentContent.length} / 500
          </span>
          <button
            onClick={handleSubmitComment}
            disabled={!newCommentContent.trim() || isSubmitting}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              newCommentContent.trim() && !isSubmitting
                ? "bg-[#6E4213] text-white hover:bg-[#C19B6C]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>

      {/* 2. 댓글 목록 */}
      <div className="divide-y divide-gray-100">
        {comments.length > 0 ? (
          comments.map((comment) => (
            // 최상위 댓글만 렌더링하고, 대댓글은 CommentItem 내부에서 재귀적으로 처리
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onCommentUpdated={refreshComments}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 border-t border-gray-200">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </div>
        )}
      </div>
    </div>
  );
}
