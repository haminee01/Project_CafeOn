"use client";

import { useState, useEffect } from "react";
import { Cafe } from "@/types/cafe";
import CafeCard from "../../../../../src/components/cafes/CafeCard";

interface SimilarCafesSectionProps {
  similarCafes: Cafe[];
}

export default function SimilarCafesSection({
  similarCafes,
}: SimilarCafesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 아이폰 사이즈에서는 1개, 그 외에는 4개
  const getItemsPerPage = () => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    // 아이폰 사이즈 (최대 428px)에서는 1개
    if (width < 640) return 1; // sm breakpoint 미만
    return 4;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // 화면 크기 변경 감지 및 초기 설정
  useEffect(() => {
    // 초기 설정
    setItemsPerPage(getItemsPerPage());

    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, similarCafes.length - itemsPerPage);

  const nextSimilar = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSimilar = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  if (!similarCafes || similarCafes.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            이런 카페는 어떠세요?
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 transition-transform duration-300 ease-in-out px-4 sm:px-12">
            {similarCafes
              .slice(currentIndex, currentIndex + itemsPerPage)
              .map((cafe) => (
                <CafeCard key={cafe.cafe_id} cafe={cafe} />
              ))}
          </div>

          {/* 좌우 버튼 - 카드 그리드 양 옆에 배치 */}
          <button
            onClick={prevSimilar}
            className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg z-10"
            disabled={similarCafes.length <= itemsPerPage}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
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
            onClick={nextSimilar}
            className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg z-10"
            disabled={similarCafes.length <= itemsPerPage}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
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
        </div>
      </div>
    </div>
  );
}
