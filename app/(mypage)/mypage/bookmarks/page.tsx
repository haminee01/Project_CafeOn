"use client";

import React, { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/common/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";

// 북마크 카테고리 목록 정의
const bookmarkCategories = [
  "나만의 아지트",
  "작업하기 좋은",
  "분위기",
  "커피/디저트 맛집",
  "방문 예정/찜",
];

// 임시 데이터 구조
const mockAllBookmarks = [
  {
    id: 1,
    name: "스타벅스 문래점",
    category: "나만의 아지트",
    address: "서울 종로구 계동길 85",
    rating: 4.8,
    reviewCount: 154,
    tags: ["#한옥", "#조용함"],
    imageUrl: "https://placehold.co/300x300/A0522D/ffffff?text=C1",
  },
  {
    id: 4,
    name: "메가커피 문래점",
    category: "나만의 아지트",
    address: "서울 중구 을지로 12",
    rating: 4.6,
    reviewCount: 205,
    tags: ["#힙지로", "#레트로"],
    imageUrl: "https://placehold.co/300x300/1E90FF/ffffff?text=C4",
  },
  {
    id: 11,
    name: "빽다방 문래점",
    category: "나만의 아지트",
    address: "서울 강남구 역삼동",
    rating: 4.5,
    reviewCount: 90,
    tags: ["#가성비", "#테이크아웃"],
    imageUrl: "https://placehold.co/300x300/FF4500/ffffff?text=C11",
  },
  {
    id: 12,
    name: "북촌 한옥마을 조용한 카페",
    category: "나만의 아지트",
    address: "서울 종로구 계동길 85",
    rating: 4.8,
    reviewCount: 154,
    tags: ["#한옥", "#조용함"],
    imageUrl: "https://placehold.co/300x300/A0522D/ffffff?text=C1",
  },
  {
    id: 13,
    name: "을지로 레트로 갬성 카페",
    category: "나만의 아지트",
    address: "서울 중구 을지로 12",
    rating: 4.6,
    reviewCount: 205,
    tags: ["#힙지로", "#레트로"],
    imageUrl: "https://placehold.co/300x300/1E90FF/ffffff?text=C4",
  },
  {
    id: 2,
    name: "강남역 24시간 스터디 카페",
    category: "작업하기 좋은",
    address: "서울 강남구 강남대로 420",
    rating: 4.5,
    reviewCount: 301,
    tags: ["#24시간", "#카공", "#콘센트"],
    imageUrl: "https://placehold.co/300x300/FFD700/000000?text=C2",
  },
  {
    id: 6,
    name: "선릉역 조용한 독서실형 카페",
    category: "작업하기 좋은",
    address: "서울 강남구 테헤란로 401",
    rating: 4.7,
    reviewCount: 88,
    tags: ["#조용함", "#카공"],
    imageUrl: "https://placehold.co/300x300/DAA520/000000?text=C6",
  },
  {
    id: 14,
    name: "종로 카공 전문 카페",
    category: "작업하기 좋은",
    address: "서울 종로구 종로",
    rating: 4.4,
    reviewCount: 150,
    tags: ["#콘센트", "#넓은자리"],
    imageUrl: "https://placehold.co/300x300/228B22/ffffff?text=C14",
  },
  {
    id: 15,
    name: "신촌 대형 스터디 공간",
    category: "작업하기 좋은",
    address: "서울 서대문구 신촌",
    rating: 4.2,
    reviewCount: 220,
    tags: ["#24시간", "#단체석"],
    imageUrl: "https://placehold.co/300x300/4682B4/ffffff?text=C15",
  },
  {
    id: 5,
    name: "홍대 대형 루프탑 카페",
    category: "분위기",
    address: "서울 마포구 양화로 100",
    rating: 4.2,
    reviewCount: 450,
    tags: ["#루프탑", "#대형", "#뷰맛집"],
    imageUrl: "https://placehold.co/300x300/32CD32/ffffff?text=C5",
  },
  {
    id: 7,
    name: "가로수길 플랜트 카페",
    category: "분위기",
    address: "서울 강남구 압구정로4길 10",
    rating: 3.9,
    reviewCount: 112,
    tags: ["#식물", "#데이트"],
    imageUrl: "https://placehold.co/300x300/20B2AA/ffffff?text=C7",
  },
  {
    id: 16,
    name: "해방촌 뷰 맛집",
    category: "분위기",
    address: "서울 용산구 해방촌",
    rating: 4.9,
    reviewCount: 180,
    tags: ["#노을", "#야경", "#인생샷"],
    imageUrl: "https://placehold.co/300x300/800080/ffffff?text=C16",
  },
  {
    id: 17,
    name: "이태원 엔틱 인테리어",
    category: "분위기",
    address: "서울 용산구 이태원",
    rating: 4.5,
    reviewCount: 110,
    tags: ["#엔틱", "#고급", "#조용함"],
    imageUrl: "https://placehold.co/300x300/D2B48C/000000?text=C17",
  },
  {
    id: 8,
    name: "종로 핸드드립 전문점",
    category: "커피/디저트 맛집",
    address: "서울 종로구 삼일대로 38",
    rating: 4.9,
    reviewCount: 65,
    tags: ["#핸드드립", "#전문점", "#커피"],
    imageUrl: "https://placehold.co/300x300/B8860B/ffffff?text=C8",
  },
  {
    id: 10,
    name: "합정 베이커리 카페 (빵 맛집)",
    category: "커피/디저트 맛집",
    address: "서울 마포구 독막로 50",
    rating: 4.6,
    reviewCount: 240,
    tags: ["#베이커리", "#빵", "#합정"],
    imageUrl: "https://placehold.co/300x300/F08080/ffffff?text=C10",
  },
  {
    id: 3,
    name: "테마가 독특한 이색 카페",
    category: "방문 예정/찜",
    address: "서울 마포구 와우산로 102",
    rating: 4.9,
    reviewCount: 78,
    tags: ["#데이트", "#사진맛집"],
    imageUrl: "https://placehold.co/300x300/778899/ffffff?text=C3",
  },
  {
    id: 9,
    name: "서울대입구 감성 브런치 카페",
    category: "방문 예정/찜",
    address: "서울 관악구 관악로 200",
    rating: 4.7,
    reviewCount: 190,
    tags: ["#브런치", "#감성"],
    imageUrl: "https://placehold.co/300x300/CD5C5C/ffffff?text=C9",
  },
];

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
  item: (typeof mockAllBookmarks)[0];
  onRemoveBookmark: (id: number, name: string) => void;
}) => {
  const HeartIcon = () => (
    <FontAwesomeIcon icon={faHeartSolid} className="w-4 h-4" />
  );

  // 북마크 해제 핸들러 수정
  const handleRemoveBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 확인 창 대신, 상위 컴포넌트의 토스트 알림 및 상태 업데이트 함수 호출
    onRemoveBookmark(item.id, item.name);
  };

  return (
    <a
      href={`/cafe/${item.id}`}
      className="block w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 relative group cursor-pointer"
    >
      {/* 이미지 영역 */}
      <div className="relative pt-[100%] overflow-hidden">
        <img
          src={item.imageUrl}
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
        <div className="flex items-center justify-center text-sm text-gray-600">
          <svg
            className="w-5 h-5 mr-1 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
          </svg>
          <span className="font-bold text-amber-600 mr-1">
            {item.rating.toFixed(1)}
          </span>
          <span className="text-gray-500">({item.reviewCount})</span>
        </div>
      </div>
    </a>
  );
};

/*마이페이지 북마크 목록 화면 (카테고리/페이지네이션 적용)*/
export default function MyBookmarksPage() {
  const [bookmarks, setBookmarks] = useState(mockAllBookmarks); // 전체 북마크 상태로 관리
  const [activeCategory, setActiveCategory] = useState(bookmarkCategories[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null); // 토스트 메시지 상태

  const ITEMS_PER_PAGE = 9;

  // 1. 카테고리별로 북마크 필터링
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => bookmark.category === activeCategory);
  }, [activeCategory, bookmarks]);

  const totalBookmarks = filteredBookmarks.length;
  const totalPages = Math.ceil(totalBookmarks / ITEMS_PER_PAGE);

  // 2. 현재 페이지에 해당하는 북마크 목록 계산
  const currentBookmarks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBookmarks.slice(startIndex, endIndex);
  }, [currentPage, filteredBookmarks]);

  // 북마크 해제 핸들러
  const handleRemoveBookmark = (id: number, name: string) => {
    // 1. 토스트 메시지 설정
    const message = `[${name}] 북마크가 해제되었습니다.`;
    setToastMessage(message);

    // 2. 전체 북마크 목록에서 해당 항목 제거 (화면 즉시 업데이트)
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter((bookmark) => bookmark.id !== id)
    );
  };

  // 북마크 삭제 후 페이지네이션 조정 (필요한 경우)
  useEffect(() => {
    if (totalBookmarks > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalBookmarks === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalBookmarks, totalPages, currentPage]);

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
      {totalBookmarks > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBookmarks.map((bookmark) => (
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
            **'{activeCategory}'** 카테고리에 북마크한 카페가 없습니다.
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
