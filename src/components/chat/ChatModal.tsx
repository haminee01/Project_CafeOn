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

// 더미 데이터 (ChatModal에서 사용)
const initialDummyMessages: ChatMessage[] = [
  {
    id: "2",
    senderName: "엘리스",
    content: "안녕하세요. 채팅에 오신 것을 환영합니다.",
    isMyMessage: false,
    senderId: "user-alice",
  },
  {
    id: "3",
    senderName: "닉네임",
    content: "네, 안녕하세요.",
    isMyMessage: true,
    senderId: "user-me",
  },
  {
    id: "4",
    senderName: "닉네임",
    content: "이 카페 정보에 대해 궁금한 게 있어요.",
    isMyMessage: true,
    senderId: "user-me",
  },
  {
    id: "5",
    senderName: "엘리스",
    content: "궁금한 점을 말씀해주세요!",
    isMyMessage: false,
    senderId: "user-alice",
  },
];

interface ChatModalProps {
  cafeName: string;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ cafeName, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialDummyMessages);

  // 1:1 채팅방 열기 상태를 관리합니다. (프로필 클릭 시 팝업 띄우기용)
  const [targetUser, setTargetUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);

    // 새 메시지 객체 생성 (현재는 더미, 실제로는 서버에 전송)
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: "닉네임",
      content: message,
      isMyMessage: true,
      senderId: "user-me",
    };

    // 메시지 리스트에 추가
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // ChatMessageList에서 전달받은 프로필 클릭 핸들러
  const handleProfileClick = (senderId: string, senderName: string) => {
    // 프로필 클릭 시 1:1 대화하기 버튼 관련 로직을 여기에 구현 (예: 미니 팝업 또는 새로운 모달 오픈)
    console.log(`Profile clicked: ${senderName} (${senderId})`);

    // 간단히 사용자 정보를 State에 저장하여 버튼 등을 띄울 수 있습니다.
    // 여기서는 예시로 콘솔에만 출력합니다.
    setTargetUser({ id: senderId, name: senderName });
    // 실제 구현에서는 여기에 setTargetUser(null) 대신 1:1 채팅 모달을 띄우는 코드가 들어갈 수 있습니다.

    // 이 예시에서는 다른 모달을 띄우는 대신, 프로필 클릭 정보를 저장하는 것으로 대체합니다.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Box */}
      <div className="relative flex h-[70vh] w-[90%] flex-col rounded-xl bg-white shadow-2xl md:h-[80vh] md:w-[60%] lg:h-[75vh] lg:w-1/2 xl:w-1/3 max-w-lg">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 p-4 bg-amber-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-amber-900">{cafeName}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-amber-900 hover:text-amber-700 p-1 rounded-full hover:bg-amber-100 transition duration-150"
            >
              {/* Close Icon (X) */}
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
            <button className="text-amber-900 hover:text-amber-700 p-1 rounded-full hover:bg-amber-100 transition duration-150">
              {/* Menu Icon (Hamburger) */}
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
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <ChatMessageList
          messages={messages}
          onProfileClick={handleProfileClick}
        />

        {/* Chat Input */}
        <ChatMessageInput onSendMessage={handleSendMessage} />

        {/* 프로필 클릭 시 나타나는 미니 팝업 (1:1 대화하기 버튼 대체) */}
        {targetUser && (
          <div className="absolute top-16 left-4 p-3 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
            <p className="font-semibold mb-2">
              {targetUser.name} 님과 대화하시겠습니까?
            </p>
            <button
              onClick={() => {
                console.log(`Starting 1:1 chat with ${targetUser.name}`);
                setTargetUser(null);
              }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              1:1 대화하기
            </button>
            <button
              onClick={() => setTargetUser(null)}
              className="mt-1 w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
