"use client";

import React, { useState, use } from "react";
import Header from "@/components/common/Header";
import { mockCafes } from "@/data/mockCafes";
import { createCafeDetail, getSimilarCafes } from "@/data/cafeUtils";
import CafeInfoSection from "app/(main)/cafes/[cafeId]/components/CafeInfoSection";
import CafeFeaturesSection from "app/(main)/cafes/[cafeId]/components/CafeFeaturesSection";
import ReviewSection from "app/(main)/cafes/[cafeId]/components/ReviewSection";
import SimilarCafesSection from "app/(main)/cafes/[cafeId]/components/SimilarCafesSection";
import ShareModal from "@/components/modals/ShareModal";
import ReportModal from "@/components/modals/ReportModal";
import ReviewWriteModal from "@/components/modals/ReviewWriteModal";
import SaveModal from "@/components/modals/SaveModal";
import Footer from "@/components/common/Footer";
import { useEscapeKey } from "../../../../src/hooks/useEscapeKey";
import ChatModal from "../../../../src/components/chat/CafeChatModal";

interface CafeDetailPageProps {
  params: Promise<{
    cafeId: string;
  }>;
}

const CafeDetailPage: React.FC<CafeDetailPageProps> = ({ params }) => {
  // 1. 모달 열림 상태를 관리하는 State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewWriteModal, setShowReviewWriteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  // 2. 현재 카페 정보 (실제로는 API에서 가져옵니다)
  const resolvedParams = use(params);
  const cafeId = resolvedParams.cafeId;
  const cafeName = `문래 마이스페이스 ${cafeId}`;

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (isChatModalOpen) setIsChatModalOpen(false);
    else if (showShareModal) setShowShareModal(false);
    else if (showReportModal) setShowReportModal(false);
    else if (showReviewWriteModal) {
      setShowReviewWriteModal(false);
      setEditingReview(null);
    } else if (showSaveModal) setShowSaveModal(false);
  });

  // mockCafes에서 카페 데이터 찾기
  const cafeData = mockCafes.find((c) => c.cafe_id === cafeId);

  // 기본값으로 문래 마이스페이스 사용 (cafe_id: "33")
  const defaultCafe = mockCafes.find((c) => c.cafe_id === "33") || mockCafes[0];
  const selectedCafe = cafeData || defaultCafe;

  // 카페 상세 정보 생성
  const cafe = createCafeDetail(selectedCafe);

  // 유사 카페 추천
  const similarCafes = getSimilarCafes(selectedCafe.cafe_id, mockCafes);

  // 3. 모달을 띄우는 핸들러 함수들
  const handleOpenChat = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };

  // 기존 모달 핸들러 함수들
  const handleShare = () => setShowShareModal(true);
  const handleReportReview = () => setShowReportModal(true);
  const handleSave = () => setShowSaveModal(true);
  const handleWriteReview = () => {
    setEditingReview(null);
    setShowReviewWriteModal(true);
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setShowReviewWriteModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 카페 메인 정보 섹션 */}
      <CafeInfoSection
        cafe={cafe}
        cafeId={cafeId}
        latitude={selectedCafe.latitude}
        longitude={selectedCafe.longitude}
        onChatRoom={handleOpenChat}
        onShare={handleShare}
        onSave={handleSave}
        onWriteReview={handleWriteReview}
      />

      {/* 카페 특징/태그 및 이미지 갤러리 섹션 */}
      <CafeFeaturesSection cafe={cafe} />

      {/* 리뷰 섹션 */}
      <ReviewSection
        reviews={cafe.reviews}
        onReportReview={handleReportReview}
        onWriteReview={handleWriteReview}
        onEditReview={handleEditReview}
      />

      {/* 유사 카페 추천 섹션 */}
      <SimilarCafesSection similarCafes={similarCafes} />

      {/* 4. 모달 조건부 렌더링 (원래 로직) */}
      {isChatModalOpen && (
        <ChatModal
          cafeId={cafeId}
          cafeName={cafeName}
          onClose={handleCloseChat}
        />
      )}

      {/* 기존 모달들 */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          cafe={cafe}
          cafeId={cafeId}
        />
      )}
      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
      {showSaveModal && (
        <SaveModal onClose={() => setShowSaveModal(false)} cafe={cafe} />
      )}
      {showReviewWriteModal && (
        <ReviewWriteModal
          onClose={() => {
            setShowReviewWriteModal(false);
            setEditingReview(null);
          }}
          cafe={cafe}
          editReview={editingReview}
        />
      )}

      <Footer />
    </div>
  );
};

export default CafeDetailPage;
