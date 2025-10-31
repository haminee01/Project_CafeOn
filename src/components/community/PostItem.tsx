// src/components/community/PostItem.tsx
import Link from "next/link";
import { PostListItem, PostType } from "@/types/Post";
import ProfileIcon from "@/components/chat/ProfileIcon";

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
      <div className="py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-1">
          {/* 카테고리 뱃지 */}
          <span
            className={`${typeInfo.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}
          >
            {typeInfo.text}
          </span>
          {/* 제목 */}
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {post.title}
          </h2>
          {/* 댓글 수 (우측 정렬) */}
          <span className="text-sm text-gray-500 font-medium ml-auto">
            [{post.comments || 0}]
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-3">
            {/* 작성자 아바타 */}
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
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
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                좋아요함
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>조회: {post.views?.toLocaleString() || 0}</span>
            <span>좋아요: {post.likes?.toLocaleString() || 0}</span>
            <span>
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "날짜 없음"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
