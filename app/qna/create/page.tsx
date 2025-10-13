"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateQuestion } from "@/hooks/useQnA";
import { QuestionVisibility } from "@/types/qna";
import { useAuth } from "@/hooks/useAuth";

export default function CreateQuestionPage() {
  const router = useRouter();
  const { createQuestion, isLoading, error } = useCreateQuestion();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    visibility: QuestionVisibility.PUBLIC,
  });

  // 폼 입력 핸들러
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

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 추가 유효성 검사
    const trimmedTitle = formData.title.trim();
    const trimmedContent = formData.content.trim();

    if (!trimmedTitle || !trimmedContent) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 문의 등록
    const result = await createQuestion({
      title: trimmedTitle,
      content: trimmedContent,
      visibility: formData.visibility,
    });

    if (result) {
      alert("문의가 등록되었습니다.");
      router.push(`/qna/${result.id}`);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (confirm("작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?")) {
      router.back();
    }
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">로그인이 필요합니다.</div>
          <button
            onClick={() => router.push("/login")}
            className="bg-[#6E4213] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
        {/* 헤더 영역 */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">문의 작성</h1>
        </header>

        {/* 문의 작성 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 입력 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="문의 제목을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E4213] focus:border-transparent"
              maxLength={100}
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.title.length}/100
            </div>
          </div>

          {/* 공개/비공개 선택 */}
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
            >
              <option value={QuestionVisibility.PUBLIC}>공개</option>
              <option value={QuestionVisibility.PRIVATE}>비공개</option>
            </select>
            <div className="mt-1 text-sm text-gray-500">
              {formData.visibility === QuestionVisibility.PUBLIC
                ? "모든 사용자가 문의를 볼 수 있습니다."
                : "작성자와 관리자만 문의를 볼 수 있습니다."}
            </div>
          </div>

          {/* 내용 입력 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용 *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="문의 내용을 입력해주세요"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E4213] focus:border-transparent resize-vertical"
              maxLength={2000}
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.content.length}/2000
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#6E4213] text-white rounded-md hover:bg-[#5a360f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "등록 중..." : "문의 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
