"use client";

import BaseModal from "./BaseModal";
import Button from "@/components/common/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "warning" | "secondary" | "gray";
  showWarning?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  confirmColor = "primary",
  showWarning = false,
}: ConfirmModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">{message}</p>
          {showWarning && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ⚠️ 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end">
          <Button color="gray" size="md" onClick={onClose}>
            {cancelText}
          </Button>
          <Button color={confirmColor} size="md" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
