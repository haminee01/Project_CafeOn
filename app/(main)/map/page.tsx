"use client";

import { useState } from "react";
import Header from "@/components/common/Header";
import Map from "@/components/map/Map";
import { mockCafes } from "@/data/mockCafes";

type TabType = "home" | "saved" | "popular";
type SavedCategoryType = "all" | "hideout" | "work" | "atmosphere" | "taste" | "planned";

export default function MapPage() {
  const [selectedCafe, setSelectedCafe] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [savedCategory, setSavedCategory] = useState<SavedCategoryType>("all");

  // 저장 탭 카테고리별 데이터
  const getSavedCafesByCategory = () => {
    switch (savedCategory) {
      case "all":
        return mockCafes.slice(0, 8); // 전체 저장된 카페
      case "hideout":
        return mockCafes.slice(0, 3); // 나만의 아지트
      case "work":
        return mockCafes.slice(3, 6); // 작업하기 좋은
      case "atmosphere":
        return mockCafes.slice(6, 9); // 분위기
      case "taste":
        return mockCafes.slice(9, 12); // 커피, 디저트 맛집
      case "planned":
        return mockCafes.slice(12, 15); // 방문예정, 찜
      default:
        return mockCafes.slice(0, 8);
    }
  };

  // 탭별 카페 데이터
  const getCafesByTab = () => {
    switch (activeTab) {
      case "home":
        return mockCafes; // 선택된 구의 전체 카페 (현재는 모든 카페)
      case "saved":
        return getSavedCafesByCategory(); // 저장된 카페 (카테고리별)
      case "popular":
        return mockCafes.slice(0, 5); // 인기 카페 (예시)
      default:
        return mockCafes;
    }
  };

  const currentCafes = getCafesByTab();

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
                <svg width="20" height="26" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 20 12 20s12-12.5 12-20c0-6.627-5.373-12-12-12z" fill="currentColor"/>
                  <circle cx="12" cy="12" r="6" fill="white"/>
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
                <span className="text-sm">인기</span>
              </div>
            </button>
          </div>
          
          {/* 카페 카드 리스트 */}
          <div className="space-y-3 flex-1 overflow-y-auto ml-4">
            {currentCafes.map((cafe) => (
              <div
                key={cafe.cafe_id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCafe === cafe.cafe_id
                    ? "border-amber-300 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedCafe(cafe.cafe_id)}
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
                      {activeTab === "saved" && savedCategory === "hideout" && "나만의 아지트 카페"}
                      {activeTab === "saved" && savedCategory === "work" && "작업하기 좋은 카페"}
                      {activeTab === "saved" && savedCategory === "atmosphere" && "분위기 좋은 카페"}
                      {activeTab === "saved" && savedCategory === "taste" && "커피, 디저트 맛집"}
                      {activeTab === "saved" && savedCategory === "planned" && "방문예정, 찜한 카페"}
                      {activeTab === "saved" && savedCategory === "all" && "저장된 카페"}
                      {activeTab === "home" && "영업 중 리뷰 999+"}
                      {activeTab === "popular" && "인기 카페 리뷰 999+"}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {activeTab === "saved" && savedCategory === "hideout" && "🏠 나만의 아지트"}
                        {activeTab === "saved" && savedCategory === "work" && "💻 작업하기 좋은"}
                        {activeTab === "saved" && savedCategory === "atmosphere" && "✨ 분위기"}
                        {activeTab === "saved" && savedCategory === "taste" && "☕ 맛집"}
                        {activeTab === "saved" && savedCategory === "planned" && "📅 방문예정"}
                        {activeTab === "saved" && savedCategory === "all" && "💾 저장됨"}
                        {activeTab === "home" && "베이커리"}
                        {activeTab === "popular" && "🔥 인기"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
