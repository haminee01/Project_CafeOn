"use client";

import { useState } from "react";
import { CafeDetail } from "@/data/cafeDetails";

interface CafeFeaturesSectionProps {
  cafe: CafeDetail;
}

export default function CafeFeaturesSection({
  cafe,
}: CafeFeaturesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_PREVIEW_LENGTH = 100; // 미리보기 최대 길이 (더 작게 설정)

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

  const description = cafe.description || "";

  // 디버깅: 실제 데이터 확인
  if (process.env.NODE_ENV === "development") {
    console.log("[CafeFeaturesSection] description:", description);
    console.log(
      "[CafeFeaturesSection] description length:",
      description.length
    );
  }

  // 백엔드에서 이미 잘려서 올 수 있으므로, "..."로 끝나는지 확인
  const isBackendTruncated = description.endsWith("...");
  const shouldShowExpandButton = description.length > MAX_PREVIEW_LENGTH;

  // 백엔드에서 이미 잘려서 온 경우, 전체 텍스트를 표시 (원본 데이터가 없으므로)
  // 프론트엔드에서 자르는 경우에만 자르기
  const displayText =
    isExpanded || !shouldShowExpandButton || isBackendTruncated
      ? description
      : `${description.substring(0, MAX_PREVIEW_LENGTH)}...`;

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
          <p className="whitespace-pre-line text-sm sm:text-base break-words">
            {displayText}
          </p>
          {shouldShowExpandButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-primary text-sm font-medium hover:underline focus:outline-none"
            >
              {isExpanded ? "접기" : "더보기"}
            </button>
          )}
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
