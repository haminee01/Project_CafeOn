// app/(main)/support/notices/page.tsx
"use client";

import { useState, useCallback } from "react";
import Pagination from "@/components/common/Pagination";

interface NoticeItemProps {
  title: string;
  count: number;
}

const NoticeItem: React.FC<NoticeItemProps> = ({ title, count }) => {
  return (
    <div className="py-4 border-b border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center text-lg font-medium text-gray-800">
        <span className="hover:text-[#6E4213] transition-colors">{title}</span>
        <span className="text-sm text-gray-500 ml-4">({count})</span>
      </div>
    </div>
  );
};

// --- 2. 데이터 및 설정 ---
interface Notice {
  id: number;
  title: string;
  count: number;
}

const DUMMY_NOTICES: Notice[] = [
  { id: 1, title: "빨방렐라또", count: 3 },
  { id: 2, title: "어쩌구 저쩌구", count: 3 },
  { id: 3, title: "어쩌구 저쩌구", count: 3 },
  { id: 4, title: "어쩌구 저쩌구", count: 3 },
  { id: 5, title: "어쩌구 저쩌구", count: 3 },
  { id: 6, title: "어쩌구 저쩌구", count: 3 },
  { id: 7, title: "어쩌구 저쩌구", count: 3 },
  { id: 8, title: "어쩌구 저쩌구", count: 3 },
  { id: 9, title: "어쩌구 저쩌구", count: 3 },
  { id: 10, title: "어쩌구 저쩌구", count: 3 },
];

const FINAL_TOTAL_PAGES = 5;

// --- 3. NoticePage 컴포넌트 ---
const NoticePage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= FINAL_TOTAL_PAGES) {
      setCurrentPage(page);
      // 실제 API 호출 로직은 여기에 들어갑니다.
      console.log(`페이지 ${page} 로드`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-16 bg-white shadow-sm">
        <h1 className="text-4xl font-bold mb-10 text-gray-900">알림</h1>

        {/* 공지 리스트 */}
        <div className="space-y-0.5 mb-16">
          {DUMMY_NOTICES.map((notice) => (
            <NoticeItem
              key={notice.id}
              title={notice.title}
              count={notice.count}
            />
          ))}
        </div>

        {/* 페이지네이션 컴포넌트 */}
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={FINAL_TOTAL_PAGES}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default NoticePage;
