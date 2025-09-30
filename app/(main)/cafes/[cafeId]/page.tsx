"use client";

import { useState } from "react";
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
import SaveModal from "@/components/modals/SaveModal";
import Footer from "@/components/common/Footer";

interface CafeDetailPageProps {
  params: {
    cafeId: string;
  };
}


export default function CafeDetailPage({ params }: CafeDetailPageProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewWriteModal, setShowReviewWriteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  // mockCafes에서 카페 데이터 찾기
  const cafeData = mockCafes.find(c => c.cafe_id === params.cafeId);
  
  // 기본값으로 문래 마이스페이스 사용 (cafe_id: "33")
  const defaultCafe = mockCafes.find(c => c.cafe_id === "33") || mockCafes[0];
  const selectedCafe = cafeData || defaultCafe;

  // 카페 상세 정보 생성
  const cafe = createCafeDetail(selectedCafe);

  // 유사 카페 추천
  const similarCafes = getSimilarCafes(selectedCafe.cafe_id, mockCafes);

  // 모달 핸들러 함수들
  const handleShare = () => setShowShareModal(true);
  const handleChatRoom = () => setShowChatModal(true);
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
      {/* 카페 메인 정보 섹션 */}
      <CafeInfoSection 
        cafe={cafe}
        onChatRoom={handleChatRoom}
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

      {/* 모달들 */}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} cafe={cafe} />}
      {showChatModal && <ChatRoomModal onClose={() => setShowChatModal(false)} cafe={cafe} />}
      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} />}
      {showSaveModal && <SaveModal onClose={() => setShowSaveModal(false)} cafe={cafe} />}
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
  }