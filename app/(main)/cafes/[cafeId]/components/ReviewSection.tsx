"use client";

import { useState, useEffect } from "react";
import { CafeReview } from "@/data/cafeDetails";
import Button from "@/components/common/Button";
import { getCafeReviews, deleteReview, reportReview } from "@/lib/api";
import apiClient from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/common/Toast";
import ReportReviewModal from "@/components/modals/ReportReviewModal";
import LoginPromptModal from "@/components/modals/LoginPromptModal";

// 날짜 포맷 함수
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "오늘";
    } else if (diffDays === 1) {
      return "어제";
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}주 전`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}개월 전`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}년 전`;
    }
  } catch {
    return dateString;
  }
};

interface ReviewSectionProps {
  cafeId: string;
  onReportReview: () => void;
  onWriteReview: () => void;
  onEditReview?: (review: CafeReview) => void;
  refreshTrigger?: number; // 리뷰 새로고침 트리거
  initialReviews?: any[]; // 카페 상세 API에서 가져온 리뷰 목록
}

// 백엔드 API 응답 타입
interface ApiReview {
  reviewId: number;
  rating: number;
  content: string;
  createdAt: string;
  reviewerId: string;
  reviewerNickname: string;
  reviewerProfileImageUrl?: string;
  images?: any[]; // 이미지 정보
}

export default function ReviewSection({
  cafeId,
  onReportReview,
  onWriteReview,
  onEditReview,
  refreshTrigger,
  initialReviews = [],
}: ReviewSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<CafeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<number | null>(
    null
  );
  const [reportingReviewAuthor, setReportingReviewAuthor] =
    useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 리뷰 새로고침 함수
  const refreshReviews = async () => {
    try {
      setLoading(true);

      // initialReviews가 있으면 사용
      if (initialReviews && initialReviews.length > 0) {
        // API 응답 형식의 리뷰를 프론트엔드 CafeReview 형식으로 변환
        const transformedReviews: CafeReview[] = initialReviews.map((r: any) => ({
          id: r.reviewId,
          user: r.reviewerNickname || "익명",
          rating: r.rating,
          content: r.content,
          date: formatDate(r.createdAt), // 날짜 포맷팅 적용
          likes: 0, // API에 없으므로 기본값
          images: r.images?.map((img: any) => img.publicUrl || img.url) || [],
          reviewerId: r.reviewerId,
        }));
        setReviews(transformedReviews);
      } else {
        setReviews([]);
      }
    } catch (error: any) {
      console.error("리뷰 새로고침 실패:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // 리뷰 목록 로드
  useEffect(() => {
    refreshReviews();
  }, [cafeId, initialReviews]);

  // 리뷰 작성 완료 후 새로고침 (주석 처리 - 백엔드 에러로 인해 임시 비활성화)
  // useEffect(() => {
  //   if (refreshTrigger && refreshTrigger > 0) {
  //     refreshReviews();
  //   }
  // }, [refreshTrigger]);

  const toggleMenu = (reviewId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMenuFor(showMenuFor === reviewId ? null : reviewId);
  };

  // 리뷰 작성자인지 확인하는 함수
  const isMyReview = (review: CafeReview) => {
    if (!user || !isAuthenticated) return false;

    // reviewerId가 있으면 사용자 ID로 비교
    if (review.reviewerId) {
      return user.userId === review.reviewerId;
    }

    // reviewerId가 없으면 false 반환 (안전한 기본값)
    // 실제로는 백엔드에서 사용자 ID를 제공해야 함
    return false;
  };

  // 리뷰 작성 버튼 클릭 핸들러
  const handleWriteReview = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    onWriteReview();
  };

  const handleReport = (reviewId: number) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setShowMenuFor(null);
      return;
    }

    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      setReportingReviewId(reviewId);
      setReportingReviewAuthor(review.user);
      setShowReportModal(true);
    }
    setShowMenuFor(null);
  };

  const handleEdit = (reviewId: number) => {
    if (!isAuthenticated) {
      setToast({
        message: "로그인이 필요한 서비스입니다.",
        type: "error",
      });
      return;
    }

    const review = reviews.find((r) => r.id === reviewId);
    if (!review) {
      setToast({
        message: "리뷰를 찾을 수 없습니다.",
        type: "error",
      });
      return;
    }

    // 본인 리뷰인지 확인
    if (!isMyReview(review)) {
      setToast({
        message: "본인의 리뷰만 수정할 수 있습니다.",
        type: "error",
      });
      return;
    }

    if (onEditReview) {
      onEditReview(review);
    }
    setShowMenuFor(null);
  };

  const handleDelete = async (reviewId: number) => {
    if (!isAuthenticated) {
      setToast({
        message: "로그인이 필요한 서비스입니다.",
        type: "error",
      });
      return;
    }

    try {
      await deleteReview(reviewId.toString());
      setToast({
        message: "리뷰가 삭제되었습니다.",
        type: "success",
      });
      // 리뷰 목록에서 제거
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error: any) {
      console.error("리뷰 삭제 실패:", error);
      setToast({
        message: "리뷰 삭제에 실패했습니다.",
        type: "error",
      });
    }
    setShowMenuFor(null);
  };

  // 외부 클릭 시 메뉴 닫기
  const handleClickOutside = () => {
    setShowMenuFor(null);
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            리뷰 모아보기
          </h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">리뷰를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12" onClick={handleClickOutside}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          리뷰 모아보기
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">
              아직 작성된 리뷰가 없습니다.
            </p>
            <Button onClick={handleWriteReview} color="primary" size="md">
              첫 리뷰 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-secondary rounded-lg p-6 bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-secondary">
                          {review.user}
                        </span>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                        {/* 별점 표시 */}
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(review.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-500 ml-1">
                            {review.rating || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-gray-800 pr-12 leading-relaxed break-words">
                        <div className="space-y-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {review.content}
                          </p>
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

                      {/* 점세개 버튼 - 본인 리뷰이거나 로그인한 사용자만 표시 */}
                      {(isMyReview(review) || isAuthenticated) && (
                        <div className="absolute top-0 right-0">
                          <Button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                              toggleMenu(review.id, e)
                            }
                            color="gray"
                            size="sm"
                            className="!p-1 !min-w-0 !rounded-full !bg-transparent hover:!bg-gray-100 focus:!outline-none focus:!ring-0"
                          >
                            <svg
                              className="w-4 h-4 text-secondary"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Button>

                          {/* 토글 메뉴 */}
                          {showMenuFor === review.id && (
                            <div className="absolute right-0 top-8 bg-white border border-secondary rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              {/* 신고하기 - 본인 리뷰가 아닌 경우에만 표시 */}
                              {!isMyReview(review) && (
                                <button
                                  onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    e.stopPropagation();
                                    handleReport(review.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  신고하기
                                </button>
                              )}
                              {/* 수정하기/삭제하기 - 본인 리뷰인 경우에만 표시 */}
                              {isMyReview(review) && (
                                <>
                                  <button
                                    onClick={(
                                      e: React.MouseEvent<HTMLButtonElement>
                                    ) => {
                                      e.stopPropagation();
                                      handleEdit(review.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    수정하기
                                  </button>
                                  <button
                                    onClick={(
                                      e: React.MouseEvent<HTMLButtonElement>
                                    ) => {
                                      e.stopPropagation();
                                      handleDelete(review.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                                  >
                                    삭제하기
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리뷰가 있을 때만 버튼 표시 */}
        {reviews.length > 0 && (
          <div className="text-center mt-8 space-x-4">
            <Button onClick={handleWriteReview} color="primary" size="md">
              리뷰 작성하기
            </Button>
            <Button
              color="gray"
              size="md"
              className="!bg-transparent !text-primary focus:!ring-0 !border-0 !shadow-none hover:!underline"
            >
              리뷰 더보기
            </Button>
          </div>
        )}

        {/* 토스트 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* 신고 모달 */}
        {showReportModal && reportingReviewId && (
          <ReportReviewModal
            onClose={() => {
              setShowReportModal(false);
              setReportingReviewId(null);
              setReportingReviewAuthor("");
            }}
            reviewId={reportingReviewId}
            reviewAuthor={reportingReviewAuthor}
          />
        )}

        {/* 로그인 유도 모달 */}
        {showLoginPrompt && (
          <LoginPromptModal
            onClose={() => setShowLoginPrompt(false)}
            message="로그인 후 리뷰 작성을 할 수 있습니다."
          />
        )}
      </div>
    </div>
  );
}
