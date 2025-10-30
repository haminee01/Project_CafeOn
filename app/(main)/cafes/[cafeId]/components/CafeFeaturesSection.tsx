"use client";

import { CafeDetail } from "@/data/cafeDetails";

interface CafeFeaturesSectionProps {
  cafe: CafeDetail;
}

export default function CafeFeaturesSection({ cafe }: CafeFeaturesSectionProps) {
  return (
    <div className="py-8" style={{ backgroundColor: "#F4EDE5" }}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{cafe.name} 이런 카페예요!</h2>
        <p className="text-gray-600 mb-4">리뷰 요약을 통해 빠르게 카페에 대한 정보를 파악하세요.</p>
        
        {/* 리뷰 요약 description */}
        {cafe.description && (
          <div className="bg-white p-6 rounded-lg mb-6 text-gray-700 leading-relaxed">
            <p className="whitespace-pre-line">{cafe.description}</p>
          </div>
        )}
        
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
      </div>
    </div>
  );
}
