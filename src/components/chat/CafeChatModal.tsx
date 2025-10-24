"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCafeChat } from "../../hooks/useCafeChat";
import ChatMessageList from "../chat/ChatMessageList";
import ChatMessageInput from "../chat/ChatMessageInput";
import ChatSidebar from "../chat/ChatSidebar";
import PrivateChatModal from "./PrivateChatModal";
import ProfileMiniPopup from "../common/ProfileMiniPopup";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { usePrivateChatFlow } from "../../hooks/usePrivateChatFlow";
import { useAuth } from "../../hooks/useAuth";

interface CafeChatModalProps {
  cafeId: string;
  cafeName?: string;
  onClose: () => void;
}

const CafeChatModal: React.FC<CafeChatModalProps> = ({
  cafeId,
  cafeName = "문래 마이스페이스",
  onClose,
}) => {
  useEscapeKey(onClose);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // 현재 사용자 정보 가져오기
  const { user } = useAuth();
  const currentUserId = user?.id || "user-me";

  // 카페 채팅 훅 사용
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
    joinChat,
    leaveChat,
    sendMessage,
    refreshParticipants,
    loadMoreHistory,
    toggleMute,
    markAsRead,
  } = useCafeChat({
    cafeId,
    cafeName,
  });

  // usePrivateChatFlow 훅 사용 (참여자 목록 전달)
  const {
    targetUserForPopup,
    popupPosition,
    targetUserForPrivateChat,
    handleProfileClick,
    handleStartPrivateChat,
    closePrivateChatModal,
    closePopup,
  } = usePrivateChatFlow({}, modalRef, participants);

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

  // 메시지 리스트 영역 클릭 핸들러: 사이드바와 팝업 닫기
  const handleListClick = () => {
    closeSidebar();
    closePopup();
  };

  // 모달 오버레이 클릭 핸들러: 사이드바 닫기 + 팝업 닫기 + 모달 닫기
  const handleModalOverlayClick = () => {
    closeSidebar();
    closePopup();
    onClose();
  };

  // 사이드바 내 프로필 클릭 핸들러
  const handleSidebarProfileClick = (
    user: { id: string; name: string },
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    handleProfileClick(user.id, user.name, event);
    closeSidebar();
  };

  // 채팅방이 열릴 때는 읽음 처리하지 않음 (사용자가 실제로 메시지를 볼 때만 처리)

  // 새 메시지가 도착할 때 자동 읽음 처리는 제거 (사용자가 스크롤할 때만 처리)

  // roomId가 null인 경우 에러 처리
  if (!roomId && !isLoading && isJoined) {
    console.error("CafeChatModal - roomId가 null입니다:", {
      roomId,
      cafeId,
      isJoined,
      isLoading,
      error,
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">채팅방 정보 오류</h2>
            <p className="text-gray-600 mb-4">
              채팅방 정보를 불러올 수 없습니다. 다시 시도해주세요.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              카페 ID: {cafeId}, 상태: {isJoined ? "참여됨" : "미참여"}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                다시 시도
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // 오버레이
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 font-sans transition-opacity duration-300"
      onClick={handleModalOverlayClick} // 오버레이 클릭 시 모든 팝업/사이드바/모달 닫기
    >
      <div
        ref={modalRef}
        className="relative flex h-[70vh] w-[90%] flex-col rounded-xl bg-white shadow-2xl md:h-[80vh] md:w-[70%] lg:h-[75vh] lg:w-[60%] xl:w-[50%] max-w-4xl overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">채팅방에 참여하는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-2">오류 발생</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 정상 채팅 화면 */}
        {!isLoading && !error && (
          <>
            {/* Header */}
            <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-10 shadow-sm bg-white sticky top-0">
              <h2 className="text-xl font-bold text-gray-900">
                {cafeName} 채팅방
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
              chatHistory={chatHistory}
              hasMoreHistory={hasMoreHistory}
              isLoadingHistory={isLoadingHistory}
              onLoadMoreHistory={loadMoreHistory}
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
                onProfileClick={handleSidebarProfileClick}
                onLeave={() => {
                  leaveChat();
                  onClose();
                }}
                title="참여자 목록"
                subtitle="참여자"
              />
            )}

            {/* 프로필 미니 팝업 */}
            {targetUserForPopup && popupPosition && (
              <ProfileMiniPopup
                targetUserForPopup={targetUserForPopup}
                popupPosition={popupPosition}
                handleStartPrivateChat={handleStartPrivateChat}
                closePopup={closePopup}
              />
            )}
          </>
        )}
      </div>

      {/* 1:1 채팅 모달 */}
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
