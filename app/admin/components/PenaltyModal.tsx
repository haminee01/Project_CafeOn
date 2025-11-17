"use client";

import InputModal from "./InputModal";

interface PenaltyModalProps {
  isOpen: boolean;
  memberName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function PenaltyModal({
  isOpen,
  memberName,
  onConfirm,
  onClose,
}: PenaltyModalProps) {
  return (
    <InputModal
      isOpen={isOpen}
      onClose={onClose}
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
