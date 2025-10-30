"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LoginPromptModalProps {
  onClose: () => void;
  message?: string;
}

export default function LoginPromptModal({
  onClose,
  message = "로그인 후 기능을 이용할 수 있습니다.",
}: LoginPromptModalProps) {
  const pathname = usePathname();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            로그인이 필요합니다
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 메시지 */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <p className="text-center text-gray-600">{message}</p>
        </div>

        {/* 버튼들 */}
        <div className="space-y-3">
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
            onClick={onClose}
          >
            로그인하기
          </Link>
          <Link
            href={`/signup?redirect=${encodeURIComponent(pathname)}`}
            className="w-full border border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors flex items-center justify-center"
            onClick={onClose}
          >
            회원가입하기
          </Link>
        </div>

        {/* 취소 버튼 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full text-gray-500 py-2 rounded-lg font-medium hover:text-gray-700 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
