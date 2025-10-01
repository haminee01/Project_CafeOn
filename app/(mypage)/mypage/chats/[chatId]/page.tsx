"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import ChatMessageList from "../../../../../src/components/chat/ChatMessageList";
import ChatMessageInput from "../../../../../src/components/chat/ChatMessageInput";
import PrivateChatModal from "../../../../../src/components/chat/PrivateChatModal";
import { usePrivateChatFlow } from "../../../../../src/hooks/usePrivateChatFlow";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

interface UserProfile {
  id: string;
  name: string;
}

// --- 더미 데이터 (그룹 채팅 메시지) ---
const initialGroupMessages: ChatMessage[] = [
  {
    id: "g1",
    senderName: "엘리스",
    content: "안녕하세요, 그룹 채팅에 오신 것을 환영합니다!",
    isMyMessage: false,
    senderId: "user-alice",
  },
  {
    id: "g2",
    senderName: "운영자",
    content: "공지사항을 확인해 주세요.",
    isMyMessage: false,
    senderId: "user-admin",
  },
  {
    id: "g3",
    senderName: "닉네임",
    content: "반가워요!",
    isMyMessage: true,
    senderId: "user-me",
  },
];

const DUMMY_USER_PROFILES: { [key: string]: UserProfile } = {
  "user-alice": { id: "user-alice", name: "엘리스" },
  "user-admin": { id: "user-admin", name: "운영자" },
  "user-bob": { id: "user-bob", name: "밥" },
};

// --- 컴포넌트 시작 ---
const ChatDetailView: React.FC = () => {
  const params = useParams();
  const chatId = params.chatId as string;

  // 그룹 채팅 메시지 상태
  const [messages, setMessages] = useState<ChatMessage[]>(initialGroupMessages);

  // usePrivateChatFlow 훅을 사용하여 상태와 액션 가져오기
  const {
    targetUserForPopup,
    popupPosition,
    targetUserForPrivateChat,
    handleProfileClick,
    handleStartPrivateChat,
    closePrivateChatModal,
    closePopup, // 리스트 배경 클릭 시 팝업 닫기 함수
  } = usePrivateChatFlow(DUMMY_USER_PROFILES);

  // 그룹 채팅 메시지 전송 핸들러
  const handleSendGroupMessage = (message: string) => {
    // ... 그룹 메시지 전송 로직
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: "닉네임",
      content: message,
      isMyMessage: true,
      senderId: "user-me",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-gray-100 p-4 shadow-md">
        <h1 className="text-2xl font-bold">그룹 채팅방: {chatId}</h1>
      </header>
      <div className="relative flex flex-grow overflow-hidden">
        {/* 그룹 채팅 메시지 리스트 */}
        <ChatMessageList
          messages={messages}
          onProfileClick={handleProfileClick}
          onListClick={closePopup}
        />

        {/* 메시지 입력 창 */}
        <ChatMessageInput onSendMessage={handleSendGroupMessage} />

        {/* 1. 유저 프로필 팝업 */}
        {targetUserForPopup && popupPosition && (
          <div
            className="fixed z-50 rounded-lg bg-white p-4 shadow-xl"
            style={{
              top: popupPosition.y,
              left: popupPosition.x,
              transform: "translate(-100%, -100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-semibold">
              {targetUserForPopup.name} 님과 대화하시겠습니까?
            </h3>
            <button
              // usePrivateChatFlow의 1:1 채팅 시작 핸들러 사용
              onClick={() => handleStartPrivateChat(targetUserForPopup)}
              className="w-full rounded bg-[#6E4213] p-2 font-bold text-white transition hover:bg-[#5a360f]"
            >
              1:1 대화하기
            </button>
            <button
              // usePrivateChatFlow의 팝업 닫기 함수 사용
              onClick={closePopup}
              className="mt-2 w-full rounded p-2 text-gray-600 hover:bg-gray-100"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* 2. 1:1 채팅 모달 */}
      {targetUserForPrivateChat && (
        <PrivateChatModal
          targetUser={targetUserForPrivateChat}
          onClose={closePrivateChatModal}
        />
      )}
    </div>
  );
};

export default ChatDetailView;
