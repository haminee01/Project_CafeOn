"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Map from "@/components/map/Map";
import { mockCafes } from "@/data/mockCafes";
import { getWishlist, getNearbyCafes } from "@/lib/api";

type TabType = "home" | "saved" | "popular";
type SavedCategoryType =
  | "all"
  | "hideout"
  | "work"
  | "atmosphere"
  | "taste"
  | "planned";

interface WishlistItem {
  wishlistId: number;
  cafeId: number;
  name: string;
  category: string;
}

export default function MapPage() {
  const router = useRouter();
  const [selectedCafe, setSelectedCafe] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [savedCategory, setSavedCategory] = useState<SavedCategoryType>("all");
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nearbyCafes, setNearbyCafes] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 카테고리 매핑
  const categoryMap: Record<SavedCategoryType, string> = {
    all: "all",
    hideout: "HIDEOUT",
    work: "WORK",
    atmosphere: "ATMOSPHERE",
    taste: "TASTE",
    planned: "PLANNED",
  };

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          // 기본 위치 (서울 시청)
          setUserLocation({ latitude: 37.5665, longitude: 126.978 });
        }
      );
    } else {
      // 기본 위치 (서울 시청)
      setUserLocation({ latitude: 37.5665, longitude: 126.978 });
    }
  }, []);

  // 근처 카페 조회
  useEffect(() => {
    if (userLocation && activeTab === "home") {
      fetchNearbyCafes();
    }
  }, [userLocation, activeTab]);

  // 위시리스트 조회
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    // 로그인된 경우에만 위시리스트 조회
    if (activeTab === "saved" && token) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [activeTab, savedCategory]);

  const fetchNearbyCafes = async () => {
    if (!userLocation) return;

    try {
      const cafes = await getNearbyCafes({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: 2000, // 2km 반경
      });

      // API가 배열을 반환하면 그대로 사용, 아니면 fallback
      if (Array.isArray(cafes) && cafes.length > 0) {
        setNearbyCafes(cafes);
      } else {
        // 빈 배열 또는 잘못된 데이터면 mock 데이터 사용
        setNearbyCafes(mockCafes.slice(0, 10));
      }
    } catch (error: any) {
      console.error("근처 카페 조회 실패:", error);
      // API 실패 시 mock 데이터로 fallback
      setNearbyCafes(mockCafes.slice(0, 10));
    }
  };

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 20,
      };

      // "all"이 아닌 경우 카테고리 필터 추가
      if (savedCategory !== "all") {
        params.category = categoryMap[savedCategory];
      }

      const response = await getWishlist(params);
      const items = response?.data?.content || response?.content || [];
      setWishlistItems(items);
    } catch (error: any) {
      console.error("위시리스트 조회 실패:", error);

      // 403 또는 401 에러인 경우 (권한 없음)
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log("로그인이 필요합니다.");
        // 토큰 제거
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 저장 탭 카테고리별 데이터
  const getSavedCafesByCategory = () => {
    // 위시리스트가 있으면 위시리스트에서 가져오기
    if (wishlistItems.length > 0) {
      const categoryFilter =
        savedCategory === "all"
          ? wishlistItems
          : wishlistItems.filter(
              (item) => item.category === categoryMap[savedCategory]
            );

      // 위시리스트 카페를 mockCafes와 매칭
      return (
        categoryFilter
          .map((item) => {
            const cafe = mockCafes.find(
              (c) => c.cafe_id === item.cafeId.toString()
            );
            return cafe;
          })
          .filter(Boolean) || []
      );
    }

    // 위시리스트가 없으면 mock 데이터
    switch (savedCategory) {
      case "all":
        return mockCafes.slice(0, 8);
      case "hideout":
        return mockCafes.slice(0, 3);
      case "work":
        return mockCafes.slice(3, 6);
      case "atmosphere":
        return mockCafes.slice(6, 9);
      case "taste":
        return mockCafes.slice(9, 12);
      case "planned":
        return mockCafes.slice(12, 15);
      default:
        return mockCafes.slice(0, 8);
    }
  };

  // 탭별 카페 데이터
  const getCafesByTab = () => {
    switch (activeTab) {
      case "home":
        return nearbyCafes.length > 0 ? nearbyCafes : mockCafes; // API 데이터 또는 mock 데이터
      case "saved":
        return getSavedCafesByCategory(); // 저장된 카페 (카테고리별)
      case "popular":
        return mockCafes.slice(0, 5); // 인기 카페 (예시)
      default:
        return mockCafes;
    }
  };

  const currentCafes = getCafesByTab();
  const isLoggedIn = localStorage.getItem("accessToken");

  return (
    <div className="min-h-screen relative">
      <Header />
      {/* 지도 (전체 화면) */}
      <Map className="h-screen" />

      {/* 통합 모달 - 탭과 리스트가 함께 */}
      <div className="absolute bg-white top-1/2 left-4 transform -translate-y-1/2 min-w-96 h-[60vh] rounded-lg shadow-lg z-20 flex flex-col">
        {/* 헤더 */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-semibold text-primary">CafeOn.</h2>
        </div>

        {/* 저장 탭 하위 카테고리 탭들 - 위쪽에 배치 */}
        {activeTab === "saved" && (
          <div className="px-4 pb-2">
            <div className="flex gap-1 flex-wrap max-w-full">
              <button
                onClick={() => setSavedCategory("all")}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0 ${
                  savedCategory === "all"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setSavedCategory("hideout")}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0 ${
                  savedCategory === "hideout"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                나만의 아지트
              </button>
              <button
                onClick={() => setSavedCategory("work")}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0 ${
                  savedCategory === "work"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                작업하기 좋은
              </button>
              <button
                onClick={() => setSavedCategory("atmosphere")}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0 ${
                  savedCategory === "atmosphere"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                분위기
              </button>
              <button
                onClick={() => setSavedCategory("taste")}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0 ${
                  savedCategory === "taste"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                커피, 디저트 맛집
              </button>
              <button
                onClick={() => setSavedCategory("planned")}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors flex-shrink-0 ${
                  savedCategory === "planned"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                방문예정, 찜
              </button>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-1 px-4 pb-4 min-h-0">
          {/* 탭 버튼들 */}
          <div className="flex flex-col justify-start">
            <button
              onClick={() => setActiveTab("home")}
              className={` flex items-center justify-center px-2 py-2 w-20 h-20 transition-colors ${
                activeTab === "home"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center">
                <svg
                  width="20"
                  height="26"
                  viewBox="0 0 24 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 20 12 20s12-12.5 12-20c0-6.627-5.373-12-12-12z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="6" fill="white" />
                </svg>
                <span className="text-sm">지도 홈</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={` flex items-center justify-center px-2 py-2 w-20 h-20 transition-colors ${
                activeTab === "saved"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm">저장</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={` flex items-center justify-center px-2 py-2 w-20 h-20 transition-colors ${
                activeTab === "popular"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm">인기</span>
              </div>
            </button>
          </div>

          {/* 카페 카드 리스트 */}
          <div className="space-y-3 flex-1 overflow-y-auto ml-4">
            {/* 로그인 안내 메시지 */}
            {activeTab === "saved" && !isLoggedIn && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  로그인이 필요합니다
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  저장된 카페를 보려면 로그인해주세요
                </p>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  로그인하기
                </button>
              </div>
            )}
            {loading && (
              <div className="text-center py-4 text-gray-500">로딩 중...</div>
            )}
            {!loading &&
              activeTab === "saved" &&
              isLoggedIn &&
              wishlistItems.length === 0 &&
              !loading && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">저장된 카페가 없습니다.</p>
                  <p className="text-sm">카페를 저장하면 여기에 표시됩니다.</p>
                </div>
              )}
            {!loading &&
              currentCafes.length > 0 &&
              currentCafes.map((cafe) => {
                if (!cafe) return null;
                
                // 카페 ID 확인 (API 데이터의 경우 cafeId, mock 데이터의 경우 cafe_id)
                const cafeId = cafe.cafeId || cafe.cafe_id;
                
                const handleCardClick = () => {
                  if (cafeId) {
                    router.push(`/cafes/${cafeId}`);
                  }
                };
                
                return (
                  <div
                    key={cafe.cafe_id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCafe === cafe.cafe_id
                        ? "border-amber-300 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={handleCardClick}
                  >
                    <div className="flex gap-3">
                      {/* 카페 이미지 플레이스홀더 */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">이미지</span>
                      </div>

                      {/* 카페 정보 */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {cafe.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {activeTab === "saved" &&
                            savedCategory === "hideout" &&
                            "나만의 아지트 카페"}
                          {activeTab === "saved" &&
                            savedCategory === "work" &&
                            "작업하기 좋은 카페"}
                          {activeTab === "saved" &&
                            savedCategory === "atmosphere" &&
                            "분위기 좋은 카페"}
                          {activeTab === "saved" &&
                            savedCategory === "taste" &&
                            "커피, 디저트 맛집"}
                          {activeTab === "saved" &&
                            savedCategory === "planned" &&
                            "방문예정, 찜한 카페"}
                          {activeTab === "saved" &&
                            savedCategory === "all" &&
                            "저장된 카페"}
                          {activeTab === "home" && "영업 중 리뷰 999+"}
                          {activeTab === "popular" && "인기 카페 리뷰 999+"}
                        </p>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {activeTab === "saved" &&
                              savedCategory === "hideout" &&
                              "🏠 나만의 아지트"}
                            {activeTab === "saved" &&
                              savedCategory === "work" &&
                              "💻 작업하기 좋은"}
                            {activeTab === "saved" &&
                              savedCategory === "atmosphere" &&
                              "✨ 분위기"}
                            {activeTab === "saved" &&
                              savedCategory === "taste" &&
                              "☕ 맛집"}
                            {activeTab === "saved" &&
                              savedCategory === "planned" &&
                              "📅 방문예정"}
                            {activeTab === "saved" &&
                              savedCategory === "all" &&
                              "💾 저장됨"}
                            {activeTab === "home" && "베이커리"}
                            {activeTab === "popular" && "🔥 인기"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
