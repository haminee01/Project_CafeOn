"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import { getMyReviews, deleteReview, MyReview } from "@/lib/api";
import ReviewWriteModal from "@/components/modals/ReviewWriteModal";
import { useToastContext } from "@/components/common/ToastProvider";
import Spinner from "@/components/common/Spinner";

// 날짜 포맷팅 함수 (ISO 8601 -> YYYY.MM.DD)
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return dateString;
  }
};

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

/*단일 리뷰 항목 컴포넌트*/
const ReviewItem = ({
  review,
  onReviewDeleted,
  onReviewEdit,
}: {
  review: MyReview;
  onReviewDeleted: (id: number) => void;
  onReviewEdit: (review: MyReview) => void;
}) => {
  // 리뷰 수정 함수
  const reviewEdit = () => {
    onReviewEdit(review);
  };

  // 리뷰 삭제 함수
  const reviewDelete = () => {
    const isConfirmed = confirm("정말 이 리뷰를 삭제하시겠습니까?");

    if (isConfirmed) {
      onReviewDeleted(review.reviewId);
    }
  };

  const cafeName = review.cafeName;
  const date = formatDate(review.createdAt);
  const rating = review.rating;
  const content = review.content;
  const images = review.images.map((img) => img.imageUrl);

  return (
    <div className="bg-white p-6 border border-[#CDCDCD] rounded-2xl shadow-sm space-y-3">
      {/* 리뷰 상단 (카페 정보 및 날짜) */}
      <div className="flex justify-between items-start border-b pb-3 border-[#CDCDCD]">
        <div>
          <h3 className="text-lg font-bold text-gray-800 hover:text-[#C19B6C] transition-colors cursor-pointer">
            {cafeName}
          </h3>
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
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<MyReview | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showToast } = useToastContext();

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // 리뷰 목록 조회
  const fetchReviews = async (page: number) => {
    try {
      setLoading(true);
      const response = await getMyReviews({
        page: page - 1, // API는 0부터 시작
        size: ITEMS_PER_PAGE,
      });
      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error: any) {
      console.error("리뷰 목록 조회 실패:", error);
      showToast(
        error.message || "리뷰 목록을 불러오는데 실패했습니다.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 및 페이지 변경 시 리뷰 목록 조회
  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  // 리뷰 삭제 핸들러
  const handleReviewDeleted = async (reviewId: number) => {
    try {
      await deleteReview(String(reviewId));
      showToast("리뷰가 삭제되었습니다.", "delete");

      // 리뷰 목록 다시 조회
      await fetchReviews(currentPage);

      // 마지막 페이지에서 마지막 항목을 삭제한 경우 이전 페이지로 이동
      if (reviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      console.error("리뷰 삭제 실패:", error);
      showToast(error.message || "리뷰 삭제에 실패했습니다.", "error");
    }
  };

  // 리뷰 수정 핸들러
  const handleReviewEdit = (review: MyReview) => {
    setEditingReview(review);
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReview(null);
  };

  // 수정 완료 핸들러
  const handleEditComplete = async () => {
    if (!editingReview) return;

    try {
      // 리뷰 목록 다시 조회하여 즉시 반영
      await fetchReviews(currentPage);
      handleCloseEditModal();
      // 성공 토스트
      showToast("리뷰가 수정되었습니다.", "success");
    } catch (error) {
      console.error("리뷰 목록 조회 실패:", error);
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
        내가 작성한 리뷰 ({totalElements}개)
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div className="space-y-6 mb-4">
            {reviews.map((review) => (
              <ReviewItem
                key={review.reviewId}
                review={review}
                onReviewDeleted={handleReviewDeleted}
                onReviewEdit={handleReviewEdit}
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

      {isEditModalOpen && editingReview && (
        <ReviewWriteModal
          onClose={handleCloseEditModal}
          cafe={{ name: editingReview.cafeName }}
          cafeId={String(editingReview.cafeId)}
          editReview={{
            id: editingReview.reviewId,
            user: editingReview.reviewerNickname,
            content: editingReview.content,
            date: formatDate(editingReview.createdAt),
            likes: 0,
            images: editingReview.images.map((img) => img.imageUrl),
            rating: editingReview.rating,
          }}
          onReviewSubmitted={handleEditComplete}
        />
      )}
    </div>
  );
}
