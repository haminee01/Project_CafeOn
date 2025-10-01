"use client";

import { useState } from "react";
import { CafeReview } from "@/data/cafeDetails";
import Button from "@/components/common/Button";

interface ReviewSectionProps {
  reviews: CafeReview[];
  onReportReview: () => void;
  onWriteReview: () => void;
  onEditReview?: (review: CafeReview) => void;
}

export default function ReviewSection({ reviews, onReportReview, onWriteReview, onEditReview }: ReviewSectionProps) {
  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);

  const toggleMenu = (reviewId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMenuFor(showMenuFor === reviewId ? null : reviewId);
  };

  const handleReport = (reviewId: number) => {
    onReportReview();
    setShowMenuFor(null);
  };

  const handleEdit = (reviewId: number) => {
    // 본인 리뷰인지 확인 (실제 구현에서는 사용자 인증 상태 확인)
    const review = reviews.find(r => r.id === reviewId);
    if (review && onEditReview) {
      onEditReview(review);
    }
    setShowMenuFor(null);
  };

  const handleDelete = (reviewId: number) => {
    // 본인 리뷰인지 확인 (실제 구현에서는 사용자 인증 상태 확인)
    console.log('리뷰 삭제:', reviewId);
    setShowMenuFor(null);
  };

  // 외부 클릭 시 메뉴 닫기
  const handleClickOutside = () => {
    setShowMenuFor(null);
  };

  return (
    <div className="py-12" onClick={handleClickOutside}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">리뷰 모아보기</h2>
        
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-secondary rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary">{review.user}</span>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="text-gray-800 pr-12 leading-relaxed break-words">
                      <div className="space-y-3">
                        <p className="text-sm whitespace-pre-wrap">{review.content}</p>
                        {/* 리뷰 이미지들 */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`리뷰 이미지 ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 점세개 버튼 */}
                    <div className="absolute top-0 right-0">
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => toggleMenu(review.id, e)}
                        color="gray"
                        size="sm"
                        className="!p-1 !min-w-0 !rounded-full !bg-transparent hover:!bg-gray-100 focus:!outline-none focus:!ring-0"
                      >
                        <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                      
                      {/* 토글 메뉴 */}
                      {showMenuFor === review.id && (
                        <div className="absolute right-0 top-8 bg-white border border-secondary rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleReport(review.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700"
                          >
                            신고하기
                          </button>
                          <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleEdit(review.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700"
                          >
                            리뷰삭제/수정
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            color="gray"
            size="md"
            className="!bg-transparent !text-primary focus:!ring-0 !border-0 !shadow-none hover:!underline"
          >
            리뷰 더보기
          </Button>
        </div>
      </div>
    </div>
  );
}
