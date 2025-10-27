"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/common/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { getWishlist, deleteWishlist } from "@/lib/api";

// 북마크 카테고리 목록 정의 (한글)
const bookmarkCategories = [
  "나만의 아지트",
  "작업하기 좋은",
  "분위기",
  "커피/디저트 맛집",
  "방문 예정/찜",
];

// 카테고리 한글 -> 영문 매핑 (대문자 사용)
const categoryMapping: { [key: string]: string } = {
  "나만의 아지트": "HIDEOUT",
  "작업하기 좋은": "WORK",
  분위기: "ATMOSPHERE",
  "커피/디저트 맛집": "TASTE",
  "방문 예정/찜": "PLANNED",
};

// 위시리스트 항목 타입 정의
interface WishlistItem {
  id: number;
  cafeId: number;
  name: string;
  category: string;
}

// 북마크 해제 알림 컴포넌트 (2초 후 자동 닫힘)
const BookmarkRemoveToast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#999999] text-white p-4 rounded-lg shadow-2xl z-50 text-center transition-opacity duration-300"
      style={{ minWidth: "100px" }}
    >
      <p>{message}</p>
    </div>
  );
};

/*단일 북마크 항목 컴포넌트 (3x3 격자 카드 스타일)*/
const BookmarkItem = ({
  item,
  onRemoveBookmark,
}: {
  item: WishlistItem;
  onRemoveBookmark: (cafeId: number, name: string) => void;
}) => {
  const HeartIcon = () => (
    <FontAwesomeIcon icon={faHeartSolid} className="w-4 h-4" />
  );

  // 북마크 해제 핸들러 수정
  const handleRemoveBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 확인 창 대신, 상위 컴포넌트의 토스트 알림 및 상태 업데이트 함수 호출
    onRemoveBookmark(item.cafeId, item.name);
  };

  return (
    <a
      href={`/cafes/${item.cafeId}`}
      className="block w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 relative group cursor-pointer"
    >
      {/* 이미지 영역 */}
      <div className="relative pt-[100%] overflow-hidden">
        <img
          src={`https://placehold.co/300x300/A0522D/ffffff?text=Cafe+${item.cafeId}`}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/300x300/d1d5db/374151?text=Cafe";
          }}
        />
        {/* 북마크 해제 버튼 (우측 상단) */}
        <button
          className="absolute top-3 right-3 p-2 text-red-500 bg-white bg-opacity-90 rounded-full hover:bg-red-100 transition-colors z-10 shadow-sm"
          onClick={handleRemoveBookmark}
          aria-label={`${item.name} 북마크 해제`}
        >
          <HeartIcon />
        </button>
      </div>

      {/* 정보 영역 */}
      <div className="p-3 text-center">
        <h3 className="text-base font-semibold text-gray-800 truncate mb-1">
          {item.name}
        </h3>
      </div>
    </a>
  );
};

/*마이페이지 북마크 목록 화면 (카테고리/페이지네이션 적용)*/
export default function MyBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<WishlistItem[]>([]); // 위시리스트 항목 상태
  const [activeCategory, setActiveCategory] = useState(bookmarkCategories[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null); // 토스트 메시지 상태

  const ITEMS_PER_PAGE = 9;

  // 위시리스트 데이터 로드
  const loadWishlist = async () => {
    try {
      setLoading(true);
      const categoryEn = categoryMapping[activeCategory];
      const response = await getWishlist({
        category: categoryEn,
        page: currentPage - 1, // 백엔드는 0-based 페이지
        size: ITEMS_PER_PAGE,
        sort: "createdAt,desc",
      });

      if (response && response.data) {
        setBookmarks(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalBookmarks(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error("위시리스트 로드 실패:", error);
      setBookmarks([]);
      setTotalPages(0);
      setTotalBookmarks(0);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 또는 페이지 변경 시 데이터 로드
  useEffect(() => {
    loadWishlist();
  }, [activeCategory, currentPage]);

  // 북마크 해제 핸들러
  const handleRemoveBookmark = async (cafeId: number, name: string) => {
    try {
      // 북마크 해제 시 현재 보고 있는 카테고리를 사용
      const categoryEn = categoryMapping[activeCategory];

      console.log("북마크 해제 시도:", { cafeId, category: categoryEn });

      await deleteWishlist(cafeId, categoryEn);

      // 1. 토스트 메시지 설정
      const message = `[${name}] 북마크가 해제되었습니다.`;
      setToastMessage(message);

      // 2. 위시리스트 다시 로드
      await loadWishlist();

      // 3. 현재 페이지가 비어있으면 이전 페이지로 이동
      if (bookmarks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      console.error("북마크 해제 실패:", error);

      // 에러 메시지 추출 및 표시
      const errorMessage = error.message || "북마크 해제에 실패했습니다.";
      setToastMessage(errorMessage);

      // 에러 발생 시에도 목록 새로고침 시도
      try {
        await loadWishlist();
      } catch (reloadError) {
        console.error("목록 새로고침 실패:", reloadError);
      }
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        북마크 목록 ({totalBookmarks}개)
      </h1>

      {/* 카테고리 탭 바 */}
      <div className="flex justify-between border-b border-[#999999] mb-8 overflow-x-auto whitespace-nowrap">
        {bookmarkCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`
                            py-3 px-4 sm:px-6 text-sm font-semibold transition-colors duration-200
                            ${
                              category === activeCategory
                                ? "text-[#6E4213] border-b-2 border-[#6E4213]"
                                : "text-gray-500 hover:text-gray-700"
                            }
                        `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 북마크 목록 (3x3 격자 레이아웃) */}
      {loading ? (
        <div className="text-center p-12">
          <p className="text-lg text-gray-600">로딩 중...</p>
        </div>
      ) : totalBookmarks > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkItem
                key={bookmark.id}
                item={bookmark}
                onRemoveBookmark={handleRemoveBookmark}
              />
            ))}
          </div>

          {/* 페이지네이션 컴포넌트 렌더링 */}
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-lg text-gray-600 font-medium">
            '{activeCategory}' 카테고리에 북마크한 카페가 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            지도를 탐색하고 마음에 드는 카페를 북마크 해보세요!
          </p>
        </div>
      )}

      {/* 2초 후 자동 사라지는 토스트 알림 */}
      {toastMessage && (
        <BookmarkRemoveToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
