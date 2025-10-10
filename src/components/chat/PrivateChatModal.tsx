"use client";

import React, { useState } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";
import ChatSidebar from "./ChatSidebar";
import ProfileIcon from "./ProfileIcon";
import { ChatMessage, UserProfile, Participant } from "@/types/chat";

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
  // 사이드바 상태 추가
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 1. 알림 상태를 관리하는 State 추가 (기본값: 켜짐)
  const [isNotificationOn, setIsNotificationOn] = useState(true);

  // 현재 사용자 정의 (더미)
  const myProfile: UserProfile = { id: "user-me", name: "닉네임" };
  const dummyParticipants: Participant[] = [myProfile, targetUser];

  // 사이드바 닫기 핸들러
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 2. 알림 상태를 토글하는 Handler 추가
  const handleToggleNotification = () => {
    setIsNotificationOn((prev) => !prev);
  };

  // 메시지 전송 핸들러 (기존 로직 유지)
  const handleSendMessage = (message: string) => {
    console.log(`1:1 메시지 전송 to ${targetUser.name}:`, message);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: myProfile.name,
      content: message,
      isMyMessage: true,
      senderId: myProfile.id,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // 상대방 더미 응답 (잠시 후)
    setTimeout(() => {
      const reply: ChatMessage = {
        id: Date.now().toString() + "-reply",
        senderName: targetUser.name,
        content: "네, 알겠습니다! 좋은 하루 보내세요.",
        isMyMessage: false,
        senderId: targetUser.id,
      };
      setMessages((prevMessages) => [...prevMessages, reply]);
    }, 1500);
  };

  // 1:1 채팅에서는 프로필 클릭 시 팝업 미사용
  const handleProfileClick = (
    _senderId: string,
    _senderName: string,
    _event: React.MouseEvent<any>
  ) => {
    console.log("1:1 채팅에서는 프로필 팝업을 띄우지 않습니다.");
    closeSidebar(); // 혹시 모를 상황에 대비하여 사이드바 닫기
  };

  // 메시지 리스트 영역 클릭 핸들러: 사이드바만 닫기
  const handleListClick = () => {
    closeSidebar();
    console.log("1:1 채팅 리스트 배경 클릭: 사이드바 닫기");
  };

  // 모달 오버레이 클릭 핸들러: 사이드바 닫기 + 모달 닫기
  const handleModalOverlayClick = () => {
    closeSidebar();
    onClose();
  };

  // 사이드바 내 프로필 클릭 핸들러 (별도 동작 없이 사이드바 닫기)
  const handleSidebarProfileClick = () => {
    closeSidebar();
  };

  return (
    // 오버레이
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 font-sans transition-opacity duration-300"
      onClick={handleModalOverlayClick} // 오버레이 클릭 시 모든 팝업/사이드바/모달 닫기
    >
      <div
        className="relative flex h-[60vh] w-[80%] flex-col rounded-xl bg-white shadow-2xl md:h-[70vh] md:w-[50%] lg:w-[40%] xl:w-[30%] max-w-lg overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-10 shadow-sm bg-white sticky top-0 bg-[#6E4213]">
          <h2 className="text-xl font-bold text-gray-600">
            {targetUser.name} 님과의 1:1 대화
          </h2>
          <div className="flex items-center space-x-2">
            {/* 사이드바 토글 버튼 (햄버거 메뉴) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen((prev) => !prev);
              }}
              className="text-gray-600 p-2 rounded-full transition duration-150"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="bars"
                className="h-6 w-6"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  fill="currentColor"
                  d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
                />
              </svg>
            </button>

            {/* 모달 닫기 버튼 */}
            <button
              onClick={onClose}
              className="text-gray-600 p-1 rounded-full transition duration-150"
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
        </header>

        {/* ChatMessageList: onListClick prop 추가 및 onProfileClick 전달 */}
        <ChatMessageList
          messages={messages}
          onProfileClick={handleProfileClick}
          onListClick={handleListClick}
        />

        <ChatMessageInput onSendMessage={handleSendMessage} />

        {/* 사이드바 */}
        {isSidebarOpen && (
          <ChatSidebar
            participants={dummyParticipants}
            currentUserId={myProfile.id}
            isNotificationOn={isNotificationOn}
            onToggleNotification={handleToggleNotification}
            onClose={closeSidebar}
            onProfileClick={() => {}} // 1:1 채팅에서는 별도 동작 없음
            onLeave={() => console.log("나가기")}
            title="대화 상세 정보"
            subtitle="참여자"
          />
        )}
      </div>
    </div>
  );
};

export default PrivateChatModal;
