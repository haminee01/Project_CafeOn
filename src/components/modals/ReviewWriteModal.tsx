"use client";

import { useState, useEffect } from "react";
import { CafeReview } from "@/data/cafeDetails";
import Button from "@/components/common/Button";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface ReviewWriteModalProps {
  onClose: () => void;
  cafe: {
    name: string;
  };
  editReview?: CafeReview; // 수정할 리뷰 데이터
}

export default function ReviewWriteModal({ onClose, cafe, editReview }: ReviewWriteModalProps) {
  useEscapeKey(onClose);
  const isEditMode = !!editReview;
  const [reviewContent, setReviewContent] = useState(editReview?.content || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(editReview?.images || []);

  const handleSubmit = () => {
    if (isEditMode) {
      console.log('리뷰 수정:', reviewContent);
      // 실제 구현에서는 리뷰 수정 로직
    } else {
      console.log('리뷰 작성:', reviewContent);
      // 실제 구현에서는 리뷰 작성 로직
    }
    onClose();
  };

  const handleDelete = () => {
    console.log('리뷰 삭제');
    // 실제 구현에서는 리뷰 삭제 로직
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - selectedImages.length); // 최대 5개까지
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...newFiles]);
      setImagePreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageAreaClick = () => {
    document.getElementById('image-upload')?.click();
  };

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          {/* 사용자 정보 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">{isEditMode ? editReview?.user : "Sunwon903"}</span>
          </div>
          <Button
            onClick={onClose}
            color="gray"
            size="sm"
            className="!p-1 !min-w-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
              </div>



        <div className="space-y-6">


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
                <svg className="w-12 h-12 text-gray-600 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-600 text-sm">사진을 첨부하려면 클릭하세요</p>
                <p className="text-gray-400 text-xs mt-1">최대 5장까지 첨부 가능</p>
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

          {/* 리뷰 내용 작성 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">리뷰 글 작성</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none"
                rows={6}
                placeholder="어떤 경험을 했나요?"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-between">
            {isEditMode && (
              <Button
                onClick={handleDelete}
                color="warning"
                size="md"
              >
                삭제하기
              </Button>
            )}
            <div className={`flex gap-3 ${isEditMode ? 'ml-auto' : ''}`}>
              <Button
                onClick={onClose}
                color="gray"
                size="md"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                color="primary"
                size="md"
              >
                {isEditMode ? '수정 완료' : '작성 완료'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
