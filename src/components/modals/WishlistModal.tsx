"use client";

import { useState, useEffect } from "react";
import { toggleWishlist, getWishlistCategories } from "@/lib/api";
import LoginPromptModal from "./LoginPromptModal";
import Toast from "../common/Toast";

interface WishlistModalProps {
  onClose: () => void;
  cafeId: string;
  cafeName: string;
}

// 위시리스트 카테고리 정의
const WISHLIST_CATEGORIES = [
  { value: "HIDEOUT", label: "나만의 아지트", icon: "🏠" },
  { value: "WORK", label: "작업하기 좋은", icon: "💻" },
  { value: "ATMOSPHERE", label: "분위기 좋은", icon: "✨" },
  { value: "TASTE", label: "커피·디저트 맛집", icon: "☕" },
  { value: "PLANNED", label: "방문 예정", icon: "📅" },
];

export default function WishlistModal({
  onClose,
  cafeId,
  cafeName,
}: WishlistModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // 초기 위시리스트 카테고리 로드 (모달이 열릴 때만)
  useEffect(() => {
    const loadInitialCategories = async () => {
      try {
        const response = await getWishlistCategories(cafeId);
        if (response?.data) {
          setSelectedCategories(response.data);
        }
      } catch (error: any) {
        console.error("위시리스트 카테고리 로드 실패:", error);
        // 403 오류인 경우 로그인 유도 모달 표시
        if (error?.response?.status === 403) {
          setShowLoginPrompt(true);
        }
        // 백엔드 서버가 실행되지 않은 경우 빈 배열로 초기화
        setSelectedCategories([]);
      } finally {
        setInitialLoading(false);
      }
    };

    // 모달이 열릴 때만 로드
    loadInitialCategories();
  }, [cafeId]);

  const handleCategoryToggle = async (category: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await toggleWishlist(cafeId, category);

      if (response?.data?.wished) {
        // 추가된 경우
        setSelectedCategories((prev) => [...prev, category]);
        setToast({
          message: "위시리스트에 추가되었습니다!",
          type: "success",
        });
      } else {
        // 제거된 경우
        setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
        setToast({
          message: "위시리스트에서 제거되었습니다.",
          type: "info",
        });
      }
    } catch (error: any) {
      console.error("위시리스트 토글 실패:", error);
      // 403 오류인 경우 로그인 유도 모달 표시
      if (error?.response?.status === 403) {
        setShowLoginPrompt(true);
      } else {
        // 백엔드 서버가 실행되지 않은 경우 사용자에게 알림
        setToast({
          message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {cafeName} 위시리스트
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div className="space-y-3">
          {WISHLIST_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.value);
            const isCurrentlyLoading = loading;

            return (
              <button
                key={category.value}
                onClick={() => handleCategoryToggle(category.value)}
                disabled={isCurrentlyLoading}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                } ${
                  isCurrentlyLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {isCurrentlyLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            완료
          </button>
        </div>
      </div>

      {/* 로그인 유도 모달 */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          message="로그인 후 위시리스트 기능을 이용할 수 있습니다."
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60]">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
