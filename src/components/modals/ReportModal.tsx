"use client";

import { useState } from "react";
import { createPostReport, createCommentReport } from "@/api/community";
import { useToastContext } from "@/components/common/ToastProvider";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment";
  targetId: number;
}

const REPORT_REASONS = [
  "스팸 또는 광고",
  "부적절한 내용",
  "욕설 또는 비방",
  "개인정보 유출",
  "저작권 침해",
  "기타",
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToastContext();

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast("신고 사유를 선택해주세요.", "error");
      return;
    }

    // "기타" 선택 시 커스텀 사유가 비어있으면 에러
    if (selectedReason === "기타" && !customReason.trim()) {
      showToast("신고 사유를 자세히 입력해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const reason = selectedReason === "기타" ? customReason : selectedReason;

      // 게시글 신고인 경우 새로운 API 사용
      if (targetType === "post") {
        await createPostReport(targetId, reason);
      } else {
        // 댓글 신고인 경우 새로운 API 사용
        await createCommentReport(targetId, reason);
      }

      showToast("신고가 접수되었습니다.", "success");

      // 모달 닫기
      onClose();
      setSelectedReason("");
      setCustomReason("");
    } catch (error) {
      console.error("신고 처리 실패:", error);

      // 에러 메시지 추출
      let errorMessage = "신고 처리에 실패했습니다.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedReason("");
    setCustomReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">신고하기</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            신고 사유를 선택해주세요:
          </p>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedReason === "기타" && (
          <div className="mb-4">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="신고 사유를 자세히 입력해주세요..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {customReason.length}/500자
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedReason ||
              (selectedReason === "기타" && !customReason.trim())
            }
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "신고 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
