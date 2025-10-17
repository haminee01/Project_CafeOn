"use client";

import React, { useState, use } from "react";
import ChatModal from "../../../../src/components/chat/CafeChatModal";

interface CafeDetailPageProps {
  params: Promise<{
    cafeId: string;
  }>;
}

const CafeDetailPage: React.FC<CafeDetailPageProps> = ({ params }) => {
  // 1. 모달 열림 상태를 관리하는 State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // 2. 현재 카페 정보 (실제로는 API에서 가져옵니다)
  const resolvedParams = use(params);
  const cafeId = resolvedParams.cafeId;
  const cafeName = `문래 마이스페이스 ${cafeId}`;

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };

  return (
    <div className="p-8">
      {/* ------------------------------------- */}
      {/* 작업할 카페 상세 페이지 본문*/}
      {/* ------------------------------------- */}
      <h1 className="text-3xl font-extrabold text-amber-900 mb-4">
        {cafeName}
      </h1>
      <p className="text-gray-600 mb-8">
        여기는 카페 정보, 리뷰, 지도 등 상세 내용이 표시되는 페이지 본문입니다.
      </p>

      {/* 3. 모달을 띄우는 버튼 */}
      <button
        onClick={handleOpenChat}
        className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 transition duration-200"
      >
        1:1 채팅하기 (모달 열기)
      </button>

      <div className="mt-12 p-4 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
        <p>카페 상세 정보, 이미지 갤러리, 리뷰 섹션 등이 여기에 들어갑니다.</p>
      </div>
      {/* ------------------------------------- */}

      {/* 4. 모달 조건부 렌더링 */}
      {isChatModalOpen && (
        <ChatModal
          cafeId={cafeId}
          cafeName={cafeName}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default CafeDetailPage;
