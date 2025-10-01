"use client";

import ConfirmModal from "./ConfirmModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={`"${itemName}" ${message}`}
      confirmText="삭제"
      cancelText="취소"
      confirmColor="warning"
      showWarning={true}
    />
  );
}
