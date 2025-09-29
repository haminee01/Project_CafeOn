"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

// 더미 메시지 데이터
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

// 현재 채팅방 참여자 더미 데이터
const dummyParticipants = [
  { id: "user-me", name: "닉네임" },
  { id: "user-alice", name: "엘리스" },
  { id: "user-sunwon", name: "Sunwon903" },
  { id: "user-test1", name: "테스터1" },
  { id: "user-test2", name: "테스터2" },
  { id: "user-test3", name: "테스터3" },
];

interface ChatModalProps {
  cafeName: string;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  cafeName = "문래 마이스페이스 6",
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialDummyMessages);

  // 사이드바(참여자 목록) 열림 상태 관리 (기본값 false: 닫힘 상태)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1:1 채팅방 열기 팝업 상태 관리
  const [targetUser, setTargetUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 팝업 위치(x, y 좌표) 저장
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: "닉네임",
      content: message,
      isMyMessage: true,
      senderId: "user-me",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const closePopup = () => {
    setTargetUser(null);
    setPopupPosition(null);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 모달 오버레이 클릭 핸들러: 미니 팝업 닫기 + 사이드바 닫기
  const handleModalOverlayClick = () => {
    closePopup();
    closeSidebar();
  };

  // ChatMessageList에서 전달받은 프로필 클릭 핸들러
  const handleProfileClick = (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (senderId === "user-me") {
      closePopup();
      return;
    }
    if (targetUser && targetUser.id === senderId) {
      closePopup();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    // X 좌표: 프로필 이미지의 오른쪽 끝에서 약간의 여백(8px)을 추가
    const x = rect.right + 8;
    // Y 좌표: 프로필 이미지의 중앙에 맞추기 위해 높이의 절반을 뺌
    const y = rect.top + rect.height / 2 - 10;

    setTargetUser({ id: senderId, name: senderName });
    setPopupPosition({ x, y });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleModalOverlayClick} // 오버레이 클릭 시 팝업/사이드바 모두 닫기
    >
      {/* Modal Box */}
      <div
        className="relative flex h-[70vh] w-[90%] flex-col rounded-xl bg-white shadow-2xl md:h-[80vh] md:w-[60%] lg:h-[75vh] lg:w-1/2 xl:w-1/3 max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-20">
          <h2 className="text-xl font-bold">{cafeName}</h2>
          <div className="flex items-center space-x-4">
            {/* 모달 닫기 버튼 */}
            <button
              onClick={onClose}
              className="text-amber-900 hover:text-amber-700 p-1 rounded-full hover:bg-amber-100 transition duration-150"
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
            {/* 사이드바 토글 버튼 (햄버거 메뉴) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closePopup(); // 미니 팝업 닫기
                setIsSidebarOpen((prev) => !prev); // 사이드바 토글
              }}
              className="text-amber-900 hover:text-amber-700 p-1 rounded-full hover:bg-amber-100 transition duration-150"
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

        {/* 사이드바 (참여자 목록) UI */}
        {/* 사이드바 배경 오버레이 (사이드바가 열렸을 때) */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-20 z-30"
            onClick={closeSidebar} // 오버레이 클릭 시 사이드바 닫기
          />
        )}

        <div
          // translate-x-full(숨김) translate-x-0(표시)
          className={`absolute inset-y-0 right-0 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full border-l border-gray-200">
            {/* 사이드바 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">참여자 목록</h3>
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
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
            </div>

            {/* 참여자 목록 */}
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-sm font-semibold mb-3 text-gray-600">
                대화 상대 ({dummyParticipants.length})
              </p>
              <div className="space-y-3">
                {dummyParticipants.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-md transition duration-150"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      {/* User Icon Placeholder */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a1.5 1.5 0 011.892-1.892L16.5 17.25M17.25 12a5.25 5.25 0 00-10.5 0h10.5z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">
                      {user.name} {user.id === "user-me" ? "(나)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="p-4 mt-auto border-t flex space-x-2">
              <button className="w-full px-4 py-2 bg-[#6E4213] text-white rounded-lg shadow-md hover:bg-[#8d5e33] transition">
                알림끄기
              </button>
              <button className="w-full px-4 py-2 bg-gray-300 text-[#6E4213] rounded-lg shadow-md hover:bg-gray-400 transition">
                나가기
              </button>
            </div>
          </div>
        </div>

        {/* 프로필 클릭 시 나타나는 미니 팝업 */}

        {targetUser && popupPosition && (
          <div
            className="fixed p-3 bg-white border border-gray-300 rounded-lg shadow-xl z-50"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold mb-2 text-sm whitespace-nowrap">
              {targetUser.name} 님과 대화하시겠습니까?
            </p>
            <button
              onClick={() => {
                console.log(`Starting 1:1 chat with ${targetUser.name}`);
                closePopup();
              }}
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
        )}
      </div>
    </div>
  );
};

export default ChatModal;
