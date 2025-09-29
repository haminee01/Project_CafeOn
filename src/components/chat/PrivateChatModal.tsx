"use client";

import React, { useState } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

interface PrivateChatModalProps {
  targetUser: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

// --- 더미 데이터 (1:1 대화 예시) ---
const initialPrivateMessages: ChatMessage[] = [
  {
    id: "p1",
    senderName: "엘리스",
    content: "안녕하세요. 아까 단체 채팅에서 문의하셨던 내용이 있으셨죠?",
    isMyMessage: false,
    senderId: "user-alice",
  },
  {
    id: "p2",
    senderName: "닉네임",
    content: "네 맞아요. 혹시 이 근처에 주차할 곳이 있을까요?",
    isMyMessage: true,
    senderId: "user-me",
  },
  {
    id: "p3",
    senderName: "엘리스",
    content: "건물 뒤편 주차장을 이용하시면 2시간 무료 주차가 가능합니다!",
    isMyMessage: false,
    senderId: "user-alice",
  },
];

const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  targetUser,
  onClose,
}) => {
  // 1:1 채팅 상태 관리
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialPrivateMessages
  );

  // 메시지 전송 핸들러
  const handleSendMessage = (message: string) => {
    console.log(`1:1 메시지 전송 to ${targetUser.name}:`, message);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: "닉네임",
      content: message,
      isMyMessage: true,
      senderId: "user-me",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // 상대방 더미 응답 (잠시 후)
    setTimeout(() => {
      const reply: ChatMessage = {
        id: Date.now().toString() + "-reply",
        senderName: targetUser.name,
        content: "네, 알겠습니다! 좋은 하루 보내세요. 😊",
        isMyMessage: false,
        senderId: targetUser.id,
      };
      setMessages((prevMessages) => [...prevMessages, reply]);
    }, 1500);
  };

  // ChatMessageList에서 프로필 클릭 시 동작 (1:1 모달에서는 별도 동작 없음)
  const handleProfileClick = (
    _senderId: string,
    _senderName: string,
    _event: React.MouseEvent<HTMLDivElement>
  ) => {
    console.log("1:1 채팅에서는 프로필 팝업을 띄우지 않습니다.");
  };

  // 리스트 배경 클릭 시 동작 (1:1 모달에서는 아무런 팝업도 없으므로 기능 없음)
  const handleListClick = () => {
    console.log("1:1 채팅 리스트 배경 클릭: 동작 없음");
  };

  return (
    // 오버레이
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 font-sans transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative flex h-[60vh] w-[80%] flex-col rounded-xl bg-white shadow-2xl md:h-[70vh] md:w-[50%] lg:w-[40%] xl:w-[30%] max-w-lg overflow-hidden transition-all duration-300 transform scale-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-10 shadow-sm bg-white sticky top-0 bg-[#6E4213]">
          <h2 className="text-xl font-bold">
            {targetUser.name} 님과의 1:1 대화
          </h2>
          {/* 모달 닫기 버튼 */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-1 rounded-full hover:bg-white/10 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <ChatMessageList
          messages={messages}
          onProfileClick={handleProfileClick}
          onListClick={handleListClick}
        />

        <ChatMessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default PrivateChatModal;
