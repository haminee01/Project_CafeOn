"use client";

import React from "react";

// 임시 리뷰 데이터 구조
const mockReviews = [
  {
    id: 1,
    cafeName: "북촌 한옥마을 조용한 카페",
    rating: 5,
    content:
      "분위기가 정말 좋고 조용해서 카공하기 완벽했어요! 한옥 뷰가 특히 인상적입니다. 재방문 의사 100%입니다.",
    date: "2025.09.28",
    address: "서울 종로구 계동길 85",
  },
  {
    id: 2,
    cafeName: "강남역 24시간 스터디 카페",
    rating: 4,
    content:
      "밤늦게까지 공부할 수 있어서 좋았지만, 주말에는 사람이 너무 많아 약간 시끄러웠어요. 콘센트는 많습니다.",
    date: "2025.09.20",
    address: "서울 강남구 강남대로 420",
  },
  {
    id: 3,
    cafeName: "테마가 독특한 이색 카페",
    rating: 3,
    content: "테마는 신선했지만, 커피 맛은 평범했습니다. 사진 찍기에는 좋아요.",
    date: "2025.09.15",
    address: "서울 마포구 와우산로 102",
  },
];

/**
 * 별점 표시 컴포넌트
 */
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  // 아이콘 대체 (이모지 사용)
  const StarIcon = ({ type }: { type: "full" | "empty" }) => (
    <span
      className={`text-xl ${
        type === "full" ? "text-amber-400" : "text-gray-300"
      }`}
    >
      ⭐
    </span>
  );

  for (let i = 0; i < 5; i++) {
    stars.push(<StarIcon key={i} type={i < fullStars ? "full" : "empty"} />);
  }
  return <div className="flex space-x-0.5">{stars}</div>;
};

/**
 * 단일 리뷰 항목 컴포넌트
 */
const ReviewItem = ({ review }: { review: (typeof mockReviews)[0] }) => {
  // 아이콘 대체 (이모지 사용)
  const LocationIcon = () => (
    <span className="text-gray-500 text-lg mr-1">📍</span>
  );
  const EditIcon = () => <span className="text-blue-500 text-xl">✍️</span>;
  const TrashIcon = () => <span className="text-red-500 text-xl">🗑️</span>;

  return (
    <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-3">
      {/* 리뷰 상단 (카페 정보 및 날짜) */}
      <div className="flex justify-between items-start border-b pb-3 border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-800 hover:text-amber-600 transition-colors cursor-pointer">
            {review.cafeName}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <LocationIcon />
            <span className="truncate">{review.address}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 flex-shrink-0 ml-4">
          {review.date}
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div className="space-y-3">
        {/* 별점 */}
        <div className="flex items-center">
          <RatingStars rating={review.rating} />
          <span className="ml-2 text-base font-semibold text-amber-600">
            {review.rating.toFixed(1)}점
          </span>
        </div>

        {/* 본문 */}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.content}
        </p>
      </div>

      {/* 액션 버튼 (수정/삭제) */}
      <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
        <button
          className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
          onClick={() => console.log(`${review.id} 리뷰 수정`)}
        >
          <EditIcon />
          <span className="ml-1">수정</span>
        </button>
        <button
          className="flex items-center text-sm font-medium text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          onClick={() => console.log(`${review.id} 리뷰 삭제`)}
        >
          <TrashIcon />
          <span className="ml-1">삭제</span>
        </button>
      </div>
    </div>
  );
};

/**
 * 마이페이지 내 작성 리뷰 화면
 */
export default function MyReviewsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        내가 작성한 리뷰
      </h1>

      {mockReviews.length > 0 ? (
        <div className="space-y-6">
          {mockReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-6xl mb-4 block">📝</span>
          <p className="text-lg text-gray-600 font-medium">
            아직 작성한 리뷰가 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            방문한 카페의 경험을 공유해 보세요!
          </p>
        </div>
      )}
    </div>
  );
}
