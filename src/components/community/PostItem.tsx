// src/components/community/PostItem.tsx
import Link from "next/link";
import { PostListItem, PostType } from "@/types/Post";

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

        <div className="flex justify-between text-sm text-gray-500">
          <div className="space-x-4">
            <span>작성자: {post.author || "익명"}</span>
            <span>조회: {post.views?.toLocaleString() || 0}</span>
            <span>좋아요: {post.likes?.toLocaleString() || 0}</span>
          </div>
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
    </Link>
  );
}
