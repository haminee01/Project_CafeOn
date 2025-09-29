"use client";

import { useState } from "react";

interface ReviewModalProps {
  onClose: () => void;
  cafe: {
    name: string;
  };
}

export default function ReviewModal({ onClose, cafe }: ReviewModalProps) {
  const [reviewContent, setReviewContent] = useState("");

  const handleSubmit = () => {
    console.log('리뷰 작성:', reviewContent);
    // 실제 구현에서는 리뷰 작성 로직
    alert('리뷰가 작성되었습니다.');
    onClose();
  };

  const handleDelete = () => {
    console.log('리뷰 삭제');
    // 실제 구현에서는 리뷰 삭제 로직
    alert('리뷰가 삭제되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">리뷰 작성/수정 모달 (상세 내에서 열리는 화면)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* 사용자 정보 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Sunwon903</span>
          </div>

          {/* 이미지 영역 */}
          <div className="bg-gray-200 rounded-lg p-8 flex items-center justify-center">
            <div className="bg-gray-400 rounded-lg p-4">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
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
                placeholder="일단 들어오자마자 스모어 쿠키가 많아서 좋았어요!! 디저트 뭐 먹을지 고르는데 한세월 걸렸지만...딥 더티 초콜릿.... 진짜 비주얼 보이세요??? 초코 음료 저거랑 상큼한 치즈케이크 같이 먹으니까 걍 극락"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDelete}
              className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              리뷰 삭제
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              작성 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
