"use client";

import React, { useState, useCallback, useRef } from "react";
import { usePrivateChatFlow } from "@/hooks/usePrivateChatFlow";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";
import ChatSidebar from "./ChatSidebar";
import PrivateChatModal from "./PrivateChatModal";
import ProfileMiniPopup from "../common/ProfileMiniPopup";
import ProfileIcon from "./ProfileIcon";
import {
  ChatMessage,
  UserProfile,
  Participant,
  ProfileClickHandler,
} from "@/types/chat";

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
    content:
      "이 카페 정보에 대해 궁금한 게 있어요. 혹시 영업 시간이나 메뉴에 대해 알려주실 수 있나요?",
    isMyMessage: true,
    senderId: "user-me",
  },
  {
    id: "5",
    senderName: "엘리스",
    content:
      "궁금한 점을 말씀해주세요! 메뉴는 아메리카노 4,500원부터 시작하고, 영업 시간은 매일 오전 10시부터 오후 9시까지입니다.",
    isMyMessage: false,
    senderId: "user-alice",
  },
];

const DUMMY_PROFILES: { [key: string]: UserProfile } = {
  "user-me": { id: "user-me", name: "닉네임" },
  "user-alice": { id: "user-alice", name: "엘리스" },
  "user-sunwon": { id: "user-sunwon", name: "Sunwon903" },
  "user-test1": { id: "user-test1", name: "테스터1" },
  "user-test2": { id: "user-test2", name: "테스터2" },
  "user-test3": { id: "user-test3", name: "테스터3" },
};

const dummyParticipants: Participant[] = Object.values(DUMMY_PROFILES);

interface CafeChatModalProps {
  cafeName?: string;
  onClose: () => void;
}

const CafeChatModal: React.FC<CafeChatModalProps> = ({
  cafeName = "문래 마이스페이스 6",
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialDummyMessages);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 1. 알림 상태를 관리하는 State 추가 (기본값: 켜짐)
  const [isNotificationOn, setIsNotificationOn] = useState(true);

  // Modal Box DOM을 참조하여 팝업 위치를 상대적으로 계산하기 위해 사용
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    targetUserForPopup,
    popupPosition,
    targetUserForPrivateChat,
    handleProfileClick,
    handleStartPrivateChat,
    closePrivateChatModal,
    closePopup,
  } = usePrivateChatFlow(
    DUMMY_PROFILES,
    modalRef as React.RefObject<HTMLElement>
  );

  // 사이드바 닫기
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // 미니 팝업 닫기 핸들러 (usePrivateChatFlow의 closePopup 재사용)
  // 모달 오버레이 클릭 핸들러: 미니 팝업 닫기 + 사이드바 닫기
  const handleModalOverlayClick = () => {
    closePopup();
    closeSidebar();
  };

  // 메시지 리스트 영역 클릭 핸들러: 미니 팝업만 닫기
  const handleListClick = () => {
    closePopup();
  };

  // 그룹 채팅 메시지 전송 핸들러
  const handleSendMessage = (message: string) => {
    console.log("메시지 전송:", message);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: "닉네임",
      content: message,
      isMyMessage: true,
      senderId: "user-me",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // 2. 알림 상태를 토글하는 Handler 추가
  const handleToggleNotification = () => {
    setIsNotificationOn((prev) => !prev);
  };

  // 사이드바 내 프로필 클릭 시 동작 (handleProfileClick 재사용)
  const handleSidebarProfileClick = (
    user: Participant,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (user.id !== "user-me") {
      handleProfileClick(
        user.id,
        user.name,
        event as unknown as React.MouseEvent<HTMLElement>
      );
      closeSidebar();
    }
  };

  return (
    // 오버레이 (클릭 시 모든 팝업/사이드바 닫기)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans"
      onClick={handleModalOverlayClick}
    >
      {/* Modal Box (단체 채팅방) */}
      <div
        ref={modalRef}
        className="modal-box relative flex h-[70vh] w-[90%] flex-col rounded-xl bg-white shadow-2xl md:h-[80vh] md:w-[60%] lg:h-[75vh] lg:w-1/2 xl:w-1/3 max-w-lg overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-20 shadow-sm bg-white sticky top-0">
          <h2 className="text-xl font-bold text-gray-800">{cafeName}</h2>
          <div className="flex items-center space-x-2">
            {/* 참여자 수 표시 */}
            <span className="text-sm font-medium text-gray-600 px-3 py-1 rounded-full bg-amber-50">
              <span className="inline-block mr-1">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="user"
                  className="w-4 h-4 inline-block align-text-top"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
                  />
                </svg>
              </span>
              {dummyParticipants.length}
            </span>

            {/* 사이드바 토글 버튼 (햄버거 메뉴) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closePopup();
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
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-150"
            >
              {/* 3. 모달 닫기 아이콘 */}
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

        {/* Chat Messages List (usePrivateChatFlow의 핸들러 전달) */}
        <ChatMessageList
          messages={messages}
          onProfileClick={handleProfileClick}
          onListClick={handleListClick}
        />

        {/* Chat Input (분리된 컴포넌트 사용) */}
        <ChatMessageInput onSendMessage={handleSendMessage} />

        {/* 사이드바 */}
        {isSidebarOpen && (
          <ChatSidebar
            participants={dummyParticipants}
            currentUserId="user-me"
            isNotificationOn={isNotificationOn}
            onToggleNotification={handleToggleNotification}
            onClose={closeSidebar}
            onProfileClick={handleSidebarProfileClick}
            onLeave={() => console.log("나가기")}
            title="참여자 목록"
            subtitle="대화 상대"
          />
        )}

        <ProfileMiniPopup
          targetUserForPopup={targetUserForPopup}
          popupPosition={popupPosition}
          handleStartPrivateChat={handleStartPrivateChat}
          closePopup={closePopup}
        />
      </div>

      {/* 1:1 채팅 모달 (PrivateChatModal) - usePrivateChatFlow의 상태 사용 */}
      {targetUserForPrivateChat && (
        <PrivateChatModal
          targetUser={targetUserForPrivateChat}
          onClose={closePrivateChatModal}
        />
      )}
    </div>
  );
};

export default CafeChatModal;
