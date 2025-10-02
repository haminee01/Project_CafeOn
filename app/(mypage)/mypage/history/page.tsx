"use client";

import { useState } from "react";
import Pagination from "@/components/common/Pagination";

// 탭 데이터 정의
const historyTabs = [
  { key: "posts", name: "내가 남긴 글" },
  { key: "comments", name: "내가 남긴 댓글" },
  { key: "replies", name: "내가 남긴 대댓글" },
  { key: "likes", name: "내가 남긴 좋아요" },
];

// Mock 데이터 생성 (총 50개의 항목)
const createMockItems = (prefix: string) => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `${prefix} ${i + 1}: 어쩌구 저쩌구 내용은 여기에 들어갑니다.`,
    date: `2024-05-${String((i % 30) + 1).padStart(2, "0")}`,
  }));
};

const mockData: Record<string, ReturnType<typeof createMockItems>> = {
  posts: createMockItems("글"),
  comments: createMockItems("댓글"),
  replies: createMockItems("대댓글"),
  likes: createMockItems("좋아요"),
};

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
  // 1. 현재 활성화된 탭의 전체 데이터 가져오기
  const totalItems = mockData[activeTab] || [];
  const totalPages = Math.ceil(totalItems.length / ITEMS_PER_PAGE);

  // 2. 현재 페이지에 표시할 데이터 계산 (슬라이싱)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = totalItems.slice(startIndex, endIndex);

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
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
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
    <div className="p-8 bg-white min-h-full">
      {/* 닉네임님의 히스토리 헤더 */}
      <h1 className="text-2xl font-bold mb-6">닉네임님의 히스토리</h1>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-300 mb-6">
        <nav className="-mb-px flex justify-between">
          {historyTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                whitespace-nowrap pb-3 text-lg font-medium transition-colors duration-200
                flex-grow text-center
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
