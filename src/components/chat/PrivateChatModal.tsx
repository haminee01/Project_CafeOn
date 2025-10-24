"use client";

import React, { useState, useEffect } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";
import ChatSidebar from "./ChatSidebar";
import { useDmChat } from "../../hooks/useDmChat";
import { useAuth } from "../../hooks/useAuth";

interface PrivateChatModalProps {
  targetUser: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  targetUser,
  onClose,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 현재 사용자 정보 가져오기
  const { user } = useAuth();
  const currentUserId = user?.id || "user-me";

  // 1:1 채팅 훅 사용
  const {
    roomId,
    isJoined,
    isLoading,
    error,
    participants,
    participantCount,
    messages,
    chatHistory,
    hasMoreHistory,
    isLoadingHistory,
    isMuted,
    stompConnected,
    joinChat,
    leaveChat,
    sendMessage,
    refreshParticipants,
    loadMoreHistory,
    toggleMute,
    markAsRead,
  } = useDmChat({
    counterpartId: targetUser.id,
    counterpartName: targetUser.name,
  });

  // 컴포넌트 마운트 시 자동으로 채팅방 참여
  useEffect(() => {
    console.log("=== PrivateChatModal 마운트, joinChat 호출 ===", {
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      isJoined,
      isLoading,
      error,
    });

    // 이미 참여 중이거나, 로딩 중이거나, 에러가 있으면 재시도하지 않음
    if (!isJoined && !isLoading && !error) {
      joinChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  // 사이드바 닫기 핸들러
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 알림 상태를 토글하는 Handler
  const handleToggleNotification = () => {
    toggleMute();
  };

  // 메시지 전송 핸들러
  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  // 1:1 채팅에서는 프로필 클릭 시 팝업 미사용
  const handleProfileClick = (
    _senderId: string,
    _senderName: string,
    _event: React.MouseEvent<any>
  ) => {
    closeSidebar(); // 혹시 모를 상황에 대비하여 사이드바 닫기
  };

  // 메시지 리스트 영역 클릭 핸들러: 사이드바만 닫기
  const handleListClick = () => {
    closeSidebar();
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

  // 채팅방이 열릴 때는 읽음 처리하지 않음 (사용자가 실제로 메시지를 볼 때만 처리)

  // 새 메시지가 도착할 때 자동 읽음 처리는 제거 (사용자가 스크롤할 때만 처리)

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
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">1:1 채팅방을 생성하는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-2">1:1 채팅 시작 실패</h2>
              <p className="text-gray-600 mb-2">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                올바른 사용자 ID가 필요합니다.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 정상 채팅 화면 */}
        {!isLoading && !error && (
          <>
            {/* Header */}
            <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-10 shadow-sm bg-white sticky top-0 bg-[#6E4213]">
              <h2 className="text-xl font-bold text-gray-900">
                {targetUser.name} 님과의 1:1 대화
              </h2>
              <div className="flex items-center space-x-2">
                {/* 사이드바 토글 버튼 (햄버거 메뉴) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarOpen((prev) => !prev);
                  }}
                  className="text-gray-900 p-2 rounded-full transition duration-150"
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="bars"
                    className="w-5 h-5"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path
                      fill="currentColor"
                      d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
                    ></path>
                  </svg>
                </button>

                {/* 닫기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-gray-900 p-2 rounded-full transition duration-150"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
              onMarkAsRead={markAsRead}
              roomId={roomId || undefined}
            />

            <ChatMessageInput onSendMessage={handleSendMessage} />

            {/* 사이드바 */}
            {isSidebarOpen && (
              <ChatSidebar
                participants={participants}
                currentUserId={currentUserId}
                isNotificationOn={!isMuted}
                onToggleNotification={handleToggleNotification}
                onClose={closeSidebar}
                onProfileClick={() => {}} // 1:1 채팅에서는 별도 동작 없음
                onLeave={() => {
                  leaveChat();
                  onClose();
                }}
                title="참여자 목록"
                subtitle="참여자"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrivateChatModal;
