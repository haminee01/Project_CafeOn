"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/common/Pagination";
import {
  useMyQuestions,
  MyQuestion,
  QuestionStatus,
  QuestionVisibility,
} from "@/hooks/useMyQuestions";
import { useAuth } from "@/hooks/useAuth";

// 페이지네이션 상수
const ITEMS_PER_PAGE = 10;

// --- [ 문의 내역 리스트 컴포넌트 ] ---

interface InquiryContentProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  keyword: string;
}

const InquiryContent = ({
  currentPage,
  onPageChange,
  keyword,
}: InquiryContentProps) => {
  // 현재 열려 있는 문의 항목의 ID를 저장합니다.
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  // 아코디언 토글 핸들러
  const handleToggle = (itemId: number) => {
    setOpenItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  // API 호출
  const { questions, totalPages, isLoading, error, refetch } = useMyQuestions({
    page: currentPage - 1, // API는 0부터 시작
    size: ITEMS_PER_PAGE,
    keyword: keyword || undefined,
  });

  // 상태 표시 함수들
  const getStatusText = (status: QuestionStatus) => {
    switch (status) {
      case QuestionStatus.PENDING:
        return "답변 대기";
      case QuestionStatus.ANSWERED:
        return "답변 완료";
      default:
        return "알 수 없음";
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case QuestionStatus.PENDING:
        return "text-orange-600 bg-orange-100";
      case QuestionStatus.ANSWERED:
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getVisibilityText = (visibility: QuestionVisibility) => {
    return visibility === QuestionVisibility.PUBLIC ? "공개" : "비공개";
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        문의 내역을 불러오는 중...
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="text-red-600 mb-2">오류가 발생했습니다.</div>
        <div className="text-gray-500 mb-4">{error}</div>
        <button
          onClick={refetch}
          className="bg-[#6E4213] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 문의 내역 리스트 표시 */}
      <div className="p-0">
        <ul className="space-y-0 divide-y divide-[#999999] border-t border-[#999999]">
          {questions.length > 0 ? (
            questions.map((item) => (
              <li key={item.id} className="text-base text-gray-800">
                {/* 제목 및 토글 영역 */}
                <button
                  onClick={() => handleToggle(item.id)}
                  className="w-full flex justify-between items-center py-4 px-0 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* 문의 제목 */}
                    <span className="font-semibold">{item.title}</span>

                    {/* 상태 배지 */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>

                    {/* 가시성 배지 */}
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                      {getVisibilityText(item.visibility)}
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
                  <div className="bg-gray-50 p-4 border-t border-[#CDCDCD] text-gray-700">
                    <div className="mb-3">
                      <div className="text-sm text-gray-500 mb-1">
                        작성자: {item.authorNickname}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        작성일:{" "}
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">
                      {item.content || "문의 내용을 불러오는 중..."}
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {keyword
                ? `"${keyword}"에 대한 검색 결과가 없습니다.`
                : "문의 내역이 없습니다."}
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  // 인증 상태 확인
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(inputValue);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    setInputValue("");
    setSearchKeyword("");
    setCurrentPage(1);
  };

  const handleRegisterClick = () => {
    // 문의 등록 페이지로 이동
    router.push("/mypage/qna/create");
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">로그인이 필요합니다.</div>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-[#6E4213] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

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

      {/* 검색 영역 */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="문의 제목으로 검색..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E4213] focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-[#6E4213] text-white px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
          >
            검색
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              초기화
            </button>
          )}
        </form>
        {searchKeyword && (
          <div className="mt-2 text-sm text-gray-600">
            검색어: "{searchKeyword}"
          </div>
        )}
      </div>

      {/* 문의 내역 리스트 및 페이지네이션 */}
      <InquiryContent
        currentPage={currentPage}
        onPageChange={handlePageChange}
        keyword={searchKeyword}
      />
    </div>
  );
}
