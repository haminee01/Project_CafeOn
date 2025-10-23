// usePrivateChatFlow.ts

import React, { useState, useCallback } from "react";

interface UserProfile {
  id: string;
  name: string;
}

interface ProfileClickHandler {
  (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLElement>
  ): void;
}

interface ChatFlowState {
  targetUserForPopup: UserProfile | null;
  popupPosition: { x: number; y: number } | null;
  targetUserForPrivateChat: UserProfile | null;
}

interface ChatFlowActions extends ChatFlowState {
  handleProfileClick: ProfileClickHandler;
  handleStartPrivateChat: (user: UserProfile) => void;
  closePrivateChatModal: () => void;
  closePopup: () => void;
}

export const usePrivateChatFlow = (
  DUMMY_PROFILES: { [key: string]: UserProfile },
  relativeRef?: React.RefObject<HTMLElement | null>
): ChatFlowActions => {
  // 1. 프로필 팝업 관련 상태
  const [targetUserForPopup, setTargetUserForPopup] =
    useState<UserProfile | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 2. 1:1 채팅 모달 관련 상태
  const [targetUserForPrivateChat, setTargetUserForPrivateChat] =
    useState<UserProfile | null>(null);

  // 미니 팝업 닫기
  const closePopup = useCallback(() => {
    setTargetUserForPopup(null);
    setPopupPosition(null);
  }, []);

  // 1:1 채팅 모달 닫기
  const closePrivateChatModal = useCallback(() => {
    setTargetUserForPrivateChat(null);
  }, []);

  // 1:1 대화 시작 버튼 클릭 핸들러 (미니 팝업에서 호출)
  const handleStartPrivateChat = useCallback(
    (user: UserProfile) => {
      closePopup(); // 미니 팝업 닫기
      setTargetUserForPrivateChat(user); // 1:1 채팅 모달 열기
    },
    [closePopup]
  );

  // 프로필 클릭 핸들러 (미니 팝업 열기)
  const handleProfileClick: ProfileClickHandler = useCallback(
    (senderId, senderName, event) => {
      event.stopPropagation();

      if (senderId === "user-me") {
        closePopup();
        return;
      }

      const userProfile = DUMMY_PROFILES[senderId] || {
        id: senderId,
        name: senderName,
      };

      // 이미 열려있는데 다시 클릭하면 닫기
      if (targetUserForPopup && targetUserForPopup.id === senderId) {
        closePopup();
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      let x = event.clientX;
      let y = event.clientY;

      // CafeChatModal처럼 모달 박스 내부 상대 위치로 계산해야 할 경우
      if (relativeRef && relativeRef.current) {
        const modalRect = relativeRef.current.getBoundingClientRect();
        x = rect.right + 8 - modalRect.left;
        y = rect.top + rect.height / 2 - modalRect.top;
      } else {
        x = event.clientX;
        y = event.clientY;
      }

      setTargetUserForPopup(userProfile);
      setPopupPosition({ x, y });
    },
    [closePopup, targetUserForPopup, DUMMY_PROFILES, relativeRef]
  );

  return {
    targetUserForPopup,
    popupPosition,
    targetUserForPrivateChat,
    handleProfileClick,
    handleStartPrivateChat,
    closePrivateChatModal,
    closePopup,
  };
};
