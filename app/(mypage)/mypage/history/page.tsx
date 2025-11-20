"use client";

import { useState } from "react";
import Pagination from "@/components/common/Pagination";
import { useMyPosts } from "@/hooks/useMyPosts";
import { useMyComments } from "@/hooks/useMyComments";
import { useMyLikedPosts } from "@/hooks/useMyLikedPosts";
import { useMyLikedComments } from "@/hooks/useMyLikedComments";
import { useAuth } from "@/contexts/AuthContext";

// 탭 데이터 정의
const historyTabs = [
  { key: "posts", name: "내가 남긴 글" },
  { key: "comments", name: "내가 남긴 댓글" },
  { key: "likes", name: "내가 좋아요 한 글" },
  { key: "replies", name: "내가 좋아요 한 댓글" },
];

// 글 타입 옵션 정의
const POST_TYPE_OPTIONS: {
  value: string;
  label: string;
  color: string;
}[] = [
  { value: "", label: "전체", color: "bg-gray-500" },
  { value: "GENERAL", label: "일반", color: "bg-[#6E4213]" },
  { value: "QUESTION", label: "질문", color: "bg-[#C19B6C]" },
  { value: "INFO", label: "정보", color: "bg-yellow-500" },
];

// Mock 데이터 제거됨

// 페이지네이션 상수
const ITEMS_PER_PAGE = 10;

interface HistoryContentProps {
  activeTab: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const HistoryContent = ({
  activeTab,
  currentPage,
  onPageChange,
}: HistoryContentProps) => {
  // 내가 쓴 글 탭인 경우 API 데이터 사용
  const { posts, totalPages, isLoading, error } = useMyPosts({
    page: currentPage - 1, // API는 0부터 시작하므로 -1
    size: ITEMS_PER_PAGE,
  });

  // 내가 쓴 댓글 탭인 경우 API 데이터 사용
  const {
    comments,
    totalPages: commentTotalPages,
    isLoading: commentIsLoading,
    error: commentError,
  } = useMyComments({
    page: currentPage - 1, // API는 0부터 시작하므로 -1
    size: ITEMS_PER_PAGE,
  });

  // 내가 좋아요한 글 탭인 경우 API 데이터 사용
  const {
    likedPosts,
    totalPages: likedPostsTotalPages,
    isLoading: likedPostsIsLoading,
    error: likedPostsError,
  } = useMyLikedPosts({
    page: currentPage - 1, // API는 0부터 시작하므로 -1
    size: ITEMS_PER_PAGE,
  });

  // 내가 좋아요한 댓글 탭인 경우 API 데이터 사용
  const {
    likedComments,
    totalPages: likedCommentsTotalPages,
    isLoading: likedCommentsIsLoading,
    error: likedCommentsError,
  } = useMyLikedComments({
    page: currentPage - 1, // API는 0부터 시작하므로 -1
    size: ITEMS_PER_PAGE,
  });

  // 다른 탭인 경우 빈 데이터 사용
  const totalItems: any[] = [];
  const mockTotalPages = 0;
  const currentItems: any[] = [];

  // 내가 쓴 글 탭 렌더링
  if (activeTab === "posts") {
    if (isLoading) {
      return (
        <div className="py-8 text-center text-gray-500">
          내가 쓴 글을 불러오는 중...
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-8 text-center text-red-500">
          오류가 발생했습니다: {error}
        </div>
      );
    }

    return (
      <>
        {/* 내가 쓴 글 리스트 */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                      {post.title}
                    </h3>
                    {(() => {
                      const typeOption = POST_TYPE_OPTIONS.find(
                        (option) => option.value === post.type
                      );
                      return (
                        <span
                          className={`text-xs text-white px-2 py-1 rounded-full self-start ${
                            typeOption?.color || "bg-gray-500"
                          }`}
                        >
                          {typeOption?.label || post.type}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">작성자:</span>
                      <span>{post.authorNickname}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">조회:</span>
                      <span>{post.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">좋아요:</span>
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">댓글:</span>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-3">
                    작성일: {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">
                내가 쓴 글이 없습니다.
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        )}
      </>
    );
  }

  // 내가 쓴 댓글 탭 렌더링
  if (activeTab === "comments") {
    if (commentIsLoading) {
      return (
        <div className="py-8 text-center text-gray-500">
          내가 쓴 댓글을 불러오는 중...
        </div>
      );
    }

    if (commentError) {
      return (
        <div className="py-8 text-center text-red-500">
          오류가 발생했습니다: {commentError}
        </div>
      );
    }

    return (
      <>
        {/* 내가 쓴 댓글 리스트 */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.commentId}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="space-y-3">
                  <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 border border-[#CDCDCD] rounded-lg px-3 py-2 rounded-md">
                    <span className="font-medium">글 ID:</span> {comment.postId}
                  </div>

                  <div className="text-sm text-gray-900 leading-relaxed">
                    {comment.content}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">좋아요:</span>
                      <span>{comment.likeCount}</span>
                    </div>
                    <div className="text-right">
                      작성일: {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">
                내가 쓴 댓글이 없습니다.
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {commentTotalPages > 1 && (
          <Pagination
            totalPages={commentTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        )}
      </>
    );
  }

  // 내가 좋아요한 글 탭 렌더링
  if (activeTab === "likes") {
    if (likedPostsIsLoading) {
      return (
        <div className="py-8 text-center text-gray-500">
          내가 좋아요한 글을 불러오는 중...
        </div>
      );
    }

    if (likedPostsError) {
      return (
        <div className="py-8 text-center text-red-500">
          오류가 발생했습니다: {likedPostsError}
        </div>
      );
    }

    return (
      <>
        {/* 내가 좋아요한 글 리스트 */}
        <div className="space-y-4">
          {likedPosts.length > 0 ? (
            likedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        좋아요한 글
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">작성자:</span>
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">조회:</span>
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">좋아요:</span>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">댓글:</span>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-3">
                    작성일: {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">
                내가 좋아요한 글이 없습니다.
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {likedPostsTotalPages > 1 && (
          <Pagination
            totalPages={likedPostsTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        )}
      </>
    );
  }

  // 내가 좋아요한 댓글 탭 렌더링
  if (activeTab === "replies") {
    if (likedCommentsIsLoading) {
      return (
        <div className="py-8 text-center text-gray-500">
          내가 좋아요한 댓글을 불러오는 중...
        </div>
      );
    }

    if (likedCommentsError) {
      return (
        <div className="py-8 text-center text-red-500">
          오류가 발생했습니다: {likedCommentsError}
        </div>
      );
    }

    return (
      <>
        {/* 내가 좋아요한 댓글 리스트 */}
        <div className="space-y-4">
          {likedComments.length > 0 ? (
            likedComments.map((comment) => (
              <div
                key={comment.commentId}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 border border-[#CDCDCD] rounded-lg px-3 py-2 rounded-md flex-1">
                      <span className="font-medium">글 ID:</span>{" "}
                      {comment.postId}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full sm:ml-2 self-start">
                      좋아요한 댓글
                    </span>
                  </div>

                  <div className="text-sm text-gray-900 leading-relaxed">
                    {comment.content}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">좋아요:</span>
                      <span>{comment.likeCount}</span>
                    </div>
                    <div className="text-right">
                      작성일: {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">
                내가 좋아요한 댓글이 없습니다.
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {likedCommentsTotalPages > 1 && (
          <Pagination
            totalPages={likedCommentsTotalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        )}
      </>
    );
  }

  // 다른 탭 렌더링 (Mock 데이터 사용)
  return (
    <>
      {/* 탭 내용 표시 */}
      <div className="p-0">
        {/* 항목 리스트 */}
        <ul className="space-y-0 divide-y divide-gray-200">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <li key={item.id} className="py-4 text-base text-gray-800">
                {item.title}
              </li>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {historyTabs.find((t) => t.key === activeTab)?.name} 내역이
              없습니다.
            </div>
          )}
        </ul>
      </div>

      {/* 페이지네이션 컴포넌트 통합 */}
      {mockTotalPages > 1 && (
        <Pagination
          totalPages={mockTotalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // 탭 변경 핸들러
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full">
      {/* 닉네임님의 히스토리 헤더 */}
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {user?.username || "사용자"}님의 히스토리
      </h1>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-300 mb-4 sm:mb-6">
        <nav className="-mb-px flex overflow-x-auto gap-2">
          {historyTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                whitespace-nowrap pb-3 text-sm sm:text-base font-medium transition-colors duration-200
                flex-1 text-center
                ${
                  activeTab === tab.key
                    ? "border-b-2 border-[#6E4213] text-[#6E4213] font-semibold"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 내용 영역 및 페이지네이션 */}
      <HistoryContent
        activeTab={activeTab}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
