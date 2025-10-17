"use client";

import { useState } from "react";
import { CafeDetail } from "@/data/cafeDetails";

interface CafeFeaturesSectionProps {
  cafe: CafeDetail;
}

export default function CafeFeaturesSection({ cafe }: CafeFeaturesSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const itemsPerView = 3; // 한 번에 보여줄 이미지 개수

  const nextImages = () => {
    const maxIndex = Math.max(0, cafe.images.length - itemsPerView);
    setCurrentImageIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevImages = () => {
    const maxIndex = Math.max(0, cafe.images.length - itemsPerView);
    setCurrentImageIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };
  return (
    <div className="py-8" style={{ backgroundColor: "#F4EDE5" }}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{cafe.name} 이런 카페예요!</h2>
        <p className="text-gray-600 mb-4">리뷰 요약을 통해 빠르게 카페에 대한 정보를 파악하세요.</p>
        
        {/* 카테고리 필터/태그 */}
        <div className="flex flex-wrap gap-3 mb-4">
          {cafe.tags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 이미지 갤러리 */}
        <div className="relative">
          {/* 이전 버튼 */}
          <button 
            onClick={prevImages}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              cafe.images.length <= itemsPerView 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
            disabled={cafe.images.length <= itemsPerView}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 이미지 컨테이너 */}
          <div className="flex gap-4 overflow-hidden mx-14 justify-center">
            {cafe.images.slice(currentImageIndex, currentImageIndex + itemsPerView).map((image, index) => (
              <div key={currentImageIndex + index} className="flex-shrink-0 w-80 h-48 bg-white rounded-lg flex items-center justify-center text-gray-500">
                카페 이미지 {currentImageIndex + index + 1}
              </div>
            ))}
          </div>

          {/* 다음 버튼 */}
          <button 
            onClick={nextImages}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              cafe.images.length <= itemsPerView 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
            disabled={cafe.images.length <= itemsPerView}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
