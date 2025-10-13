"use client";

import { useState } from "react";
import { createReport } from "@/api/community";
import { useToastContext } from "@/components/common/ToastProvider";

interface TemporaryAlertProps {
  message: string;
}

const TemporaryAlert = ({ message }: TemporaryAlertProps) => (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#999999] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
    {message}
  </div>
);

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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { showToast } = useToastContext();

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast("신고 사유를 선택해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const reason = selectedReason === "기타" ? customReason : selectedReason;
      await createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
      });

      setAlertMessage("신고가 접수되었습니다.");
      setShowAlert(true);

      // 2초 후 모달 닫기
      setTimeout(() => {
        setShowAlert(false);
        onClose();
        setSelectedReason("");
        setCustomReason("");
      }, 2000);
    } catch (error) {
      console.error("신고 처리 실패:", error);
      setAlertMessage("신고 처리에 실패했습니다.");
      setShowAlert(true);

      // 2초 후 알림 닫기
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showAlert && <TemporaryAlert message={alertMessage} />}

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
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "신고 중..." : "신고하기"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
