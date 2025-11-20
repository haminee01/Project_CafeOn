"use client";

import { CafeDetail } from "@/data/cafeDetails";

interface CafeFeaturesSectionProps {
  cafe: CafeDetail;
}

export default function CafeFeaturesSection({
  cafe,
}: CafeFeaturesSectionProps) {
  // 리뷰 요약 실패 여부 확인
  const isSummaryFailed = (description: string | null | undefined): boolean => {
    if (!description) return true;

    // 요약 실패 패턴 체크
    const failedPatterns = [
      "요약 실패:",
      "Insufficient credits",
      '"error"',
      '"code": 402',
      "This account never purchased credits",
    ];

    return failedPatterns.some((pattern) => description.includes(pattern));
  };

  const hasValidSummary =
    cafe.description && !isSummaryFailed(cafe.description);

  // 요약이 없거나 실패한 경우 전체 섹션 숨김
  if (!hasValidSummary) {
    return null;
  }

  return (
    <div className="py-6 sm:py-8" style={{ backgroundColor: "#F4EDE5" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {cafe.name} 이런 카페예요!
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          리뷰 요약을 통해 빠르게 카페에 대한 정보를 파악하세요.
        </p>

        {/* 리뷰 요약 description */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg mb-4 sm:mb-6 text-gray-700 leading-relaxed">
          <p className="whitespace-pre-line text-sm sm:text-base">
            {cafe.description}
          </p>
        </div>

        {/* 카테고리 필터/태그 */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
          {cafe.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
