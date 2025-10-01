"use client";

import { useState } from "react";
import {
  BaseModal,
  ConfirmModal,
  InputModal,
  InfoModal,
  CheckboxModal,
  DeleteConfirmModal,
  PenaltyModal,
} from "./index";
import Button from "@/components/common/Button";

// 모달 사용 예시 컴포넌트 (개발/테스트용)
export default function ModalExamples() {
  const [showBaseModal, setShowBaseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCheckboxModal, setShowCheckboxModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const [checkboxOptions, setCheckboxOptions] = useState([
    {
      id: "option1",
      label: "옵션 1",
      description: "첫 번째 옵션입니다",
      checked: false,
    },
    {
      id: "option2",
      label: "옵션 2",
      description: "두 번째 옵션입니다",
      checked: true,
    },
    {
      id: "option3",
      label: "옵션 3",
      description: "세 번째 옵션입니다",
      checked: false,
    },
  ]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckboxOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, checked } : option))
    );
  };

  const infoItems = [
    { label: "이름", value: "홍길동", type: "text" as const },
    {
      label: "상태",
      value: "활성",
      type: "badge" as const,
      badgeColor: "green" as const,
    },
    {
      label: "등급",
      value: "VIP",
      type: "badge" as const,
      badgeColor: "blue" as const,
    },
    { label: "가입일", value: "2024.01.01", type: "text" as const },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">모달 컴포넌트 예시</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button onClick={() => setShowBaseModal(true)}>기본 모달</Button>
        <Button onClick={() => setShowConfirmModal(true)}>확인 모달</Button>
        <Button onClick={() => setShowInputModal(true)}>입력 모달</Button>
        <Button onClick={() => setShowInfoModal(true)}>정보 모달</Button>
        <Button onClick={() => setShowCheckboxModal(true)}>
          체크박스 모달
        </Button>
        <Button onClick={() => setShowDeleteModal(true)}>삭제 확인 모달</Button>
        <Button onClick={() => setShowPenaltyModal(true)}>페널티 모달</Button>
      </div>

      {/* 기본 모달 */}
      <BaseModal
        isOpen={showBaseModal}
        onClose={() => setShowBaseModal(false)}
        title="기본 모달"
        size="md"
      >
        <p>이것은 기본 모달입니다. 자유롭게 내용을 추가할 수 있습니다.</p>
        <div className="mt-4">
          <Button onClick={() => setShowBaseModal(false)}>닫기</Button>
        </div>
      </BaseModal>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          alert("확인되었습니다!");
          setShowConfirmModal(false);
        }}
        title="확인 모달"
        message="이 작업을 계속하시겠습니까?"
        confirmText="계속"
        cancelText="취소"
        confirmColor="primary"
      />

      {/* 입력 모달 */}
      <InputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onConfirm={(value) => {
          alert(`입력된 값: ${value}`);
          setShowInputModal(false);
        }}
        title="입력 모달"
        placeholder="여기에 입력하세요"
        label="입력 필드"
        multiline={true}
        rows={3}
      />

      {/* 정보 모달 */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="정보 모달"
        items={infoItems}
        size="lg"
      />

      {/* 체크박스 모달 */}
      <CheckboxModal
        isOpen={showCheckboxModal}
        onClose={() => setShowCheckboxModal(false)}
        onConfirm={() => {
          const selected = checkboxOptions.filter((opt) => opt.checked);
          alert(`선택된 항목: ${selected.map((opt) => opt.label).join(", ")}`);
          setShowCheckboxModal(false);
        }}
        title="체크박스 모달"
        options={checkboxOptions.map((option) => ({
          ...option,
          onChange: (checked: boolean) =>
            handleCheckboxChange(option.id, checked),
        }))}
      />

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          alert("삭제되었습니다!");
          setShowDeleteModal(false);
        }}
        title="삭제 확인"
        message="카페를 정말 삭제하시겠습니까?"
        itemName="스타벅스 강남점"
      />

      {/* 페널티 모달 */}
      <PenaltyModal
        isOpen={showPenaltyModal}
        onCancel={() => setShowPenaltyModal(false)}
        onConfirm={(reason) => {
          alert(`페널티 사유: ${reason}`);
          setShowPenaltyModal(false);
        }}
        memberName="홍길동"
      />
    </div>
  );
}
