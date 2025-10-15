"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuestionDetail, useAnswerList } from "@/hooks/useQnA";
import { QuestionVisibility } from "@/types/qna";
import { useAuth } from "@/hooks/useAuth";

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuestionDetailPage({
  params,
}: QuestionDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const questionId = parseInt(resolvedParams.id);
  const { user } = useAuth();

  // 문의 상세 조회
  const { question, isLoading, error, refetch } = useQuestionDetail(questionId);

  // 답변 목록 조회 (비공개 문의는 작성자만 조회 가능)
  const canViewAnswers =
    question?.visibility === QuestionVisibility.PUBLIC ||
    (question?.visibility === QuestionVisibility.PRIVATE &&
      user?.username === question?.authorNickname);

  const {
    answers,
    isLoading: answersLoading,
    error: answersError,
  } = useAnswerList(
    canViewAnswers && question?.status === "ANSWERED" ? questionId : 0
  );

  // 상태 표시 함수들
  const getStatusText = (status: string | null) => {
    return status === "ANSWERED" ? "답변 완료" : "답변 대기";
  };

  const getStatusColor = (status: string | null) => {
    return status === "ANSWERED"
      ? "text-green-600 bg-green-100"
      : "text-orange-600 bg-orange-100";
  };

  const getVisibilityText = (visibility: QuestionVisibility) => {
    return visibility === QuestionVisibility.PUBLIC ? "공개" : "비공개";
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-gray-500">문의를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">오류가 발생했습니다.</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <div className="space-x-2">
            <button
              onClick={refetch}
              className="bg-[#6E4213] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 문의가 없는 경우
  if (!question) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">문의를 찾을 수 없습니다.</div>
          <button
            onClick={handleBack}
            className="bg-[#6E4213] text-white text-sm px-4 py-2 rounded-md hover:bg-[#5a360f] transition-colors"
          >
            뒤로가기
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
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              뒤로가기
            </button>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                  question.status
                )}`}
              >
                {getStatusText(question.status)}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                {getVisibilityText(question.visibility)}
              </span>
            </div>
          </div>
        </header>

        {/* 문의 내용 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* 문의 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {question.title}
          </h1>

          {/* 문의 메타 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <span>작성자: {question.authorNickname}</span>
              <span>
                작성일:{" "}
                {new Date(question.createdAt).toLocaleDateString("ko-KR")}
              </span>
              {question.updatedAt !== question.createdAt && (
                <span>
                  수정일:{" "}
                  {new Date(question.updatedAt).toLocaleDateString("ko-KR")}
                </span>
              )}
            </div>
          </div>

          {/* 문의 내용 */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {question.content}
            </div>
          </div>
        </div>

        {/* 답변 섹션 */}
        {canViewAnswers && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">답변</h2>

            {answersLoading ? (
              <div className="text-center py-8 text-gray-500">
                답변을 불러오는 중...
              </div>
            ) : answersError ? (
              <div className="text-center py-8 text-red-500">
                답변을 불러오는데 실패했습니다.
              </div>
            ) : answers.length > 0 ? (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <div
                    key={answer.answerId}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                  >
                    {/* 답변 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span>관리자: {answer.adminNickname}</span>
                        <span>
                          작성일:{" "}
                          {new Date(answer.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                        {answer.updatedAt !== answer.createdAt && (
                          <span>
                            수정일:{" "}
                            {new Date(answer.updatedAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 답변 내용 */}
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {answer.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                아직 답변이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 비공개 문의 안내 */}
        {question.visibility === QuestionVisibility.PRIVATE && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-yellow-800 text-sm">
                이 문의는 비공개 문의입니다. 작성자와 관리자만 내용을 확인할 수
                있습니다.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
