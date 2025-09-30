"use client";

import InputModal from "./InputModal";

interface PenaltyModalProps {
  isOpen: boolean;
  memberName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function PenaltyModal({ isOpen, memberName, onConfirm, onCancel }: PenaltyModalProps) {
  return (
    <InputModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="페널티 사유 입력"
      placeholder="페널티 사유를 입력하세요"
      label="페널티 사유"
      confirmText="확인"
      cancelText="취소"
      required={true}
      multiline={false}
    />
  );
}
