"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/common/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { getWishlist, deleteWishlist } from "@/lib/api";
import { useToastContext } from "@/components/common/ToastProvider";

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
  wishlistId?: number;
  id: number;
  cafeId: number;
  name: string;
  category: string;
}

// 카테고리 영문 -> 한글 매핑
const categoryReverseMapping: { [key: string]: string } = {
  HIDEOUT: "나만의 아지트",
  WORK: "작업하기 좋은",
  ATMOSPHERE: "분위기",
  TASTE: "커피/디저트 맛집",
  PLANNED: "방문 예정/찜",
};

// 카테고리별 색상 및 아이콘
const categoryStyles: {
  [key: string]: { color: string; bgColor: string; gradient: string };
} = {
  HIDEOUT: {
    color: "#6E4213",
    bgColor: "#F4EDE5",
    gradient: "from-[#F4EDE5] via-[#E8DDD4] to-[#D4C5B8]",
  },
  WORK: {
    color: "#8B6F47",
    bgColor: "#F9F5F0",
    gradient: "from-[#F9F5F0] via-[#F4EDE5] to-[#E8DDD4]",
  },
  ATMOSPHERE: {
    color: "#A6907A",
    bgColor: "#F9F5F0",
    gradient: "from-[#F9F5F0] via-[#F4EDE5] to-[#D4C5B8]",
  },
  TASTE: {
    color: "#6E4213",
    bgColor: "#F4EDE5",
    gradient: "from-[#F4EDE5] via-[#E8DDD4] to-[#D4C5B8]",
  },
  PLANNED: {
    color: "#8B6F47",
    bgColor: "#F9F5F0",
    gradient: "from-[#F9F5F0] via-[#F4EDE5] to-[#E8DDD4]",
  },
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

  // 카테고리 스타일 가져오기
  const categoryKey = item.category?.toUpperCase() || "HIDEOUT";
  const style = categoryStyles[categoryKey] || categoryStyles.HIDEOUT;
  const categoryName =
    categoryReverseMapping[categoryKey] || categoryReverseMapping.HIDEOUT;

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
      className="block w-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 relative group cursor-pointer overflow-hidden"
    >
      {/* 이미지 영역 - 그라데이션 배경 */}
      <div
        className={`relative pt-[100%] overflow-hidden bg-gradient-to-br ${style.gradient}`}
      >
        {/* 카페 이름 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg text-center leading-tight">
            {item.name}
          </h3>
        </div>

        {/* 북마크 해제 버튼 (우측 상단) */}
        <button
          className="absolute top-3 right-3 p-2.5 text-red-500 bg-white bg-opacity-95 rounded-full hover:bg-red-100 transition-colors z-10 shadow-lg hover:scale-110 transform duration-200"
          onClick={handleRemoveBookmark}
          aria-label={`${item.name} 북마크 해제`}
        >
          <HeartIcon />
        </button>

        {/* 카테고리 뱃지 (좌측 상단) */}
        <div
          className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10"
          style={{ backgroundColor: style.bgColor, color: style.color }}
        >
          {categoryName}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 truncate flex-1">
            {item.name}
          </h3>
        </div>
        <p className="text-sm mt-1 font-medium" style={{ color: style.color }}>
          {categoryName}
        </p>
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
  const { showToast } = useToastContext();

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

      // 토스트 메시지 표시
      showToast(`[${name}] 북마크가 해제되었습니다.`, "delete");

      // 위시리스트 다시 로드
      await loadWishlist();

      // 현재 페이지가 비어있으면 이전 페이지로 이동
      if (bookmarks.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      console.error("북마크 해제 실패:", error);

      // 에러 토스트 표시
      showToast(error.message || "북마크 해제에 실패했습니다.", "error");

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
    </div>
  );
}
