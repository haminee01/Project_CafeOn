// src/components/community/PostDetail.tsx
"use client";

import Link from "next/link";
import { PostDetail as PostDetailType } from "@/types/Post";
import { useState, useMemo } from "react";
import { togglePostLike, deletePostMutator } from "@/api/community";
import { useRouter } from "next/navigation";
import ReportModal from "@/components/modals/ReportModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/common/ToastProvider";
import ProfileIcon from "@/components/chat/ProfileIcon";
import { formatDateTime } from "@/utils/dateFormat";

interface PostDetailProps {
  post: PostDetailType;
  commentCount?: number;
}

// 카테고리 타입에 따른 색상/텍스트 매핑 (PostItem.tsx와 동일하게 유지)
const PostTypeMap: Record<
  PostDetailType["type"],
  { text: string; color: string }
> = {
  GENERAL: { text: "일반", color: "bg-[#6E4213]" },
  QUESTION: { text: "질문", color: "bg-[#C19B6C]" },
  INFO: { text: "정보", color: "bg-yellow-500" },
};

export default function PostDetail({ post, commentCount }: PostDetailProps) {
  const typeInfo = PostTypeMap[post.type] || PostTypeMap.GENERAL;
  const router = useRouter();
  const { user, isLoggedIn, currentUserId } = useAuth();
  const { showToast } = useToastContext();

  // 좋아요 상태 관리를 위한 state
  const [currentLikes, setCurrentLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.likedByMe || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // 작성자 여부 확인 (userId로 비교)
  const isAuthor = useMemo(() => {
    console.log("=== 작성자 확인 시작 ===");
    console.log("user 전체 객체:", user);
    console.log("post.author:", post.author);
    console.log("post.authorId:", post.authorId);

    if (!isLoggedIn || !user) {
      console.log("❌ 로그인 안됨");
      return false;
    }

    // userId가 있으면 userId로 비교 (가장 정확)
    if (post.authorId && user.id) {
      const isMatch = user.id === post.authorId;
      console.log("✅ userId로 비교:", {
        "user.id": user.id,
        "post.authorId": post.authorId,
        isMatch,
      });
      return isMatch;
    }

    console.log("⚠️ userId 비교 불가 (post.authorId 또는 user.id 없음)");

    // userId가 없으면 닉네임으로 폴백 (대소문자 구분 없이 비교)
    console.log("user.username:", user.username);

    const currentNickname = (user.username || "").trim().toLowerCase();
    const postAuthor = (post.author || "").trim().toLowerCase();
    const isMatch = currentNickname === postAuthor;

    console.log("📝 닉네임으로 비교:", {
      currentNickname,
      postAuthor,
      isMatch,
    });

    return isMatch;
  }, [isLoggedIn, user, post.author, post.authorId]);

  // 실제 좋아요/취소 핸들러
  const handleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const response = await togglePostLike(post.id);
      console.log("좋아요 응답:", response);

      // 응답 타입: { message, liked }
      if (response) {
        setIsLiked(response.liked);
        // likes는 응답에 없으므로 로컬에서 계산
        setCurrentLikes(response.liked ? currentLikes + 1 : currentLikes - 1);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      showToast("좋아요 처리에 실패했습니다.", "error");
    } finally {
      setIsLikeLoading(false);
    }
  };

  // 게시글 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      await deletePostMutator(post.id);
      showToast("게시글이 삭제되었습니다.", "success");
      router.push("/community");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      showToast("게시글 삭제에 실패했습니다.", "error");
    }
  };

  // 작성자 여부에 따른 버튼 표시 로직 구현됨

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* 1. 제목 및 메타 정보 */}
      <header className="pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center space-x-3 mb-2">
          {/* 카테고리 뱃지 */}
          <span
            className={`${typeInfo.color} text-white text-sm font-semibold px-3 py-1 rounded-full`}
          >
            {typeInfo.text}
          </span>
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
          <div className="flex items-center gap-3">
            {/* 작성자 아바타 */}
            <ProfileIcon 
              size="md" 
              imageUrl={
                isAuthor && user?.profileImageUrl
                  ? user.profileImageUrl
                  : post.authorProfileImageUrl
              }
            />
            <span className="text-gray-700">{post.author || "익명"}</span>
            <span>
              작성일:{" "}
              {post.created_at ? formatDateTime(post.created_at) : "날짜 없음"}
            </span>
            {post.updated_at && (
              <span>
                수정일:{" "}
                {formatDateTime(post.updated_at)}
              </span>
            )}
          </div>
          <div className="space-x-4">
            <span>조회수: {post.views?.toLocaleString() || 0}</span>
            <span>
              댓글: {(commentCount || post.comments || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* 2. 게시글 본문 */}
      <div className="prose max-w-none text-gray-800 leading-relaxed min-h-[200px] mb-8">
        {/* \n을 <br/>로 치환하여 줄바꿈 적용 */}
        {(post.content || "").split("\n").map((line, index) => (
          <p key={index} className="mb-4">
            {line}
          </p>
        ))}

        {/* 이미지 표시 */}
        {post.Images && post.Images.length > 0 && (
          <div className="mt-6 space-y-4">
            {post.Images.map((imgSrc, index) => (
              // Next.js Image 컴포넌트 사용을 권장하지만, 간단한 목업을 위해 img 태그 사용
              <img
                key={index}
                src={imgSrc}
                alt={`게시글 이미지 ${index + 1}`}
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. 좋아요 및 액션 버튼 */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        {/* 좋아요 버튼 (POST /api/posts/{id}/like) */}
        <button
          onClick={handleLike}
          disabled={isLikeLoading}
          className={`flex items-center space-x-2 p-3 rounded-full transition-colors ${
            isLiked
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } ${isLikeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {/* 하트 아이콘 */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path
              d={
                isLiked
                  ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  : "M12 4.248c-3.148-5.4-8-5.4-8 0 0 3.109 3.993 6.903 8 10.5 4.007-3.597 8-7.391 8-10.5 0-5.4-4.852-5.4-8 0z"
              }
            />
          </svg>
          <span className="font-semibold">
            {(currentLikes || 0).toLocaleString()}
          </span>
        </button>

        {/* 수정/삭제/신고 버튼 */}
        <div className="space-x-3">
          {/* 작성자인 경우: 수정/삭제 버튼만 표시 */}
          {isAuthor && (
            <>
              {/* PUT /api/posts/{id} */}
              <Link href={`/community/${post.id}/edit`}>
                <button className="text-gray-600 hover:text-[#999999] transition-colors">
                  수정
                </button>
              </Link>
              {/* DELETE /api/posts/{id} */}
              <button
                onClick={handleDelete}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                삭제
              </button>
            </>
          )}

          {/* 로그인한 사용자가 작성자가 아닌 경우: 신고 버튼만 표시 */}
          {isLoggedIn && !isAuthor && (
            <button
              onClick={() => setShowReportModal(true)}
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              신고
            </button>
          )}
        </div>
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
      />
    </div>
  );
}
