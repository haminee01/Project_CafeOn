"use client";

import { useState } from "react";
import {
  useCreateQuestion,
  QuestionVisibility,
  CreateQuestionRequest,
} from "@/hooks/useCreateQuestion";

interface QuestionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export default function QuestionForm({
  onSuccess,
  onCancel,
  showToast,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    title: "",
    content: "",
    visibility: QuestionVisibility.PRIVATE,
  });

  const { createQuestion, isLoading, error, clearError } = useCreateQuestion();

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

    // 에러가 있으면 입력 시 클리어
    if (error) {
      clearError();
    }
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

    const result = await createQuestion(formData);

    if (result) {
      if (showToast) {
        showToast("문의가 성공적으로 등록되었습니다.", "success");
      } else {
        alert("문의가 성공적으로 등록되었습니다.");
      }
      // 폼 초기화
      setFormData({
        title: "",
        content: "",
        visibility: QuestionVisibility.PRIVATE,
      });

      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">새 문의 등록</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

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
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#6E4213] text-white py-2 px-4 rounded-md hover:bg-[#5a360f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "등록 중..." : "문의 등록"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
