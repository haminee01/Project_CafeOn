// src/components/community/CommentItem.tsx
"use client";

import { Comment } from "@/types/Post";
import { useState, useRef, useEffect } from "react";
import {
  toggleCommentLike,
  updateCommentMutator,
  deleteCommentMutator,
  createCommentMutator,
  getComments,
} from "@/api/community";
import ReportModal from "@/components/modals/ReportModal";

const MOCK_CURRENT_USER = {
  username: "현재 사용자",
};

interface TemporaryAlertProps {
  message: string;
}

const TemporaryAlert = ({ message }: TemporaryAlertProps) => (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#999999] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
    {message}
  </div>
);

interface CommentItemProps {
  comment: Comment;
  postId: number;
  isReply?: boolean;
  onCommentUpdated?: () => void;
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
  onCommentUpdated,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const [displayContent, setDisplayContent] = useState(comment.content);
  const [editedContent, setEditedContent] = useState(comment.content);

  const [showAlert, setShowAlert] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

  const isMyComment = comment.author === MOCK_CURRENT_USER.username;

  const handleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const response = await toggleCommentLike(comment.id);
      setIsLiked(response.liked);
      // 댓글 목록 새로고침
      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("댓글 좋아요 실패:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // 수정 모드 진입/취소 핸들러
  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      // 취소 시, displayContent로 되돌림 (원래 prop.comment.content였던 역할)
      setEditedContent(displayContent);
    }
  };

  // 댓글 수정 저장 핸들러
  const handleSaveEdit = async () => {
    if (editedContent.trim() === displayContent.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCommentMutator(postId, comment.id, {
        content: editedContent,
      });

      setDisplayContent(editedContent);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);

      if (onCommentUpdated) {
        onCommentUpdated();
      }

      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글/대댓글 삭제 핸들러
  const handleDelete = async () => {
    if (window.confirm("정말로 이 댓글/대댓글을 삭제하시겠습니까?")) {
      try {
        await deleteCommentMutator(postId, comment.id);
        alert("댓글이 삭제되었습니다.");
        if (onCommentUpdated) {
          onCommentUpdated();
        }
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      await createCommentMutator(postId, {
        content: replyContent,
        parent_comment_id: comment.id,
      });

      setReplyContent("");
      setShowReplyForm(false);

      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("답글 작성 실패:", error);
      alert("답글 작성에 실패했습니다.");
    }
  };

  const handleReplyCancel = () => {
    setShowReplyForm(false);
  };

  // 컴포넌트 바깥 클릭 시 답글 폼 닫기 로직 (이전 수정 내용 그대로 유지)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showReplyForm &&
        commentRef.current &&
        !commentRef.current.contains(event.target as Node)
      ) {
        setShowReplyForm(false);
      }
    };

    if (showReplyForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReplyForm]);

  return (
    <>
      {showAlert && <TemporaryAlert message="댓글이 수정되었습니다." />}

      <div
        ref={commentRef}
        className={`py-4 ${
          isReply
            ? "ml-8 border-l border-gray-100 pl-4"
            : "border-b border-gray-100"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <span
              className={`font-semibold ${
                isMyComment ? "text-[#6E4213]" : "text-gray-800"
              }`}
            >
              {comment.author}
              {isMyComment && (
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (나)
                </span>
              )}
            </span>
            <span className="text-sm text-gray-500">
              {comment.created_at.substring(0, 16)}
            </span>
          </div>
          <div className="flex space-x-2 text-sm text-gray-500">
            {!isEditing && (
              <>
                <button
                  onClick={() => setShowReplyForm((prev) => !prev)}
                  className="hover:text-[#6E4213]"
                >
                  답글
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="hover:text-orange-500"
                >
                  신고
                </button>
              </>
            )}

            {isMyComment && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="hover:text-green-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleEditClick}
                      className="hover:text-[#999999]"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEditClick}
                      className="hover:text-[#999999]"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="hover:text-red-500"
                    >
                      삭제
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* isEditing 상태에 따라 내용 표시 또는 수정 폼 렌더링 */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-[#6E4213] focus:border-[#6E4213]"
              rows={3}
            />
          </div>
        ) : (
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">
            {displayContent}
          </p>
        )}

        <div className="flex items-center space-x-4 mt-2">
          {/* 좋아요 버튼 */}
          <button
            onClick={handleLike}
            disabled={isLikeLoading}
            className={`flex items-center text-sm space-x-1 ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            } ${isLikeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path
                d={
                  isLiked
                    ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    : "M12 4.248c-3.148-5.4-8-5.4-8 0 0 3.109 3.993 6.903 8 10.5 4.007-3.597 8-7.391 8-10.5 0-5.4-4.852-5.4-8 0z"
                }
              />
            </svg>
            <span>{comment.likes + (isLiked ? 1 : 0)}</span>
          </button>
        </div>

        {/* 대댓글 작성 폼 */}
        {showReplyForm && !isEditing && (
          <div className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`${comment.author}님에게 답글 작성...`}
              className="w-full p-2 border rounded-md resize-none focus:ring-[#6E4213] focus:border-[#6E4213]"
              rows={2}
            />
            <div className="flex justify-end mt-1 space-x-2">
              <button
                onClick={handleReplyCancel}
                className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className={`px-3 py-1 text-white rounded-md text-sm ${
                  replyContent.trim()
                    ? "bg-[#6E4213] hover:bg-[#C19B6C]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                등록
              </button>
            </div>
          </div>
        )}

        {/* 대댓글 목록 재귀적으로 렌더링 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="comment"
        targetId={comment.id}
      />
    </>
  );
}
