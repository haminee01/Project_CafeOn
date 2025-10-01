// components/ProfileMiniPopup.tsx
"use client";

import React from "react";

export interface UserProfile {
  id: string;
  name: string;
}

interface ProfileMiniPopupProps {
  targetUserForPopup: UserProfile | null;
  popupPosition: { x: number; y: number } | null;
  handleStartPrivateChat: (user: UserProfile) => void;
  closePopup: () => void;
}

const ProfileMiniPopup: React.FC<ProfileMiniPopupProps> = ({
  targetUserForPopup,
  popupPosition,
  handleStartPrivateChat,
  closePopup,
}) => {
  if (!targetUserForPopup || !popupPosition) {
    return null;
  }

  // 1:1 대화 시작 버튼 클릭 핸들러
  const onStartChatClick = () => {
    handleStartPrivateChat(targetUserForPopup);
  };

  return (
    <div
      className="absolute p-3 bg-white border border-gray-300 rounded-lg shadow-xl z-50 transform -translate-y-1/2"
      style={{
        // 모달 박스(상대 컨테이너) 내부의 상대 위치로 설정
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="font-semibold mb-2 text-sm whitespace-nowrap text-gray-800">
        {targetUserForPopup.name} 님과 대화하시겠습니까?
      </p>
      <button
        onClick={onStartChatClick}
        className="w-full px-4 py-1 text-sm bg-[#6E4213] text-white rounded-md hover:bg-[#8d5e33] transition"
      >
        1:1 대화하기
      </button>
      <button
        onClick={closePopup}
        className="mt-1 w-full text-gray-500 hover:text-gray-700 text-sm"
      >
        닫기
      </button>
    </div>
  );
};

export default ProfileMiniPopup;
