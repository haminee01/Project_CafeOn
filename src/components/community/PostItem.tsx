// src/components/community/PostItem.tsx
import Link from "next/link";
import { PostListItem, PostType } from "@/types/Post";
import ProfileIcon from "@/components/chat/ProfileIcon";
import { formatDateTime } from "@/utils/dateFormat";

interface PostItemProps {
  post: PostListItem;
}

// 카테고리 타입에 따른 색상/텍스트 매핑
const PostTypeMap: Record<PostType, { text: string; color: string }> = {
  GENERAL: { text: "일반", color: "bg-[#6E4213]" },
  QUESTION: { text: "질문", color: "bg-[#C19B6C]" },
  INFO: { text: "정보", color: "bg-yellow-500" },
};

export default function PostItem({ post }: PostItemProps) {
  const typeInfo = PostTypeMap[post.type] || PostTypeMap.GENERAL;

  return (
    // Link 컴포넌트를 사용하여 상세 페이지로 이동
    <Link
      href={`/community/${post.id}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="py-3 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2 sm:mb-1">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0 w-full sm:w-auto">
            {/* 카테고리 뱃지 */}
            <span
              className={`${typeInfo.color} text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0`}
            >
              {typeInfo.text}
            </span>
            {/* 제목 */}
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate flex-1 min-w-0">
              {post.title}
            </h2>
          </div>
          {/* 댓글 수 (우측 정렬) */}
          <span className="text-xs sm:text-sm text-gray-500 font-medium sm:ml-auto">
            [{post.comments || 0}]
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* 작성자 아바타 */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
              {post.authorProfileImageUrl ? (
                <img
                  src={post.authorProfileImageUrl}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProfileIcon size="sm" />
              )}
            </div>
            <span className="text-gray-700">{post.author || "익명"}</span>
            {/* 내가 좋아요한 게시글 표시 */}
            {post.likedByMe && (
              <span className="inline-flex items-center text-red-500">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="hidden sm:inline">좋아요함</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="hidden sm:inline">조회: </span>
            <span>{post.views?.toLocaleString() || 0}</span>
            <span className="hidden sm:inline">좋아요: </span>
            <span>{post.likes?.toLocaleString() || 0}</span>
            <span className="hidden md:inline">
              {post.created_at ? formatDateTime(post.created_at) : "날짜 없음"}
            </span>
            <span className="md:hidden text-[10px]">
              {post.created_at
                ? formatDateTime(post.created_at).split(" ")[0]
                : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
