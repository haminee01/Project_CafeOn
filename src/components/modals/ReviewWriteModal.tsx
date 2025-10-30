"use client";

import { useState, useEffect } from "react";
import { CafeReview } from "@/data/cafeDetails";
import Button from "@/components/common/Button";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { createReview, updateReview } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "../common/Toast";

interface ReviewWriteModalProps {
  onClose: () => void;
  cafe: {
    name: string;
  };
  cafeId: string;
  editReview?: CafeReview; // 수정할 리뷰 데이터
  onReviewSubmitted?: () => void; // 리뷰 작성 완료 후 콜백
}

export default function ReviewWriteModal({
  onClose,
  cafe,
  cafeId,
  editReview,
  onReviewSubmitted,
}: ReviewWriteModalProps) {
  useEscapeKey(onClose);
  const { isAuthenticated, user } = useAuth();
  const isEditMode = !!editReview;
  const [reviewContent, setReviewContent] = useState(editReview?.content || "");
  const [rating, setRating] = useState(editReview?.rating || 5);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    editReview?.images || []
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleSubmit = async () => {
    // 로그인 체크는 모달 열기 전에 이미 처리되었으므로 여기서는 불필요
    if (!reviewContent.trim()) {
      setToast({
        message: "리뷰 내용을 입력해주세요.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && editReview) {
        // 리뷰 수정
        await updateReview(editReview.id.toString(), {
          content: reviewContent,
          rating: rating,
          images: selectedImages,
        });
        setToast({
          message: "리뷰가 수정되었습니다.",
          type: "success",
        });
      } else {
        // 리뷰 작성
        await createReview(cafeId, {
          content: reviewContent,
          rating: rating,
          images: selectedImages,
        });
        setToast({
          message: "리뷰가 작성되었습니다.",
          type: "success",
        });
      }

      // 성공 시 즉시 모달 닫기 및 리뷰 목록 새로고침
      onClose();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error("리뷰 처리 실패:", error);
      setToast({
        message: isEditMode
          ? "리뷰 수정에 실패했습니다."
          : "리뷰 작성에 실패했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    console.log("리뷰 삭제");
    // 실제 구현에서는 리뷰 삭제 로직
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - selectedImages.length); // 최대 5개까지
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedImages((prev) => [...prev, ...newFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageAreaClick = () => {
    document.getElementById("image-upload")?.click();
  };

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-end items-center mb-6">
          <Button
            onClick={onClose}
            color="gray"
            size="sm"
            className="!p-1 !min-w-0"
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
          </Button>
        </div>

        <div className="space-y-6">
          {/* 별점 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">별점</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating}점</span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              리뷰 내용
            </label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="카페에 대한 솔직한 리뷰를 작성해주세요..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* 이미지 영역 */}
          <div className="space-y-4">
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreviewUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => handleRemoveImage(index)}
                      color="warning"
                      size="sm"
                      className="absolute top-2 right-2 !w-6 !h-6 !p-0 !min-w-0 !rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={handleImageAreaClick}
                className="bg-gray-200 h-64 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400"
              >
                <svg
                  className="w-12 h-12 text-gray-600 mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-gray-600 text-sm">
                  사진을 첨부하려면 클릭하세요
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  최대 5장까지 첨부 가능
                </p>
              </div>
            )}

            {imagePreviewUrls.length > 0 && imagePreviewUrls.length < 5 && (
              <Button
                onClick={handleImageAreaClick}
                color="gray"
                size="md"
                className="w-full !border-2 !border-dashed"
              >
                + 사진 더 추가하기
              </Button>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-between">
            {isEditMode && (
              <Button onClick={handleDelete} color="warning" size="md">
                삭제하기
              </Button>
            )}
            <div className={`flex gap-3 ${isEditMode ? "ml-auto" : ""}`}>
              <Button onClick={onClose} color="gray" size="md">
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                color="primary"
                size="md"
                disabled={loading || !reviewContent.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? "수정 중..." : "작성 중..."}
                  </div>
                ) : isEditMode ? (
                  "수정 완료"
                ) : (
                  "작성 완료"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 토스트 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
