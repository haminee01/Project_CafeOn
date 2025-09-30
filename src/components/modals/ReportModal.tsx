"use client";

import { useState } from "react";

interface ReportModalProps {
  onClose: () => void;
}

export default function ReportModal({ onClose }: ReportModalProps) {
  const [reportedUserId, setReportedUserId] = useState("미운오리9214");
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    console.log('리뷰 신고:', { reportedUserId, reportReason });
    // 실제 구현에서는 신고 로직
    alert('신고가 접수되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">리뷰 신고하기</h2>
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
          {/* 신고할 리뷰자 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고할 리뷰자 ID
            </label>
            <input
              type="text"
              value={reportedUserId}
              onChange={(e) => setReportedUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* 신고 사유 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 사유
            </label>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="신고 사유를 적어주세요."
            />
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            
            <button
              onClick={handleReport}
              className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              신고하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
