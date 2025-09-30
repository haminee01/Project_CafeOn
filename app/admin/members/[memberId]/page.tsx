"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

interface MemberDetailPageProps {
  params: {
    memberId: string;
  };
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  const router = useRouter();
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");

  // 실제로는 API에서 가져올 데이터
  const member = {
    id: parseInt(params.memberId),
    name: "김이름",
    email: "test@test.com",
    nickname: "닉네임님",
    keywords: ["#데이트", "#우중카페", "#카공"],
    penaltyScore: 2,
    status: "active",
    profileImage: "/api/placeholder/120/120",
  };

  // 페널티 내역 데이터
  const penaltyHistory = [
    {
      id: 1,
      reason: "부적절한 리뷰 작성",
      date: "2024.01.20",
      admin: "관리자1"
    },
    {
      id: 2,
      reason: "스팸 댓글 작성",
      date: "2024.01.15",
      admin: "관리자2"
    },
    {
      id: 3,
      reason: "허위 정보 유포",
      date: "2024.01.10",
      admin: "관리자1"
    }
  ];

  // 페널티 총 횟수 계산
  const totalPenaltyCount = penaltyHistory.length;
  
  // 페널티 내역을 최신순으로 정렬
  const sortedPenaltyHistory = [...penaltyHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSuspensionClick = () => {
    setSuspensionReason("");
    setShowSuspensionModal(true);
  };

  const handleSuspensionConfirm = () => {
    if (suspensionReason.trim()) {
      // 실제로는 API 호출
      console.log(`회원 ${member.name} 정지 처리: ${suspensionReason}`);
      setShowSuspensionModal(false);
      setSuspensionReason("");
    }
  };

  const handleSuspensionCancel = () => {
    setShowSuspensionModal(false);
    setSuspensionReason("");
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">회원관리</h1>
      </div>

      {/* 회원 상세 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
        {/* 프로필 이미지 */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* 닉네임 */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">{member.nickname}</h2>
        </div>

        {/* 회원 정보 폼 */}
        <div className="space-y-4">
          {/* 이름 */}
          <div className="flex items-center">
            <label className="w-20 text-sm font-medium text-gray-700">이름</label>
            <div className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
              {member.name}
            </div>
          </div>

          {/* 이메일 */}
          <div className="flex items-center">
            <label className="w-20 text-sm font-medium text-gray-700">이메일</label>
            <div className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
              {member.email}
            </div>
          </div>

          {/* 키워드 */}
          <div className="flex items-center">
            <label className="w-20 text-sm font-medium text-gray-700">키워드</label>
            <div className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {member.keywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-secondary text-white text-sm rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>


          {/* 패널티 */}
          <div className="flex items-center">
            <label className="w-20 text-sm font-medium text-gray-700">패널티</label>
            <div className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <span className="text-lg font-semibold text-red-600">{totalPenaltyCount}회</span>
            </div>
          </div>
        </div>

        {/* 페널티 내역 섹션 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">페널티 내역</h3>
          <div className="space-y-3">
            {sortedPenaltyHistory.length > 0 ? (
              sortedPenaltyHistory.map((penalty) => (
                <div key={penalty.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{penalty.reason}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {penalty.date} • {penalty.admin}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        페널티
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>페널티 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2 mt-8">
        <Button 
          color="gray" 
          size="md"
          onClick={() => router.back()}
        >
          뒤로가기
        </Button>
          <Button 
            color="warning" 
            size="md"
            onClick={handleSuspensionClick}
          >
            {member.status === "active" ? "정지" : "정지 해제"}
          </Button>
        </div>
      </div>

      {/* 정지 모달 */}
      {showSuspensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              정지 사유 입력
            </h3>
            <input
              type="text"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="정지 사유를 입력하세요"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-6"
            />
            <div className="flex gap-3 justify-end">
              <Button 
                color="gray" 
                size="md"
                onClick={handleSuspensionCancel}
              >
                취소
              </Button>
              <Button 
                color="warning" 
                size="md"
                onClick={handleSuspensionConfirm}
                disabled={!suspensionReason.trim()}
              >
                {member.status === "active" ? "정지하기" : "정지 해제"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
