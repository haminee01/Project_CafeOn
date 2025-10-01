"use client";

import { useState } from "react";
import { CafeDetail } from "@/data/cafeDetails";
import Button from "@/components/common/Button";

interface CafeInfoSectionProps {
  cafe: CafeDetail;
  onChatRoom: () => void;
  onShare: () => void;
  onSave: () => void;
  onWriteReview: () => void;
  userLocation: { lat: number; lng: number } | null;
  distance: number | null;
  locationError: string | null;
}

export default function CafeInfoSection({
  cafe,
  onChatRoom,
  onShare,
  onSave,
  onWriteReview,
  userLocation,
  distance,
  locationError,
}: CafeInfoSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHoursDetail, setShowHoursDetail] = useState<boolean>(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cafe.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + cafe.images.length) % cafe.images.length
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 좌측 이미지 영역 */}
        <div className="relative">
          <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden relative">
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
              카페 이미지
            </div>
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
            {/* 주소 및 거리 정보 */}
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

                {/* 거리 정보 표시 */}
                <div className="mt-2">
                  {distance !== null ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-blue-600 font-medium">
                        현재 위치에서{" "}
                        {distance < 1000
                          ? `${distance}m`
                          : `${(distance / 1000).toFixed(1)}km`}{" "}
                        거리
                      </span>
                    </div>
                  ) : locationError ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">
                        {locationError}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">
                        거리 계산 중...
                      </span>
                    </div>
                  )}
                </div>
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
                onClick={onSave}
                className="flex flex-col items-center justify-center border border-primary rounded-lg h-12 w-20 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-primary mb-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-900">저장</span>
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
    </div>
  );
}
