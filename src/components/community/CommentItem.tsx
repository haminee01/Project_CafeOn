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
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/common/ToastProvider";
import ProfileIcon from "@/components/chat/ProfileIcon";
import { formatDateTime } from "@/utils/dateFormat";

interface TemporaryAlertProps {
  message: string;
}

const TemporaryAlert = ({ message }: TemporaryAlertProps) => (
  <div className="fixed top-4 right-4 bg-[#999999] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
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
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToastContext();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.likedByMe === true);
  const [currentLikes, setCurrentLikes] = useState(
    Math.max(comment.likes || 0, 0)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const [displayContent, setDisplayContent] = useState(comment.content);
  const [editedContent, setEditedContent] = useState(comment.content);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

  // 작성자 여부 확인 (로그인한 사용자와 댓글 작성자 비교)
  const isMyComment = isLoggedIn && user?.username === comment.author;

  const handleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    const prevLiked = isLiked; // 이전 상태 저장

    try {
      const response = await toggleCommentLike(comment.id);
      console.log("댓글 좋아요 응답:", response);

      // 응답 타입: { message, data: { commentId, liked, likes } }
      if (response && response.data) {
        const { liked, likes } = response.data;

        console.log("댓글 좋아요 상태 변경:", {
          before: prevLiked,
          after: liked,
          likesFromServer: likes,
        });

        setIsLiked(liked);
        // 서버에서 직접 likes 값을 받으므로 그대로 사용
        setCurrentLikes(likes);

        console.log(
          `댓글 좋아요 ${
            liked ? "추가" : "취소"
          } 완료 - 현재 좋아요 수: ${likes}`
        );
      }

      // 댓글 목록 새로고침
      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("댓글 좋아요 실패:", error);
      showToast("좋아요 처리에 실패했습니다.", "error");
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
      setAlertMessage("댓글이 수정되었습니다.");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      if (onCommentUpdated) {
        onCommentUpdated();
      }

      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      showToast("댓글 수정에 실패했습니다.", "error");
    }
  };

  // 댓글/대댓글 삭제 핸들러
  const handleDelete = async () => {
    if (window.confirm("정말로 이 댓글/대댓글을 삭제하시겠습니까?")) {
      try {
        // 먼저 알림 표시
        setAlertMessage("댓글이 삭제되었습니다.");
        setShowAlert(true);

        // 알림을 3초간 보여준 후 삭제 실행
        setTimeout(async () => {
          try {
            await deleteCommentMutator(postId, comment.id);
            setShowAlert(false);

            if (onCommentUpdated) {
              onCommentUpdated();
            }
          } catch (error) {
            console.error("댓글 삭제 실패:", error);
            setShowAlert(false);
            showToast("댓글 삭제에 실패했습니다.", "error");
          }
        }, 2000);
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
        showToast("댓글 삭제에 실패했습니다.", "error");
      }
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      console.log("대댓글 작성 요청:", {
        postId,
        content: replyContent,
        parent_comment_id: comment.id,
        commentId: comment.id,
      });

      // 여러 필드명을 시도해보기
      const requestData = {
        content: replyContent,
        parent_comment_id: comment.id,
        parentCommentId: comment.id,
        parentId: comment.id,
        parentComment: comment.id,
      };

      console.log("대댓글 요청 데이터:", requestData);

      await createCommentMutator(postId, requestData as any);

      console.log("대댓글 작성 성공");
      setReplyContent("");
      setShowReplyForm(false);

      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("답글 작성 실패:", error);
      showToast("답글 작성에 실패했습니다.", "error");
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
      {showAlert && <TemporaryAlert message={alertMessage} />}

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
            <ProfileIcon
              size="sm"
              imageUrl={
                isMyComment && user?.profileImageUrl
                  ? user.profileImageUrl
                  : undefined
              }
            />
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
              {comment.created_at
                ? formatDateTime(comment.created_at)
                : "날짜 없음"}
            </span>
          </div>
          <div className="flex space-x-2 text-sm text-gray-500">
            {!isEditing && (
              <>
                {/* 답글 버튼은 모든 댓글에 표시 */}
                <button
                  onClick={() => setShowReplyForm((prev) => !prev)}
                  className="hover:text-[#6E4213]"
                >
                  답글
                </button>

                {/* 작성자인 경우: 수정/삭제 버튼 표시 */}
                {isMyComment ? (
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
                ) : (
                  /* 작성자가 아닌 경우: 신고 버튼 표시 */
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="hover:text-orange-500"
                  >
                    신고
                  </button>
                )}
              </>
            )}

            {/* 수정 모드일 때 저장/취소 버튼 */}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="hover:text-green-600"
                >
                  저장
                </button>
                <button
                  onClick={handleEditClick}
                  className="hover:text-gray-600"
                >
                  취소
                </button>
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
            className={`flex items-center text-sm space-x-1 transition-colors ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"
            } ${isLikeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg
              className="w-4 h-4 transition-colors"
              viewBox="0 0 24 24"
              fill={isLiked ? "#EF4444" : "none"}
              stroke={isLiked ? "#EF4444" : "#6B7280"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="font-medium">{Math.max(currentLikes, 0)}</span>
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
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2 space-y-2">
            {/* 기본적으로 최대 1개의 대댓글만 표시 */}
            {(showAllReplies
              ? comment.children
              : comment.children.slice(0, 1)
            ).map((reply: Comment) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                isReply={true}
                onCommentUpdated={onCommentUpdated}
              />
            ))}

            {/* 대댓글이 있을 때 항상 더보기 버튼 표시 */}
            {comment.children.length > 0 && (
              <div className="ml-8">
                <button
                  onClick={() => setShowAllReplies(!showAllReplies)}
                  className="text-sm text-gray-500 hover:text-[#6E4213] flex items-center space-x-1"
                >
                  <span>
                    {showAllReplies
                      ? "대댓글 숨기기"
                      : comment.children.length > 1
                      ? `대댓글 ${comment.children.length - 1}개 더보기`
                      : "대댓글 더보기"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showAllReplies ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
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
