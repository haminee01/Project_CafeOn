"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/common/Pagination";
import { useQuestionList } from "@/hooks/useQnA";
import { QuestionVisibility } from "@/types/qna";

// 페이지네이션 상수
const ITEMS_PER_PAGE = 10;

// 문의 목록 컴포넌트
interface QuestionListProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  keyword: string;
}

const QuestionList = ({
  currentPage,
  onPageChange,
  keyword,
}: QuestionListProps) => {
  const router = useRouter();

  // 각 문의의 상태를 저장하는 상태
  const [questionStatuses, setQuestionStatuses] = useState<
    Record<number, string | null>
  >({});

  // API 호출
  const { questions, totalPages, isLoading, error, refetch } = useQuestionList({
    page: currentPage - 1, // API는 0부터 시작
    size: ITEMS_PER_PAGE,
    keyword: keyword || undefined,
  });

  // 각 문의의 상태를 조회하는 함수
  const fetchQuestionStatus = async (questionId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/qna/questions/${questionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const apiResponse = await response.json();
        const status = apiResponse.data.status;
        setQuestionStatuses((prev) => ({
          ...prev,
          [questionId]: status,
        }));
      }
    } catch (error) {
      console.error(`문의 ${questionId} 상태 조회 실패:`, error);
    }
  };

  // 문의 목록이 변경될 때마다 각 문의의 상태를 조회
  useEffect(() => {
    if (questions && questions.length > 0) {
      questions.forEach((question) => {
        if (!questionStatuses[question.id]) {
          fetchQuestionStatus(question.id);
        }
      });
    }
  }, [questions]);

  // 문의 상세 페이지로 이동
  const handleQuestionClick = (questionId: number) => {
    router.push(`/qna/${questionId}`);
  };

  // 가시성 텍스트 변환
  const getVisibilityText = (visibility: QuestionVisibility) => {
    return visibility === QuestionVisibility.PUBLIC ? "공개" : "비공개";
  };

  // 상태 텍스트 변환
  const getStatusText = (status: string | null) => {
    return status === "ANSWERED" ? "답변 완료" : "답변 대기";
  };

  // 상태 색상 변환
  const getStatusColor = (status: string | null) => {
    return status === "ANSWERED"
      ? "text-green-600 bg-green-100"
      : "text-orange-600 bg-orange-100";
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        문의 목록을 불러오는 중...
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
      {/* 문의 목록 표시 */}
      <div className="p-0">
        <ul className="space-y-0 divide-y divide-[#999999] border-t border-[#999999]">
          {questions.length > 0 ? (
            questions.map((item) => (
              <li key={item.id} className="text-base text-gray-800">
                {/* 문의 항목 클릭 영역 */}
                <button
                  onClick={() => handleQuestionClick(item.id)}
                  className="w-full flex justify-between items-center py-4 px-0 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* 문의 제목 */}
                    <span className="font-semibold text-left flex-1">
                      {item.title}
                    </span>

                    {/* 상태 배지 */}
                    {questionStatuses[item.id] && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          questionStatuses[item.id]
                        )}`}
                      >
                        {getStatusText(questionStatuses[item.id])}
                      </span>
                    )}

                    {/* 가시성 배지 */}
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                      {getVisibilityText(item.visibility)}
                    </span>
                  </div>

                  {/* 작성자 정보 */}
                  <div className="text-sm text-gray-500 ml-4">
                    {item.authorNickname}
                  </div>

                  {/* 작성일 정보 */}
                  <div className="text-sm text-gray-500 ml-4">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </div>

                  {/* 화살표 아이콘 */}
                  <svg
                    className="w-5 h-5 text-gray-400 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {keyword
                ? `"${keyword}"에 대한 검색 결과가 없습니다.`
                : "등록된 문의가 없습니다."}
            </div>
          )}
        </ul>
      </div>

      {/* 페이지네이션 컴포넌트 */}
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

// 메인 QnA 페이지 컴포넌트
export default function QnAPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

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

  // 문의 작성 페이지로 이동
  const handleCreateQuestion = () => {
    router.push("/qna/create");
  };

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
        {/* 헤더 영역 */}
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">QnA</h1>
            <button
              onClick={handleCreateQuestion}
              className="bg-[#6E4213] text-white px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
            >
              문의 작성
            </button>
          </div>
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

        {/* 문의 목록 및 페이지네이션 */}
        <QuestionList
          currentPage={currentPage}
          onPageChange={handlePageChange}
          keyword={searchKeyword}
        />
      </div>
    </div>
  );
}
