"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";

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
    images: [
      "https://picsum.photos/id/1018/150/150",
      "https://picsum.photos/id/1025/150/150",
    ],
  },
  {
    id: 2,
    cafeName: "강남역 24시간 스터디 카페",
    rating: 4,
    content:
      "밤늦게까지 공부할 수 있어서 좋았지만, 주말에는 사람이 너무 많아 약간 시끄러웠어요. 콘센트는 많습니다.",
    date: "2025.09.20",
    address: "서울 강남구 강남대로 420",
    images: [],
  },
  {
    id: 3,
    cafeName: "테마가 독특한 이색 카페 (이색적인 인테리어)",
    rating: 3,
    content: "테마는 신선했지만, 커피 맛은 평범했습니다. 사진 찍기에는 좋아요.",
    date: "2025.09.15",
    address: "서울 마포구 와우산로 102",
    images: ["https://picsum.photos/id/1039/150/150"],
  },
  {
    id: 4,
    cafeName: "을지로 레트로 갬성 카페",
    rating: 5,
    content: "힙지로 감성이 제대로! 커피와 디저트 모두 만족스러웠습니다.",
    date: "2025.09.10",
    address: "서울 중구 을지로 12",
    images: [],
  },
  {
    id: 5,
    cafeName: "홍대 대형 루프탑 카페",
    rating: 4,
    content:
      "뷰가 시원하고 넓어서 좋았어요. 다만, 음료 가격이 조금 비싼 편입니다.",
    date: "2025.09.05",
    address: "서울 마포구 양화로 100",
    images: [
      "https://picsum.photos/id/10/150/150",
      "https://picsum.photos/id/20/150/150",
      "https://picsum.photos/id/30/150/150",
    ],
  },
  {
    id: 6,
    cafeName: "선릉역 조용한 독서실형 카페",
    rating: 5,
    content: "진짜 조용하고 집중하기 좋아요. 재방문 의사 확실합니다.",
    date: "2025.08.30",
    address: "서울 강남구 테헤란로 401",
    images: [],
  },
  {
    id: 7,
    cafeName: "가로수길 플랜트 카페",
    rating: 3,
    content:
      "식물들이 많아 공기는 좋은데, 좌석이 불편해서 오래 앉아있긴 힘들어요.",
    date: "2025.08.25",
    address: "서울 강남구 압구정로4길 10",
    images: [],
  },
  {
    id: 8,
    cafeName: "종로 핸드드립 전문점",
    rating: 4,
    content: "커피 맛이 깊고 좋았어요. 전문적인 바리스타분들이 계십니다.",
    date: "2025.08.20",
    address: "서울 종로구 삼일대로 38",
    images: ["https://picsum.photos/id/40/150/150"],
  },
  {
    id: 9,
    cafeName: "서울대입구 감성 브런치 카페",
    rating: 5,
    content: "브런치가 정말 맛있었어요! 주말엔 웨이팅 필수입니다.",
    date: "2025.08.15",
    address: "서울 관악구 관악로 200",
    images: [],
  },
  {
    id: 10,
    cafeName: "합정 베이커리 카페 (빵 맛집)",
    rating: 4,
    content: "빵 종류가 엄청 많고 다 맛있어요. 커피는 평범했습니다.",
    date: "2025.08.10",
    address: "서울 마포구 독막로 50",
    images: ["https://picsum.photos/id/50/150/150"],
  },
];

/*별점 표시 컴포넌트*/
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  // SVG 별 아이콘 컴포넌트
  const StarIcon = ({ type }: { type: "full" | "empty" }) => (
    <svg
      className={`w-5 h-5 ${
        type === "full" ? "text-amber-400" : "text-[#CDCDCD]"
      }`}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
    </svg>
  );

  for (let i = 0; i < 5; i++) {
    stars.push(<StarIcon key={i} type={i < fullStars ? "full" : "empty"} />);
  }
  return <div className="flex space-x-0.5">{stars}</div>;
};

/*Font Awesome 위치 아이콘 컴포넌트*/
const LocationIcon = () => (
  <FontAwesomeIcon
    icon={faLocationDot}
    style={{ color: "#6E4213" }}
    className="w-4 h-4 mr-1 mt-0.5"
  />
);

// 삭제 완료 알림 컴포넌트 (2초 후 자동 닫힘)
const DeleteSuccessToast = ({
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

/*단일 리뷰 항목 컴포넌트*/
const ReviewItem = ({
  review,
  onReviewDeleted,
}: {
  review: (typeof mockReviews)[0];
  onReviewDeleted: (id: number) => void;
}) => {
  // 리뷰 수정 함수
  const reviewEdit = () => {
    console.log(`[수정] 리뷰 ID ${review.id} 수정 모달 띄우기 요청.`);
    alert(`[리뷰 ID ${review.id}] 수정 모달이 곧 뜰 예정입니다.`);
  };

  // 리뷰 삭제 함수
  const reviewDelete = () => {
    const isConfirmed = confirm("정말 이 리뷰를 삭제하시겠습니까?");

    if (isConfirmed) {
      console.log(`[삭제] 리뷰 ID ${review.id} 삭제 요청을 서버로 전송합니다.`);

      // alert() 대신 onReviewDeleted 호출로 2초 자동 사라짐 토스트 트리거
      onReviewDeleted(review.id);
    } else {
      console.log(`[삭제] 리뷰 ID ${review.id} 삭제 취소됨.`);
    }
  };

  const { cafeName, address, date, rating, content, images } = review;

  return (
    <div className="bg-white p-6 border border-[#CDCDCD] rounded-2xl shadow-sm space-y-3">
      {/* 리뷰 상단 (카페 정보 및 날짜) */}
      <div className="flex justify-between items-start border-b pb-3 border-[#CDCDCD]">
        <div>
          <h3 className="text-lg font-bold text-gray-800 hover:text-[#C19B6C] transition-colors cursor-pointer">
            {cafeName}
          </h3>
          <div className="flex flex-row items-start text-sm text-gray-500 mt-1">
            <LocationIcon />
            <span className="truncate">{address}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 flex-shrink-0 ml-4">{date}</div>
      </div>

      {/* 리뷰 내용 */}
      <div className="space-y-3">
        <div className="flex items-center">
          <RatingStars rating={rating} />
          <span className="ml-2 text-base font-semibold text-[#6E4213]">
            {rating.toFixed(1)}점
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>

        {/* 사진 */}
        {images && images.length > 0 && (
          <div className="pt-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">
              첨부 사진 ({images.length}장)
            </h4>
            <div className="flex flex-wrap gap-2">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={imageUrl}
                    alt={`${cafeName} 리뷰 사진 ${index + 1}`}
                    className="w-full h-full object-cover"
                    // 이미지 로딩 오류 방지용 placeholder
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 (수정/삭제)*/}
      <div className="flex justify-end space-x-3 pt-3 border-t border-[#CDCDCD]">
        <Button onClick={reviewEdit} size="sm" color="primary">
          수정
        </Button>
        <Button onClick={reviewDelete} size="sm" color="gray">
          삭제
        </Button>
      </div>
    </div>
  );
};

/*마이페이지 내 작성 리뷰 화면*/
export default function MyReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews);

  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 5;
  const totalReviews = reviews.length;
  const totalPages = Math.ceil(totalReviews / ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  // 현재 페이지에 해당하는 리뷰 목록 계산
  const currentReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return reviews.slice(startIndex, endIndex);
  }, [currentPage, reviews]);

  // 리뷰 삭제 성공 시 호출되는 핸들러 (토스트 메시지 표시 및 리뷰 목록 업데이트)
  const handleReviewDeleted = (id: number) => {
    // 1. 토스트 메시지 설정 및 표시
    const message = `[리뷰 ID ${id}] 삭제가 완료되었습니다.`;
    setDeleteMessage(message);

    // 2. 임시 목록에서 해당 리뷰 제거 (화면 즉시 업데이트)
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== id)
    );

    // 3. 페이지네이션 조정 로직
    if (currentReviews.length === 1 && totalPages > 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        내가 작성한 리뷰 ({totalReviews}개)
      </h1>

      {totalReviews > 0 ? (
        <>
          <div className="space-y-6 mb-4">
            {currentReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onReviewDeleted={handleReviewDeleted}
              />
            ))}
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-lg text-gray-600 font-medium">
            아직 작성한 리뷰가 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            방문한 카페의 경험을 공유해 보세요!
          </p>
        </div>
      )}

      {deleteMessage && (
        <DeleteSuccessToast
          message={deleteMessage}
          onClose={() => setDeleteMessage(null)}
        />
      )}
    </div>
  );
}
