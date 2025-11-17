"use client";

import ConfirmModal from "./ConfirmModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
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
