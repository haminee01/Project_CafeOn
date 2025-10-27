"use client";

import Link from "next/link";
import PostItem from "./PostItem";
import Pagination from "@/components/common/Pagination";
import { PostListItem } from "@/types/Post";
import { useState, useEffect } from "react";

interface CommunityListProps {
  posts: PostListItem[];
  initialPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function CommunityList({
  posts,
  initialPage,
  totalPages,
  onPageChange,
}: CommunityListProps) {
  // 현재 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState(initialPage);

  // props가 변경될 때 현재 페이지 업데이트
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // onPageChange 핸들러
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 게시글 목록 렌더링 */}
      <div className="pr-4 pl-4 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 min-h-[400px]">
        {posts.length > 0 ? (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        ) : (
          <div className="p-10 text-center text-gray-500">
            게시글이 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
