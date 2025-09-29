"use client";

import React, { useState, useCallback } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatMessageInput from "./ChatMessageInput";
import PrivateChatModal from "./PrivateChatModal";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

interface Participant {
  id: string;
  name: string;
}

interface ProfileClickHandler {
  (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLDivElement>
  ): void;
}

// --- 더미 데이터 ---
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

// 현재 채팅방 참여자 더미 데이터
const dummyParticipants: Participant[] = [
  { id: "user-me", name: "닉네임" },
  { id: "user-alice", name: "엘리스" },
  { id: "user-sunwon", name: "Sunwon903" },
  { id: "user-test1", name: "테스터1" },
  { id: "user-test2", name: "테스터2" },
  { id: "user-test3", name: "테스터3" },
];

// 프로필 아이콘 플레이스홀더 헬퍼 컴포넌트
const ProfileIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
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
);

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

  // 미니 팝업 상태 (1:1 대화 시작 전 '대화하시겠습니까?' 팝업)
  const [targetUserForPopup, setTargetUserForPopup] =
    useState<Participant | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 1:1 채팅 모달 상태 (이 값이 채워지면 PrivateChatModal이 렌더링됨)
  const [targetUserForPrivateChat, setTargetUserForPrivateChat] =
    useState<Participant | null>(null);

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

  // 미니 팝업 닫기
  const closePopup = useCallback(() => {
    setTargetUserForPopup(null);
    setPopupPosition(null);
  }, []);

  // 사이드바 닫기
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // 1:1 채팅 모달 닫기
  const closePrivateChatModal = useCallback(() => {
    setTargetUserForPrivateChat(null);
  }, []);

  // 모달 오버레이 클릭 핸들러: 미니 팝업 닫기 + 사이드바 닫기
  const handleModalOverlayClick = () => {
    closePopup();
    closeSidebar();
  };

  // 메시지 리스트 영역 클릭 핸들러: 미니 팝업만 닫기
  const handleListClick = () => {
    closePopup();
  };

  // 프로필 클릭 핸들러 (미니 팝업 열기)
  const handleProfileClick: ProfileClickHandler = (
    senderId,
    senderName,
    event
  ) => {
    event.stopPropagation();

    if (senderId === "user-me") {
      closePopup();
      return;
    }

    if (targetUserForPopup && targetUserForPopup.id === senderId) {
      closePopup();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const modalBox = event.currentTarget.closest(".modal-box") as HTMLElement;

    // 모달 박스 내부에서의 상대적인 위치 계산
    const modalRect = modalBox.getBoundingClientRect();

    // X 좌표: 프로필 이미지의 오른쪽 끝(modal 기준) + 약간의 여백(8px)을 추가
    const x = rect.right + 8 - modalRect.left;
    // Y 좌표: 프로필 이미지의 중앙(modal 기준)을 기준으로 팝업 중앙 정렬
    const y = rect.top + rect.height / 2 - modalRect.top;

    setTargetUserForPopup({ id: senderId, name: senderName });
    setPopupPosition({ x, y });
    closeSidebar();
  };

  // 1:1 대화 시작 버튼 클릭 핸들러 (미니 팝업에서 호출)
  const handleStartPrivateChat = (user: Participant) => {
    closePopup(); // 미니 팝업 닫기
    setTargetUserForPrivateChat(user); // 1:1 채팅 모달 열기
  };

  return (
    // 오버레이 (클릭 시 모든 팝업/사이드바 닫기)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans"
      onClick={handleModalOverlayClick}
    >
      {/* Modal Box (단체 채팅방) */}
      <div
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
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 inline-block align-text-top"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a1.5 1.5 0 011.892-1.892L16.5 17.25M17.25 12a5.25 5.25 0 00-10.5 0h10.5z"
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
              className="text-amber-900 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition duration-150"
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

            {/* 모달 닫기 버튼 */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-150"
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

        {/* Chat Messages List (분리된 컴포넌트 사용) */}
        <ChatMessageList
          messages={messages}
          onProfileClick={handleProfileClick}
          onListClick={handleListClick}
        />

        {/* Chat Input (분리된 컴포넌트 사용) */}
        <ChatMessageInput onSendMessage={handleSendMessage} />

        {/* 사이드바 (참여자 목록) 오버레이 */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-20 z-30"
            onClick={closeSidebar}
          />
        )}

        {/* 사이드바 본체 */}
        <div
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

            {/* 참여자 목록 리스트 */}
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-sm font-semibold mb-3 text-gray-600">
                대화 상대 ({dummyParticipants.length})
              </p>
              <div className="space-y-3">
                {dummyParticipants.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-2 rounded-md transition duration-150 ${
                      user.id !== "user-me"
                        ? "cursor-pointer hover:bg-gray-100"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (user.id !== "user-me") {
                        // 사이드바 내에서 프로필 클릭 시 미니 팝업 열기
                        handleProfileClick(
                          user.id,
                          user.name,
                          e as unknown as React.MouseEvent<HTMLDivElement>
                        );
                        closeSidebar();
                      }
                    }}
                  >
                    <ProfileIcon />
                    <span className="font-medium text-gray-800">
                      {user.name} {user.id === "user-me" ? "(나)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="p-4 mt-auto border-t flex space-x-2">
              <button className="w-full px-4 py-2 bg-[#8d5e33] text-white rounded-lg shadow-md hover:bg-[#6E4213] transition text-sm">
                알림끄기
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-[#6E4213] rounded-lg shadow-md hover:bg-gray-300 transition text-sm">
                나가기
              </button>
            </div>
          </div>
        </div>

        {/* 프로필 클릭 시 나타나는 미니 팝업 (모달 박스 내부 상대 위치) */}
        {targetUserForPopup && popupPosition && (
          <div
            className="absolute p-3 bg-white border border-gray-300 rounded-lg shadow-xl z-50 transform -translate-y-1/2"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold mb-2 text-sm whitespace-nowrap text-gray-800">
              {targetUserForPopup.name} 님과 대화하시겠습니까?
            </p>
            <button
              onClick={() => handleStartPrivateChat(targetUserForPopup)}
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

      {/* 1:1 채팅 모달 (PrivateChatModal) */}
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
