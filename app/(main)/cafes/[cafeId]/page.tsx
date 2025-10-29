"use client";

import { useState, use } from "react";
import Header from "@/components/common/Header";
import { mockCafes } from "@/data/mockCafes";
import { createCafeDetail, getSimilarCafes } from "@/data/cafeUtils";
import CafeInfoSection from "app/(main)/cafes/[cafeId]/components/CafeInfoSection";
import CafeFeaturesSection from "app/(main)/cafes/[cafeId]/components/CafeFeaturesSection";
import ReviewSection from "app/(main)/cafes/[cafeId]/components/ReviewSection";
import SimilarCafesSection from "app/(main)/cafes/[cafeId]/components/SimilarCafesSection";
import ShareModal from "@/components/modals/ShareModal";
import ChatRoomModal from "@/components/modals/ChatRoomModal";
import ReportModal from "@/components/modals/ReportModal";
import ReviewWriteModal from "@/components/modals/ReviewWriteModal";
// SaveModal은 더 이상 사용하지 않음 (위시리스트 기능으로 대체)
import Footer from "@/components/common/Footer";
import { useEscapeKey } from "../../../../src/hooks/useEscapeKey";

interface CafeDetailPageProps {
  params: Promise<{
    cafeId: string;
  }>;
}

export default function CafeDetailPage({ params }: CafeDetailPageProps) {
  const resolvedParams = use(params);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewWriteModal, setShowReviewWriteModal] = useState(false);
  // showSaveModal은 더 이상 사용하지 않음
  const [editingReview, setEditingReview] = useState<any>(null);
  const [refreshReviews, setRefreshReviews] = useState(0); // 리뷰 새로고침 트리거

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showShareModal) setShowShareModal(false);
    else if (showChatModal) setShowChatModal(false);
    else if (showReportModal) setShowReportModal(false);
    else if (showReviewWriteModal) {
      setShowReviewWriteModal(false);
      setEditingReview(null);
    }
  });

  // mockCafes에서 카페 데이터 찾기
  const cafeData = mockCafes.find((c) => c.cafe_id === resolvedParams.cafeId);

  // 기본값으로 문래 마이스페이스 사용 (cafe_id: "33")
  const defaultCafe = mockCafes.find((c) => c.cafe_id === "33") || mockCafes[0];
  const selectedCafe = cafeData || defaultCafe;

  // 카페 상세 정보 생성
  const cafe = createCafeDetail(selectedCafe);

  // 유사 카페 추천
  const similarCafes = getSimilarCafes(selectedCafe.cafe_id, mockCafes);

  // 모달 핸들러 함수들
  const handleShare = () => setShowShareModal(true);
  const handleChatRoom = () => setShowChatModal(true);
  const handleReportReview = () => setShowReportModal(true);
  // onSave는 더 이상 사용하지 않음 (위시리스트 기능으로 대체)
  const handleWriteReview = () => {
    setEditingReview(null);
    setShowReviewWriteModal(true);
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setShowReviewWriteModal(true);
  };

  // 리뷰 작성 완료 후 새로고침 트리거
  const handleReviewSubmitted = () => {
    setRefreshReviews((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* 카페 메인 정보 섹션 */}
      <CafeInfoSection
        cafe={cafe}
        cafeId={resolvedParams.cafeId}
        onChatRoom={handleChatRoom}
        onShare={handleShare}
        onSave={() => {}} // 더 이상 사용하지 않음
        onWriteReview={handleWriteReview}
      />

      {/* 카페 특징/태그 및 이미지 갤러리 섹션 */}
      <CafeFeaturesSection cafe={cafe} />

      {/* 리뷰 섹션 */}
      <ReviewSection
        cafeId={resolvedParams.cafeId}
        onReportReview={handleReportReview}
        onWriteReview={handleWriteReview}
        onEditReview={handleEditReview}
        refreshTrigger={refreshReviews}
      />

      {/* 유사 카페 추천 섹션 */}
      <SimilarCafesSection similarCafes={similarCafes} />

      {/* 모달들 */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          cafe={cafe}
          cafeId={resolvedParams.cafeId}
        />
      )}
      {showChatModal && (
        <ChatRoomModal onClose={() => setShowChatModal(false)} cafe={cafe} />
      )}
      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
      {showReviewWriteModal && (
        <ReviewWriteModal
          onClose={() => {
            setShowReviewWriteModal(false);
            setEditingReview(null);
          }}
          cafe={cafe}
          cafeId={resolvedParams.cafeId}
          editReview={editingReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <Footer />
    </div>
  );
}
