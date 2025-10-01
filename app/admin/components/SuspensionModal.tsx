"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface SuspensionModalProps {
  isOpen: boolean;
  memberName: string;
  isSuspending: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function SuspensionModal({
  isOpen,
  memberName,
  isSuspending,
  onConfirm,
  onCancel,
}: SuspensionModalProps) {
  useEscapeKey(onCancel);
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
    }
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isSuspending ? "정지 사유 입력" : "정지 해제 확인"}
        </h3>
        {isSuspending ? (
          <>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="정지 사유를 입력하세요"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-6"
            />
            <div className="flex gap-3 justify-end">
              <Button color="gray" size="md" onClick={handleCancel}>
                취소
              </Button>
              <Button
                color="primary"
                size="md"
                onClick={handleConfirm}
                disabled={!reason.trim()}
              >
                확인
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">"{memberName}"</span> 회원의 정지를
              해제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <Button color="gray" size="md" onClick={handleCancel}>
                취소
              </Button>
              <Button color="primary" size="md" onClick={handleConfirm}>
                해제
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
