"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { usePrivateChatFlow } from "@/hooks/usePrivateChatFlow";
import { useCafeChat } from "@/hooks/useCafeChat";
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

interface CafeChatModalProps {
  cafeId: string;
  cafeName?: string;
  onClose: () => void;
}

const CafeChatModal: React.FC<CafeChatModalProps> = ({
  cafeId,
  cafeName = "문래 마이스페이스 6",
  onClose,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(true);

  // Modal Box DOM을 참조하여 팝업 위치를 상대적으로 계산하기 위해 사용
  const modalRef = useRef<HTMLDivElement>(null);

  // 카페 채팅 API 훅 사용
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
  } = useCafeChat({ cafeId, cafeName });

  // roomId 로깅 추가
  useEffect(() => {
    console.log("CafeChatModal - roomId 변경됨:", roomId);
  }, [roomId]);

  // 참여자 프로필을 UserProfile 형태로 변환
  const userProfiles: { [key: string]: UserProfile } = participants.reduce(
    (acc, participant) => {
      acc[participant.id] = { id: participant.id, name: participant.name };
      return acc;
    },
    {} as { [key: string]: UserProfile }
  );

  const {
    targetUserForPopup,
    popupPosition,
    targetUserForPrivateChat,
    handleProfileClick,
    handleStartPrivateChat,
    closePrivateChatModal,
    closePopup,
  } = usePrivateChatFlow(
    userProfiles,
    modalRef as React.RefObject<HTMLElement>
  );

  // 컴포넌트 마운트 시 채팅방 참여 (한 번만 실행)
  useEffect(() => {
    if (cafeId && !isJoined && !isLoading) {
      joinChat();
    }
  }, [cafeId]); // cafeId가 변경될 때만 실행

  // 채팅방 참여 성공 시 모달 내에서 채팅 시작
  useEffect(() => {
    if (roomId && isJoined) {
      console.log("채팅방 참여 성공, 모달 내에서 채팅 시작:", roomId);
      // 딥링크로 이동하지 않고 모달 내에서 채팅 계속
    }
  }, [roomId, isJoined]);

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
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      await sendMessage(message);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    }
  };

  // 2. 알림 상태를 토글하는 Handler 추가
  const handleToggleNotification = async () => {
    try {
      await toggleMute();
    } catch (err) {
      console.error("알림 토글 실패:", err);
    }
  };

  // 사이드바 내 프로필 클릭 시 동작 (handleProfileClick 재사용)
  const handleSidebarProfileClick = (
    user: Participant,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    // 현재 사용자 ID를 가져와야 함 (실제로는 인증된 사용자 ID 사용)
    const currentUserId = "user-me"; // TODO: 실제 사용자 ID로 교체

    if (user.id !== currentUserId) {
      handleProfileClick(
        user.id,
        user.name,
        event as unknown as React.MouseEvent<HTMLElement>
      );
      closeSidebar();
    }
  };

  // 채팅방 나가기 핸들러
  const handleLeaveChat = async () => {
    try {
      await leaveChat();
      onClose(); // 모달도 닫기
    } catch (err) {
      console.error("채팅방 나가기 실패:", err);
    }
  };

  // 로딩 상태 처리
  if (isLoading && !isJoined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            <span className="text-gray-700">채팅방 참여 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리 ("이미 참여 중" 또는 중복 키 에러는 제외)
  const isAlreadyParticipatingError =
    error?.includes("이미 채팅방에 참여 중입니다.") ||
    error?.includes("Duplicate entry") ||
    error?.includes("uk_crm_room_user") ||
    error?.includes("chat_room_members");

  if (error && !isAlreadyParticipatingError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              오류 발생
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={joinChat}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition duration-200"
              >
                다시 시도
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
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
              {participantCount}
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

        {/* Chat Messages List (실제 채팅 히스토리 표시) */}
        <ChatMessageList
          messages={messages}
          chatHistory={chatHistory}
          hasMoreHistory={hasMoreHistory}
          isLoadingHistory={isLoadingHistory}
          onProfileClick={handleProfileClick}
          onListClick={handleListClick}
          onLoadMoreHistory={loadMoreHistory}
        />

        {/* Chat Input (분리된 컴포넌트 사용) */}
        <ChatMessageInput onSendMessage={handleSendMessage} />

        {/* 사이드바 */}
        {isSidebarOpen && (
          <ChatSidebar
            participants={participants}
            currentUserId="user-me" // TODO: 실제 사용자 ID로 교체
            isNotificationOn={!isMuted}
            onToggleNotification={handleToggleNotification}
            onClose={closeSidebar}
            onProfileClick={handleSidebarProfileClick}
            onLeave={handleLeaveChat}
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
