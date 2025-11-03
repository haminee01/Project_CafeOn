"use client";

import { useState } from "react";
import { Cafe } from "@/types/cafe";
import CafeCard from "./CafeCard";

interface CafeCarouselProps {
  cafes: Cafe[];
  className?: string;
  title?: string;
  description?: string;
  showAllButton?: boolean;
}

const CafeCarousel: React.FC<CafeCarouselProps> = ({
  cafes,
  className = "",
  title = "추천 카페",
  description = "추천드리는 카페예요.",
  showAllButton = true,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 4; // 4개로 제한
  const totalPages = Math.ceil(cafes.length / cardsPerPage);

  const goToPrevious = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const goToNext = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCafes = cafes.slice(startIndex, endIndex);

  if (cafes.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600">표시할 카페가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="relative">
        {/* 카페 카드 그리드 - 한 줄로 제한 */}
        <div className="grid grid-cols-4 gap-5 px-12">
          {currentCafes.map((cafe) => (
            <CafeCard key={cafe.cafe_id} cafe={cafe} />
          ))}
        </div>

        {/* 좌우 버튼 - 카드 그리드 양 옆에 배치 */}
        <button
          onClick={goToPrevious}
          disabled={currentPage === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors z-10 ${
            currentPage === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg border"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors z-10 ${
            currentPage === totalPages - 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg border"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* 페이지 인디케이터 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPage ? "bg-gray-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeCarousel;
