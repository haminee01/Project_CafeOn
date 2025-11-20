"use client";

import { useRouter } from "next/navigation";
import QuestionForm from "@/components/qna/QuestionForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/common/ToastProvider";

export default function CreateQuestionPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { showToast } = useToastContext();

  const handleSuccess = () => {
    // 등록 성공 시 문의 목록 페이지로 이동
    router.push("/mypage/qna");
  };

  const handleCancel = () => {
    // 취소 시 문의 목록 페이지로 이동
    router.push("/mypage/qna");
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
    <div className="p-8 bg-gray-50 min-h-full">
      {/* 헤더 영역 */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/mypage/qna")}
          className="text-[#6E4213] hover:text-[#5a360f] mb-4 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          문의 목록으로 돌아가기
        </button>
        <h1 className="text-2xl font-bold text-gray-800">새 문의 등록</h1>
      </div>

      {/* 문의 등록 폼 */}
      <QuestionForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        showToast={showToast}
      />
    </div>
  );
}
