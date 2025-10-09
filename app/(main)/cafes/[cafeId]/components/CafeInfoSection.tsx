"use client";

import { useState, useEffect } from "react";
import { CafeDetail } from "@/data/cafeDetails";
import Button from "@/components/common/Button";
import { sendUserLocation } from "@/lib/api";

interface CafeInfoSectionProps {
  cafe: CafeDetail;
  cafeId: string;
  latitude?: number;
  longitude?: number;
  onChatRoom: () => void;
  onShare: () => void;
  onSave: () => void;
  onWriteReview: () => void;
}

// 두 지점 간의 거리를 계산하는 함수 (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km 단위
  return distance;
}

export default function CafeInfoSection({
  cafe,
  cafeId,
  latitude,
  longitude,
  onChatRoom,
  onShare,
  onSave,
  onWriteReview,
}: CafeInfoSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHoursDetail, setShowHoursDetail] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cafe.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + cafe.images.length) % cafe.images.length
    );
  };

  // 현재 위치 가져오기 및 백엔드로 전송
  const getCurrentLocation = async () => {
    if (!latitude || !longitude) {
      setLocationError("카페 위치 정보가 없습니다.");
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("위치 서비스가 지원되지 않습니다.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: userLat, longitude: userLon } = position.coords;

        try {
          // 백엔드로 사용자 위치 전송
          const response = await sendUserLocation(cafeId, userLat, userLon);

          // 백엔드에서 계산된 거리가 있으면 사용, 없으면 프론트에서 계산
          if (response?.distance !== undefined) {
            setDistance(response.distance);
            console.log("백엔드에서 거리 계산 완료:", response.distance);
          } else {
            // 백엔드 응답이 없거나 거리 정보가 없을 경우 프론트엔드에서 계산
            const dist = calculateDistance(
              userLat,
              userLon,
              latitude,
              longitude
            );
            setDistance(dist);
            console.log("프론트엔드에서 거리 계산 완료:", dist);
          }
        } catch (error) {
          console.error("백엔드 전송 실패, 프론트엔드에서 계산:", error);
          // 백엔드 전송 실패 시 프론트엔드에서 계산
          const dist = calculateDistance(userLat, userLon, latitude, longitude);
          setDistance(dist);
        }

        setLoadingLocation(false);
      },
      (error) => {
        console.error("위치 정보 가져오기 실패:", error);
        let errorMessage = "위치 정보를 가져올 수 없습니다.";

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "위치 권한이 거부되었습니다.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "위치 정보를 사용할 수 없습니다.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
        }

        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 컴포넌트 마운트 시 자동으로 거리 계산
  useEffect(() => {
    if (latitude && longitude) {
      getCurrentLocation();
    }
  }, [latitude, longitude]);

  // 거리를 포맷팅하는 함수
  const formatDistance = (dist: number) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
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
                {loadingLocation && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <svg
                      className="animate-spin h-3 w-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    거리 계산 중...
                  </p>
                )}
                {distance !== null && !loadingLocation && (
                  <p className="text-sm text-primary font-medium mt-1">
                    현재 위치에서 {formatDistance(distance)}
                  </p>
                )}
                {locationError && !loadingLocation && (
                  <p className="text-sm text-red-500 mt-1">{locationError}</p>
                )}
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
