"use client";

import React from "react";

// 임시 데이터 구조
const mockBookmarks = [
  {
    id: 1,
    name: "북촌 한옥마을 조용한 카페",
    address: "서울 종로구 계동길 85",
    rating: 4.8,
    reviewCount: 154,
    tags: ["#한옥", "#조용함", "#디저트"],
    imageUrl: "https://placehold.co/100x100/A0522D/ffffff?text=C1",
  },
  {
    id: 2,
    name: "강남역 24시간 스터디 카페",
    address: "서울 강남구 강남대로 420",
    rating: 4.5,
    reviewCount: 301,
    tags: ["#24시간", "#카공", "#콘센트많음"],
    imageUrl: "https://placehold.co/100x100/FFD700/000000?text=C2",
  },
  {
    id: 3,
    name: "테마가 독특한 이색 카페",
    address: "서울 마포구 와우산로 102",
    rating: 4.9,
    reviewCount: 78,
    tags: ["#데이트", "#사진맛집", "#레트로"],
    imageUrl: "https://placehold.co/100x100/778899/ffffff?text=C3",
  },
];

/**
 * 단일 북마크 항목 컴포넌트
 */
const BookmarkItem = ({ item }: { item: (typeof mockBookmarks)[0] }) => {
  const StarIcon = () => <span className="text-yellow-500 mr-1">⭐</span>;
  const LocationIcon = () => <span className="text-gray-500 mr-1">📍</span>;
  const HeartIcon = () => <span className="text-red-500 text-xl">❤️</span>;

  return (
    <div className="flex bg-white p-4 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 relative">
      {/* 이미지 */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg mr-4 flex-shrink-0"
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/100x100/d1d5db/374151?text=Cafe";
        }}
      />

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
          {item.name}
        </h3>

        {/* 주소 */}
        <p className="text-sm text-gray-600 flex items-center mb-2 truncate">
          <LocationIcon /> {item.address}
        </p>

        {/* 평점 */}
        <div className="flex items-center mb-2">
          <StarIcon />
          <span className="text-base font-bold text-amber-600 mr-2">
            {item.rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({item.reviewCount} 리뷰)
          </span>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1 mt-1">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 북마크 해제 버튼 (우측 상단) */}
      <button
        className="absolute top-4 right-4 p-2 text-red-500 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
        onClick={() => console.log(`북마크 ${item.id} 해제`)}
        aria-label={`${item.name} 북마크 해제`}
      >
        <HeartIcon />
      </button>
    </div>
  );
};

/**
 * 마이페이지 북마크 목록 화면
 */
export default function MyBookmarksPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">북마크 목록</h1>

      {mockBookmarks.length > 0 ? (
        <div className="space-y-4">
          {mockBookmarks.map((bookmark) => (
            <BookmarkItem key={bookmark.id} item={bookmark} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-6xl mb-4 block">🔖</span>
          <p className="text-lg text-gray-600 font-medium">
            아직 북마크한 카페가 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            지도를 탐색하고 마음에 드는 카페를 북마크 해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
