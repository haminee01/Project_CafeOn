"use client";

import { useState, useEffect } from "react";
import { CafeDetail } from "@/data/cafeDetails";
import Button from "@/components/common/Button";
import { getWishlistCategories } from "@/lib/api";
import WishlistModal from "@/components/modals/WishlistModal";
import LoginPromptModal from "@/components/modals/LoginPromptModal";
import { useAuth } from "@/contexts/AuthContext";

interface CafeInfoSectionProps {
  cafe: CafeDetail;
  cafeId: string;
  onChatRoom: () => void;
  onShare: () => void;
  onSave: () => void;
  onWriteReview: () => void;
}

export default function CafeInfoSection({
  cafe,
  cafeId,
  onChatRoom,
  onShare,
  onSave,
  onWriteReview,
}: CafeInfoSectionProps) {
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHoursDetail, setShowHoursDetail] = useState<boolean>(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistCategories, setWishlistCategories] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cafe.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + cafe.images.length) % cafe.images.length
    );
  };

  // 위시리스트 카테고리 로드
  const loadWishlistCategories = async () => {
    try {
      setWishlistLoading(true);
      const response = await getWishlistCategories(cafeId);
      if (response?.data) {
        setWishlistCategories(response.data);
      }
    } catch (error: any) {
      console.error("위시리스트 카테고리 로드 실패:", error);
      // 403 오류인 경우 로그인 유도 모달 표시
      if (error?.response?.status === 403) {
        setShowLoginPrompt(true);
      }
      // 백엔드 서버가 실행되지 않은 경우 빈 배열로 초기화
      setWishlistCategories([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  // 위시리스트 모달 열기 (로그인 상태 확인)
  const handleWishlistClick = () => {
    // 로그인하지 않은 상태에서 저장 버튼 클릭 시 즉시 로그인 유도 모달 표시
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    // 로그인한 상태에서만 위시리스트 모달 열기
    loadWishlistCategories();
    setShowWishlistModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 좌측 이미지 영역 */}
        <div className="relative">
          <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden relative">
            {cafe.images && cafe.images.length > 0 ? (
              <img
                src={cafe.images[currentImageIndex]}
                alt={`${cafe.name} 이미지`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지로 대체
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#f3f4f6"/>
                      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="18">
                        ☕ 카페 이미지
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-2">☕</div>
                  <div className="text-lg font-medium">카페 이미지</div>
                </div>
              </div>
            )}

            {/* 이미지 네비게이션 버튼 (여러 이미지가 있을 때만) */}
            {cafe.images && cafe.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* 이미지 인디케이터 */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {cafe.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 우측 상세 정보 */}
        <div className="space-y-6 w-3/4">
          {/* 카페 이름 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cafe.name}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{cafe.slogan}</p>
            <p className="text-gray-700 leading-relaxed">{cafe.description}</p>
          </div>

          {/* 위치 정보 */}
          <div className="space-y-4">
            {/* 주소 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                <svg
                  className="w-full h-full text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium">{cafe.address}</p>
                <p className="text-sm text-gray-600 mt-1">{cafe.subway}</p>
              </div>
            </div>

            {/* 연락처 */}
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex-shrink-0">
                <svg
                  className="w-full h-full text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <span className="text-gray-900 underline">{cafe.phone}</span>
            </div>

            {/* 영업시간 */}
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-gray-900">{cafe.hoursDetail.status}</span>
                {cafe.hoursDetail.lastOrder && (
                  <span className="text-gray-900 ml-2">
                    {cafe.hoursDetail.lastOrder} 라스트오더
                  </span>
                )}
                <Button
                  onClick={() => {
                    setShowHoursDetail((prev) => !prev);
                  }}
                  color="gray"
                  size="sm"
                  className="flex-shrink-0 p-1 min-w-0 bg-transparent"
                  type="button"
                >
                  <span
                    className={`inline-block transform transition-transform duration-200 ${
                      showHoursDetail ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▲
                  </span>
                </Button>
              </div>
            </div>

            {/* 영업시간 상세 정보 토글 */}
            {showHoursDetail && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태:</span>
                    <span
                      className={`font-medium ${
                        cafe.hoursDetail.status === "영업 중"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {cafe.hoursDetail.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">운영시간:</span>
                    <span className="text-gray-900">
                      {cafe.hoursDetail.fullHours}
                    </span>
                  </div>
                  {cafe.hoursDetail.lastOrder && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">라스트오더:</span>
                      <span className="text-gray-900">
                        {cafe.hoursDetail.lastOrder}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">브레이크타임:</span>
                    <span className="text-gray-900">
                      {cafe.hoursDetail.breakTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">휴무일:</span>
                    <span className="text-gray-900">
                      {cafe.hoursDetail.closedDays}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between gap-3">
            <Button onClick={onChatRoom} color="primary" size="md">
              채팅방 참여
            </Button>
            <div className="flex gap-2">
              <button
                onClick={handleWishlistClick}
                className={`flex flex-col items-center justify-center border rounded-lg h-12 w-20 transition-colors ${
                  wishlistCategories.length > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-primary hover:bg-gray-50"
                }`}
              >
                {wishlistLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mb-1"></div>
                ) : (
                  <svg
                    className={`w-5 h-5 mb-1 ${
                      wishlistCategories.length > 0
                        ? "text-primary"
                        : "text-primary"
                    }`}
                    fill={
                      wishlistCategories.length > 0 ? "currentColor" : "none"
                    }
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
                <span
                  className={`text-xs ${
                    wishlistCategories.length > 0
                      ? "text-primary font-medium"
                      : "text-gray-900"
                  }`}
                >
                  {wishlistCategories.length > 0 ? "위시리스트" : "저장"}
                </span>
              </button>
              <button
                onClick={onShare}
                className="flex flex-col items-center justify-center border border-primary rounded-lg h-12 w-20 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-primary mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <span className="text-xs text-gray-900">공유</span>
              </button>
            </div>
          </div>

          {/* 리뷰 작성 필드 */}
          <div>
            <input
              type="text"
              placeholder="| 리뷰 작성"
              onClick={onWriteReview}
              className="w-full px-4 py-3 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer text-gray-900"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* 위시리스트 모달 */}
      {showWishlistModal && (
        <WishlistModal
          onClose={() => {
            setShowWishlistModal(false);
            loadWishlistCategories(); // 모달 닫을 때 위시리스트 상태 새로고침
          }}
          cafeId={cafeId}
          cafeName={cafe.name}
        />
      )}

      {/* 로그인 유도 모달 */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          message="로그인 후 위시리스트 기능을 이용할 수 있습니다."
        />
      )}
    </div>
  );
}
