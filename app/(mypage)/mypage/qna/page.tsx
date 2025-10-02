"use client";

import { useState } from "react";
import Pagination from "@/components/common/Pagination";

// --- [ 데이터 정의 및 상수 ] ---

// Mock 데이터 생성 (총 50개의 항목)
const createMockInquiries = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    // 문의 제목
    title: `팔랑멜라또 문의 ${i + 1}: 환불 절차 관련하여 문의드립니다.`,
    // 문의 내용 (아코디언으로 펼쳐질 부분)
    content: `안녕하세요. 주문하신 상품의 환불 절차는 영업일 기준 3일 이내에 처리되며, 자세한 내용은 첨부된 문서를 확인해 주십시오. [문의 번호: #A${
      i + 1
    }B]`,
    // 답글 개수
    replyCount: (i % 5) + 1,
    date: `2024-05-${String((i % 30) + 1).padStart(2, "0")}`,
  }));
};

const mockInquiryData = createMockInquiries();

// 페이지네이션 상수
const ITEMS_PER_PAGE = 10;

// --- [ 문의 내역 리스트 컴포넌트 ] ---

interface InquiryContentProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const InquiryContent = ({ currentPage, onPageChange }: InquiryContentProps) => {
  // 현재 열려 있는 문의 항목의 ID를 저장합니다.
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  // 아코디언 토글 핸들러
  const handleToggle = (itemId: number) => {
    setOpenItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  const totalItems = mockInquiryData;
  const totalPages = Math.ceil(totalItems.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = totalItems.slice(startIndex, endIndex);

  return (
    <>
      {/* 문의 내역 리스트 표시 */}
      <div className="p-0">
        <ul className="space-y-0 divide-y divide-[#999999] border-t border-[#999999]">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <li key={item.id} className="text-base text-gray-800">
                {/* 제목 및 토글 영역 */}
                <button
                  onClick={() => handleToggle(item.id)}
                  className="w-full flex justify-between items-center py-4 px-0 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    {/* 문의 제목 */}
                    <span className="font-semibold">{item.title}</span>
                    {/* 답글 개수 */}
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.replyCount})
                    </span>
                  </div>

                  {/* 화살표 아이콘 */}
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${
                      openItemId === item.id ? "transform rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* 내용 영역 (열렸을 때만 표시) */}
                {openItemId === item.id && (
                  <div className="bg-gray-50 p-4 border-t border-[#CDCDCD] text-gray-700 whitespace-pre-wrap">
                    {item.content}
                  </div>
                )}
              </li>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              문의 내역이 없습니다.
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

// --- [ 메인 페이지 컴포넌트 ] ---

export default function InquiryHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const handleRegisterClick = () => {
    // 문의 등록 페이지로 이동하는 로직
    alert("문의 등록 페이지로 이동합니다.");
  };

  return (
    <div className="p-8 bg-white min-h-full">
      {/* 헤더 영역: "나의 문의 내역" (왼쪽) 과 "등록" 버튼 (오른쪽) 배치 */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">나의 문의 내역</h1>
        <button
          onClick={handleRegisterClick}
          className="bg-[#6E4213] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
        >
          등록
        </button>
      </header>

      {/* 문의 내역 리스트 및 페이지네이션 */}
      <InquiryContent
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
