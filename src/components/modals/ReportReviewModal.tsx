"use client";

import { useState, useEffect } from "react";
import Button from "../common/Button";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { reportReview, checkReviewReportStatus } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "../common/Toast";

interface ReportReviewModalProps {
  onClose: () => void;
  reviewId: number;
  reviewAuthor: string;
}

// 신고 사유 옵션들
const REPORT_REASONS = [
  { value: "SPAM", label: "스팸/홍보성 내용" },
  { value: "INAPPROPRIATE", label: "부적절한 내용" },
  { value: "HARASSMENT", label: "욕설/비방" },
  { value: "FALSE_INFO", label: "거짓 정보" },
  { value: "OTHER", label: "기타" },
];

export default function ReportReviewModal({
  onClose,
  reviewId,
  reviewAuthor,
}: ReportReviewModalProps) {
  useEscapeKey(onClose);
  const { isAuthenticated } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isAlreadyReported, setIsAlreadyReported] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // 모달이 열릴 때 신고 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await checkReviewReportStatus(reviewId.toString());
        if (response.data === true) {
          setIsAlreadyReported(true);
        }
      } catch (error) {
        console.error("신고 상태 확인 실패:", error);
        // 에러가 발생해도 모달은 정상적으로 표시
      }
    };

    checkStatus();
  }, [reviewId, isAuthenticated]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setToast({
        message: "로그인이 필요한 서비스입니다.",
        type: "error",
      });
      return;
    }

    if (!selectedReason) {
      setToast({
        message: "신고 사유를 선택해주세요.",
        type: "error",
      });
      return;
    }

    if (selectedReason === "OTHER" && !customReason.trim()) {
      setToast({
        message: "기타 사유를 입력해주세요.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const reasonText =
        selectedReason === "OTHER"
          ? customReason
          : REPORT_REASONS.find((r) => r.value === selectedReason)?.label ||
            selectedReason;

      await reportReview(reviewId.toString(), reasonText);

      // 성공 시 신고 완료 상태로 변경
      setIsReported(true);
    } catch (error: any) {
      console.error("리뷰 신고 실패:", error);

      // 이미 신고한 경우 특별 처리
      if (error.message && error.message.includes("이미 신고한 대상입니다")) {
        setIsAlreadyReported(true);
      } else if (
        error.message &&
        error.message.includes("본인 작성물은 신고할 수 없습니다")
      ) {
        setToast({
          message: "본인의 리뷰는 신고할 수 없습니다.",
          type: "error",
        });
      } else {
        setToast({
          message: "신고 처리에 실패했습니다. 잠시 후 다시 시도해주세요.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">리뷰 신고</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
          </button>
        </div>

        {/* 이미 신고한 경우 */}
        {isAlreadyReported ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              이미 신고한 리뷰입니다
            </h3>
            <p className="text-gray-600 mb-6">
              해당 리뷰는 이미 신고하셨습니다.
              <br />
              검토 후 조치하겠습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              확인
            </button>
          </div>
        ) : isReported ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              신고가 완료되었습니다
            </h3>
            <p className="text-gray-600 mb-6">
              리뷰 신고가 접수되었습니다.
              <br />
              검토 후 조치하겠습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            {/* 신고 대상 정보 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">신고 대상</p>
              <p className="font-medium text-gray-900">
                {reviewAuthor}님의 리뷰
              </p>
            </div>

            {/* 신고 사유 선택 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  신고 사유를 선택해주세요
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {reason.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 기타 사유 입력 */}
              {selectedReason === "OTHER" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    구체적인 사유를 입력해주세요
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="신고 사유를 자세히 입력해주세요..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  />
                </div>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">신고 안내</p>
                  <p className="text-xs text-blue-700 mt-1">
                    신고된 리뷰는 검토 후 부적절한 경우 삭제됩니다. 허위 신고는
                    제재를 받을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={onClose}
                color="gray"
                size="md"
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                color="primary"
                size="md"
                className="flex-1"
                disabled={
                  loading ||
                  !selectedReason ||
                  (selectedReason === "OTHER" && !customReason.trim())
                }
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    신고 중...
                  </div>
                ) : (
                  "신고하기"
                )}
              </Button>
            </div>

            {/* 토스트 */}
            {toast && (
              <div className="fixed top-4 right-4 z-[60]">
                <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
