"use client";

import { useState, use, useEffect } from "react";
import Header from "@/components/common/Header";
import { mockCafes } from "@/data/mockCafes";
import { createCafeDetail, getSimilarCafes } from "@/data/cafeUtils";
import { getCafeDetail } from "@/lib/api";
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
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카페 상세 정보 로드
  useEffect(() => {
    const fetchCafeDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API에서 카페 상세 정보 조회
        const cafeData = await getCafeDetail(resolvedParams.cafeId);
        setCafe(cafeData);
      } catch (err: any) {
        console.error("카페 상세 정보 조회 실패:", err);
        setError(err.message || "카페 정보를 불러오는데 실패했습니다.");
        
        // API 실패 시 mock 데이터로 fallback
        const cafeData = mockCafes.find((c) => c.cafe_id === resolvedParams.cafeId);
        const defaultCafe = mockCafes.find((c) => c.cafe_id === "33") || mockCafes[0];
        const selectedCafe = cafeData || defaultCafe;
        const fallbackCafe = createCafeDetail(selectedCafe);
        setCafe(fallbackCafe);
      } finally {
        setLoading(false);
      }
    };

    fetchCafeDetail();
  }, [resolvedParams.cafeId]);

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

  // 로딩 중이거나 카페 데이터가 없을 때
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">카페 정보를 불러오는 중...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            {error || "카페 정보를 찾을 수 없습니다."}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
      <SimilarCafesSection similarCafes={mockCafes.slice(0, 4)} />

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
