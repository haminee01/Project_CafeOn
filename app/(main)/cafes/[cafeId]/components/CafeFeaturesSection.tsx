"use client";

import { CafeDetail } from "@/data/cafeDetails";

interface CafeFeaturesSectionProps {
  cafe: CafeDetail;
}

export default function CafeFeaturesSection({ cafe }: CafeFeaturesSectionProps) {
  // 리뷰 요약 실패 여부 확인
  const isSummaryFailed = (description: string | null | undefined): boolean => {
    if (!description) return true;
    
    // 요약 실패 패턴 체크
    const failedPatterns = [
      "요약 실패:",
      "Insufficient credits",
      '"error"',
      '"code": 402',
      "This account never purchased credits"
    ];
    
    return failedPatterns.some(pattern => description.includes(pattern));
  };

  const hasValidSummary = cafe.description && !isSummaryFailed(cafe.description);

  // 요약이 없거나 실패한 경우 전체 섹션 숨김
  if (!hasValidSummary) {
    return null;
  }

  return (
    <div className="py-8" style={{ backgroundColor: "#F4EDE5" }}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{cafe.name} 이런 카페예요!</h2>
        <p className="text-gray-600 mb-4">리뷰 요약을 통해 빠르게 카페에 대한 정보를 파악하세요.</p>
        
        {/* 리뷰 요약 description */}
        <div className="bg-white p-6 rounded-lg mb-6 text-gray-700 leading-relaxed">
          <p className="whitespace-pre-line">{cafe.description}</p>
        </div>
        
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
