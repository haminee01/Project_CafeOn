"use client";

import { useState, useEffect } from "react";
import { UpdateQuestionRequest } from "@/hooks/useMyQuestionActions";
import { QuestionVisibility } from "@/hooks/useCreateQuestion";

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateQuestionRequest) => Promise<boolean>;
  initialData: {
    title: string;
    content: string;
    visibility: "PUBLIC" | "PRIVATE";
  };
  isLoading?: boolean;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export default function QuestionEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
  showToast,
}: QuestionEditModalProps) {
  const [formData, setFormData] = useState<UpdateQuestionRequest>({
    title: "",
    content: "",
    visibility: QuestionVisibility.PRIVATE,
  });

  // 모달이 열릴 때 초기 데이터 설정
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        visibility: initialData.visibility,
      });
    }
  }, [isOpen, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      if (showToast) {
        showToast("문의 제목을 입력해주세요.", "error");
      } else {
        alert("문의 제목을 입력해주세요.");
      }
      return;
    }

    if (!formData.content.trim()) {
      if (showToast) {
        showToast("문의 내용을 입력해주세요.", "error");
      } else {
        alert("문의 내용을 입력해주세요.");
      }
      return;
    }

    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    // 폼 초기화
    setFormData({
      title: initialData.title,
      content: initialData.content,
      visibility: initialData.visibility,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">문의 수정</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 문의 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                문의 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E4213] focus:border-transparent"
                placeholder="문의 제목을 입력해주세요"
                disabled={isLoading}
              />
            </div>

            {/* 문의 내용 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                문의 내용 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E4213] focus:border-transparent resize-vertical"
                placeholder="문의 내용을 자세히 입력해주세요"
                disabled={isLoading}
              />
            </div>

            {/* 가시성 설정 */}
            <div>
              <label
                htmlFor="visibility"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                공개 설정
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E4213] focus:border-transparent"
                disabled={isLoading}
              >
                <option value={QuestionVisibility.PRIVATE}>
                  비공개 (관리자만 확인 가능)
                </option>
                <option value={QuestionVisibility.PUBLIC}>
                  공개 (다른 사용자도 확인 가능)
                </option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                공개 문의는 다른 사용자들도 볼 수 있으며, 비공개 문의는 관리자만
                확인할 수 있습니다.
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-4 pt-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#6E4213] text-white rounded-md hover:bg-[#5a360f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "수정 중..." : "수정 완료"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
