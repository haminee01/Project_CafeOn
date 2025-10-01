"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import { mockCafes } from "@/data/mockCafes";
import { createCafeDetail, getSimilarCafes } from "@/data/cafeUtils";
import CafeInfoSection from "app/(main)/cafes/[cafeId]/components/CafeInfoSection";
import CafeFeaturesSection from "app/(main)/cafes/[cafeId]/components/CafeFeaturesSection";
import ReviewSection from "app/(main)/cafes/[cafeId]/components/ReviewSection";
import SimilarCafesSection from "app/(main)/cafes/[cafeId]/components/SimilarCafesSection";
import SnsShareModal from "@/components/modals/SnsShareModal";
import ChatRoomModal from "@/components/modals/ChatRoomModal";
import ReportModal from "@/components/modals/ReportModal";
import ReviewWriteModal from "@/components/modals/ReviewWriteModal";
import SaveModal from "@/components/modals/SaveModal";
import Footer from "@/components/common/Footer";
import { useEscapeKey } from "../../../../src/hooks/useEscapeKey";

interface CafeDetailClientProps {
  cafeId: string;
}

export default function CafeDetailClient({ cafeId }: CafeDetailClientProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewWriteModal, setShowReviewWriteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showShareModal) setShowShareModal(false);
    else if (showChatModal) setShowChatModal(false);
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
  const similarCafes = getSimilarCafes(cafeId, mockCafes);

  // 모달 핸들러 함수들
  const handleShare = () => setShowShareModal(true);
  const handleChat = () => setShowChatModal(true);
  const handleSave = () => setShowSaveModal(true);
  const handleReviewWrite = () => setShowReviewWriteModal(true);

  // 사용자 현재 위치 기반 거리 계산
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 페이지 로드 시 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // 백엔드에 거리 계산 요청
          try {
            const { cafeApi } = await import("@/lib/api");
            const result = await cafeApi.calculateDistance(
              cafeId,
              latitude,
              longitude
            );

            if (result.success && result.data) {
              setDistance(result.data.distance);
            } else {
              console.error("거리 계산 실패:", result.error?.message);
            }
          } catch (error) {
            console.error("거리 계산 요청 실패:", error);
          }
        },
        (error) => {
          console.error("위치 접근 실패:", error);
          setLocationError("위치 접근 권한이 필요합니다.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }
      );
    } else {
      setLocationError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
    }
  }, [cafeId]);

  if (!cafe) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">카페 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CafeInfoSection
        cafe={cafe}
        onChatRoom={handleChat}
        onShare={handleShare}
        onSave={handleSave}
        onWriteReview={handleReviewWrite}
        userLocation={userLocation}
        distance={distance}
        locationError={locationError}
      />

      <CafeFeaturesSection cafe={cafe} />

      <ReviewSection
        reviews={cafe.reviews}
        onEditReview={(review) => {
          setEditingReview(review);
          setShowReviewWriteModal(true);
        }}
        onReportReview={() => setShowReportModal(true)}
        onWriteReview={() => setShowReviewWriteModal(true)}
      />

      <SimilarCafesSection similarCafes={similarCafes} />

      <Footer />

      {/* 모달들 */}
      <SnsShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cafeData={cafe}
      />

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
          editReview={editingReview}
        />
      )}

      {showSaveModal && (
        <SaveModal
          onClose={() => setShowSaveModal(false)}
          cafe={{
            cafe_id: cafe.id,
            name: cafe.name,
            address: cafe.address,
          }}
        />
      )}
    </div>
  );
}
