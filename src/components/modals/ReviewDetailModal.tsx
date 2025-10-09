"use client";

import { useState } from "react";
import { CafeReview } from "@/data/cafeDetails";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface ReviewDetailModalProps {
  onClose: () => void;
  cafe: {
    name: string;
  };
  review: CafeReview;
}

export default function ReviewDetailModal({ onClose, cafe, review }: ReviewDetailModalProps) {
  useEscapeKey(onClose);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleReport = () => {
    console.log('리뷰 신고:', reportReason);
    // 실제 구현에서는 리뷰 신고 로직
    alert('신고가 접수되었습니다.');
    setShowReportForm(false);
    setReportReason("");
  };

  const handleToggleReportForm = () => {
    setShowReportForm(!showReportForm);
    if (showReportForm) {
      setReportReason("");
    }
  };

  const nextImage = () => {
    if (review.images && review.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % review.images!.length);
    }
  };

  const prevImage = () => {
    if (review.images && review.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + review.images!.length) % review.images!.length);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">리뷰 상세보기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* 사용자 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-gray-900">{review.user}</span>
                {review.date && (
                  <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleToggleReportForm}
              className="text-gray-400 py-2 px-4 text-sm font-medium underline"
            >
              부적절한 리뷰인가요?
            </button>
          </div>

          {/* 이미지 영역 */}
          {review.images && review.images.length > 0 ? (
            <div className="relative">
              <div className="bg-gray-200 h-64 rounded-lg overflow-hidden">
                <img 
                  src={review.images[currentImageIndex]} 
                  alt={`리뷰 이미지 ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 캐러셀 네비게이션 버튼 */}
              {review.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* 이미지 인디케이터 */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {review.images.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 h-64 rounded-lg p-8 flex items-center justify-center">
              <div className="bg-gray-400 rounded-lg p-4">
                <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* 리뷰 내용 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">리뷰 내용</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{review.content}</p>
            </div>
          </div>

          {/* 신고 사유 작성 폼 */}
          {showReportForm && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-medium text-red-800 mb-3">신고 사유를 입력해주세요</h4>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                rows={3}
                placeholder="신고 사유를 자세히 입력해주세요..."
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleToggleReportForm}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                  className={`py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                    reportReason.trim() 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  신고 접수
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
