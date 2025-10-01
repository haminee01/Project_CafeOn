// src/app/mypage/chats/[chatId]/page.tsx
"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

interface UserProfile {
  id: string;
  name: string;
}

interface PopupPosition {
  x: number;
  y: number;
}

interface ProfileClickHandler {
  (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLElement>
  ): void;
}

type Participant = UserProfile;

const DUMMY_PROFILES: { [key: string]: UserProfile } = {
  "user-me": { id: "user-me", name: "닉네임" },
  "user-alice": { id: "user-alice", name: "엘리스" },
  "user-study": { id: "user-study", name: "스터디 리더" },
  "user-code": { id: "user-code", name: "코드 봇" },
  "user-test1": { id: "user-test1", name: "테스터1" },
  "user-test2": { id: "user-test2", name: "테스터2" },
  "user-test3": { id: "user-test3", name: "테스터3" },
};

const DUMMY_CHAT_ROOMS = [
  {
    id: "cafe-1",
    cafeName: "문래 마이스페이스 6",
    lastMessage: "궁금한 점을 말씀해주세요! 메뉴는...",
    isUnread: true,
    messages: [
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
    ] as ChatMessage[],
    participants: [
      DUMMY_PROFILES["user-me"],
      DUMMY_PROFILES["user-alice"],
      DUMMY_PROFILES["user-test1"],
      DUMMY_PROFILES["user-test2"],
      DUMMY_PROFILES["user-test3"],
    ],
  },
  {
    id: "cafe-2",
    cafeName: "강남 스터디룸",
    lastMessage: "이번 주말 영업시간 알려주세요.",
    isUnread: false,
    messages: [
      {
        id: "10",
        senderName: "스터디 리더",
        content: "안녕하세요! 스터디룸 관련 문의 환영합니다.",
        isMyMessage: false,
        senderId: "user-study",
      },
      {
        id: "11",
        senderName: "닉네임",
        content: "이번 주말 이용 가능한가요? 영업시간이 궁금합니다.",
        isMyMessage: true,
        senderId: "user-me",
      },
      {
        id: "12",
        senderName: "스터디 리더",
        content:
          "주말에는 오전 9시부터 오후 11시까지 운영하며, 예약은 필수입니다.",
        isMyMessage: false,
        senderId: "user-study",
      },
    ] as ChatMessage[],
    participants: [DUMMY_PROFILES["user-me"], DUMMY_PROFILES["user-study"]], // 2명으로 가정
  },
  {
    id: "group-3",
    cafeName: "코드 리뷰방",
    lastMessage: "PR 올려두었습니다.",
    isUnread: false,
    messages: [
      {
        id: "20",
        senderName: "코드 봇",
        content: "PR이 머지되었습니다.",
        isMyMessage: false,
        senderId: "user-code",
      },
      {
        id: "21",
        senderName: "닉네임",
        content: "PR 올려두었습니다. 확인 부탁드립니다.",
        isMyMessage: true,
        senderId: "user-me",
      },
    ] as ChatMessage[],
    participants: [
      DUMMY_PROFILES["user-me"],
      DUMMY_PROFILES["user-code"],
      DUMMY_PROFILES["user-test1"],
    ],
  },

  {
    id: "private-4",
    cafeName: "닉네임 (1:1)",
    lastMessage: "개인 메시지 전송...",
    isUnread: false,
    messages: [] as ChatMessage[],
    participants: [DUMMY_PROFILES["user-me"]],
  },
];

const getChatRoomData = (chatId: string) => {
  return (
    DUMMY_CHAT_ROOMS.find((room) => room.id === chatId) || DUMMY_CHAT_ROOMS[0]
  );
};

// 2. 훅 정의 (usePrivateChatFlow)
const usePrivateChatFlow = (allUsers: { [key: string]: UserProfile }) => {
  const [targetUserForPopup, setTargetUserForPopup] =
    useState<UserProfile | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(
    null
  );
  const [targetUserForPrivateChat, setTargetUserForPrivateChat] =
    useState<UserProfile | null>(null);

  const handleProfileClick: ProfileClickHandler = useCallback(
    (senderId, senderName, event) => {
      event.stopPropagation();
      if (senderId === DUMMY_PROFILES["user-me"].id) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;

      setTargetUserForPopup({ id: senderId, name: senderName });
      setPopupPosition({ x: x, y: y });
    },
    []
  );

  const closePopup = useCallback(() => {
    setTargetUserForPopup(null);
    setPopupPosition(null);
  }, []);

  const handleStartPrivateChat = useCallback(
    (user: UserProfile) => {
      closePopup();
      setTargetUserForPrivateChat(user);
    },
    [closePopup]
  );

  const closePrivateChatModal = useCallback(() => {
    setTargetUserForPrivateChat(null);
  }, []);

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

// 3. 통합된 컴포넌트 정의

// 3.1 ProfileIcon
const ProfileIcon: React.FC<{ size?: string }> = ({ size = "w-8 h-8" }) => (
  <div
    className={`${size} rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0`}
  >
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="user"
      className="w-5 h-5 text-gray-600"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <path
        fill="currentColor"
        d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
      />
    </svg>
  </div>
);

// 3.2 ChatRoomList
const ChatRoomList: React.FC<{
  activeRoomId: string;
  onRoomClick: (roomId: string) => void;
}> = ({ activeRoomId, onRoomClick }) => {
  return (
    <div className="w-full bg-white">
      <h1 className="p-4 text-2xl font-bold border-b border-gray-200 text-gray-800">
        채팅방 목록
      </h1>
      {DUMMY_CHAT_ROOMS.map((room) => (
        <div
          key={room.id}
          className={`
            ${
              room.id === activeRoomId
                ? "bg-[#F5F5F5] border-r-4 border-[#6E4213]"
                : ""
            }
            p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition duration-150
          `}
          onClick={() => onRoomClick(room.id)}
        >
          <div className="flex items-start">
            <ProfileIcon size="w-12 h-12" />
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3
                  className={`text-base font-semibold truncate ${
                    room.id === activeRoomId
                      ? "text-[#6E4213]"
                      : "text-gray-800"
                  }`}
                >
                  {room.cafeName}
                </h3>
                {room.isUnread && (
                  <span className="w-2 h-2 ml-2 bg-red-500 rounded-full flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 truncate mt-1">
                {room.lastMessage}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
interface ChatMessageListProps {
  messages: ChatMessage[];
  onProfileClick: ProfileClickHandler;
  onListClick: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  onProfileClick,
  onListClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MessageBubble: React.FC<{
    message: ChatMessage;
    onProfileClick: ProfileClickHandler;
  }> = ({ message, onProfileClick }) => {
    const bubbleClass = message.isMyMessage
      ? "bg-[#6E4213] text-white self-end rounded-br-none"
      : "bg-gray-100 text-gray-800 self-start rounded-tl-none";

    const alignmentClass = message.isMyMessage
      ? "justify-end"
      : "justify-start";

    return (
      <div className={`flex w-full mb-4 ${alignmentClass} group`}>
        {/* 상대방 메시지일 경우에만 프로필 표시 */}
        {!message.isMyMessage && (
          <div
            className="mr-3 cursor-pointer flex-shrink-0"
            onClick={(e) =>
              onProfileClick(message.senderId, message.senderName, e)
            }
            role="button"
            aria-label={`${message.senderName} 프로필 보기`}
          >
            <ProfileIcon />
          </div>
        )}
        <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg`}>
          {/* 상대방 메시지일 경우에만 이름 표시 */}
          {!message.isMyMessage && (
            <span className="text-sm font-semibold mb-1 text-gray-600">
              {message.senderName}
            </span>
          )}
          <div
            className={`p-3 rounded-xl shadow-sm break-words whitespace-pre-wrap ${bubbleClass}`}
          >
            {message.content}
          </div>
        </div>
        {/* 내 메시지일 경우 아이콘 없이 공간만 확보 (메시지 배치 정렬 목적) */}
        {message.isMyMessage && <div className="ml-3 w-8 h-8 flex-shrink-0" />}
      </div>
    );
  };

  return (
    <div
      className="p-4 flex flex-col flex-grow overflow-y-auto"
      onClick={onListClick}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onProfileClick={onProfileClick}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// 3.3 ChatMessageInput
interface ChatMessageInputProps {
  onSendMessage: (message: string) => void;
  className?: string;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
  className,
}) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setInputMessage("");
    }
  };

  return (
    <div className={`p-4 border-t border-gray-200 bg-white ${className}`}>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-grow p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4213] transition"
          aria-label="채팅 메시지 입력"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="px-4 py-3 bg-[#6E4213] text-white rounded-xl font-semibold shadow-md hover:bg-[#5a360f] transition disabled:bg-gray-400"
        >
          전송
        </button>
      </form>
    </div>
  );
};

// 3.4 PrivateChatModal (변경 없음)
interface PrivateChatModalProps {
  targetUser: UserProfile;
  onClose: () => void;
}

const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  targetUser,
  onClose,
}) => {
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderName: targetUser.name,
      content: `${targetUser.name} 님과의 1:1 대화가 시작되었습니다.`,
      isMyMessage: false,
      senderId: targetUser.id,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [privateMessages]);

  const handleSendPrivateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputMessage.trim();
    if (message) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderName: "닉네임",
        content: message,
        isMyMessage: true,
        senderId: "user-me",
      };
      setPrivateMessages((prev) => [...prev, newMessage]);
      setInputMessage(""); // 답장 시뮬레이션

      setTimeout(() => {
        setPrivateMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-r",
            senderName: targetUser.name,
            content: `${targetUser.name} 님의 자동 응답: "${message}"라고 하셨군요.`,
            isMyMessage: false,
            senderId: targetUser.id,
          },
        ]);
      }, 1000);
    }
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isMyMessage = message.isMyMessage;
    const bubbleClass = isMyMessage
      ? "bg-[#FFEEC7] text-[#6E4213] self-end rounded-br-none"
      : "bg-gray-100 text-gray-800 self-start rounded-tl-none";
    const alignmentClass = isMyMessage ? "justify-end" : "justify-start";

    return (
      <div className={`flex w-full mb-3 ${alignmentClass}`}>
        <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg`}>
          <div
            className={`p-3 rounded-xl shadow-sm break-words whitespace-pre-wrap ${bubbleClass}`}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col w-11/12 max-w-lg h-3/4 max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-[#6E4213]">
            {targetUser.name} 님과 1:1 대화
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            aria-label="1:1 대화 닫기"
          >
            {/* 닫기 버튼 아이콘 */}
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
        {/* 메시지 리스트 */}
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto">
          {privateMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
        {/* 입력 창 */}
        <form
          onSubmit={handleSendPrivateMessage}
          className="p-4 border-t flex space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="개인 메시지 전송..."
            className="flex-grow p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4213] transition"
            aria-label="1:1 채팅 메시지 입력"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-4 py-3 bg-[#6E4213] text-white rounded-xl font-semibold shadow-md hover:bg-[#5a360f] transition disabled:bg-gray-400"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. 메인 컴포넌트
interface ChatDetailIntegratedProps {
  params: {
    chatId: string;
  };
}

/**
 * URL: /mypage/chats/[chatId]
 * 역할: 채팅 목록과 상세 화면을 나란히 보여줍니다.
 */
const ChatDetailIntegratedPage: React.FC<ChatDetailIntegratedProps> = ({
  params,
}) => {
  // 1. URL의 chatId를 초기 상태로 사용
  const initialChatId = params.chatId;

  // 2. 현재 활성화된 채팅방 ID 상태 관리
  const [activeChatId, setActiveChatId] = useState(initialChatId);

  // 3. 현재 활성화된 채팅방 데이터 계산 (activeChatId가 변경될 때마다 재계산)
  const activeRoomData = useMemo(
    () => getChatRoomData(activeChatId),
    [activeChatId]
  );

  // 4. 채팅방 데이터와 상태 분리
  const cafeName = activeRoomData.cafeName;
  const dummyParticipants = activeRoomData.participants;
  const [messages, setMessages] = useState<ChatMessage[]>(
    activeRoomData.messages
  );

  // 5. activeChatId가 변경될 때마다 messages 상태 업데이트
  useEffect(() => {
    setMessages(activeRoomData.messages);
  }, [activeChatId, activeRoomData.messages]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(true);

  const {
    targetUserForPopup,
    popupPosition,
    targetUserForPrivateChat,
    handleProfileClick,
    handleStartPrivateChat,
    closePrivateChatModal,
    closePopup,
  } = usePrivateChatFlow(DUMMY_PROFILES);

  // --- 핸들러 수정/추가 ---
  const handleRoomClick = useCallback((roomId: string) => {
    setActiveChatId(roomId);
    console.log(`채팅방 이동: /mypage/chats/${roomId} (Active ID 변경)`);
  }, []);

  // 사이드바 닫기
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // 메시지 리스트 영역 클릭 핸들러: 미니 팝업만 닫기
  const handleListClick = () => {
    closePopup();
  };

  // 그룹 채팅 메시지 전송 핸들러
  const handleSendMessage = (message: string) => {
    console.log(`[${cafeName}] 메시지 전송:`, message);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: "닉네임",
      content: message,
      isMyMessage: true,
      senderId: "user-me",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // 실제로는 activeRoomData의 lastMessage도 업데이트해야 하지만, 여기서는 로직 생략
  };

  // 알림 상태를 토글하는 Handler
  const handleToggleNotification = () => {
    setIsNotificationOn((prev) => !prev);
  };

  // 사이드바 내 프로필 클릭 시 동작 (변경 없음)
  const handleSidebarProfileClick = (
    user: Participant,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (user.id !== "user-me") {
      const rect = event.currentTarget.getBoundingClientRect();

      const fakeEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }),
        },
        stopPropagation: () => {},
      } as unknown as React.MouseEvent<HTMLElement>;

      handleProfileClick(user.id, user.name, fakeEvent);
      closeSidebar();
    }
  };

  // 전체 영역 클릭 시 팝업 및 사이드바 닫기
  const handleOutsideClick = () => {
    closePopup();
    closeSidebar();
  };

  return (
    // 전체 컨테이너: 채팅 목록(왼쪽) + 상세 채팅(오른쪽)
    <div
      className="flex h-screen w-full overflow-hidden"
      onClick={handleOutsideClick}
    >
      <aside
        className="w-80 flex-shrink-0 border-r border-gray-200 h-full overflow-y-auto bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <ChatRoomList
          activeRoomId={activeChatId}
          onRoomClick={handleRoomClick}
        />
      </aside>
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <header className="flex items-center justify-between border-gray-200 p-4 rounded-t-xl z-20 shadow-md bg-white sticky top-0 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 truncate max-w-[calc(100%-120px)]">
            {cafeName} (ID: {activeChatId})
          </h2>
          <div className="flex items-center space-x-2">
            {/* 참여자 수 표시 */}
            <span className="text-sm font-medium text-gray-600 px-3 py-1 rounded-full bg-amber-50 flex items-center">
              <ProfileIcon size="w-4 h-4" />
              <span className="ml-1">{dummyParticipants.length}</span>
            </span>
            {/* 사이드바 토글 버튼 (햄버거 메뉴) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closePopup();
                setIsSidebarOpen((prev) => !prev);
              }}
              className="text-gray-600 p-2 rounded-full transition duration-150 hover:bg-gray-100"
              aria-label="참여자 목록 열기"
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
          </div>
        </header>
        <div
          className="relative flex-grow overflow-y-auto"
          onClick={handleListClick}
        >
          {/* Chat Messages List */}
          <ChatMessageList
            messages={messages}
            onProfileClick={handleProfileClick as ProfileClickHandler}
            onListClick={handleListClick}
          />
          {/* 1. 유저 프로필 팝업 (변경 없음) */}
          {targetUserForPopup && popupPosition && (
            <div
              className="fixed z-50 rounded-lg bg-white p-4 shadow-xl border border-gray-100 min-w-[200px]"
              style={{
                top: popupPosition.y,
                left: popupPosition.x,
                transform: "translate(-50%, calc(-100% - 10px))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                {targetUserForPopup.name} 님
              </h3>
              <p className="text-sm mb-4 text-gray-600">
                1:1 대화를 시작하시겠습니까?
              </p>
              <button
                onClick={() => handleStartPrivateChat(targetUserForPopup)}
                className="w-full rounded-xl bg-[#6E4213] p-3 font-bold text-white transition hover:bg-[#5a360f] shadow-md"
              >
                1:1 대화 시작
              </button>
            </div>
          )}
        </div>
        {/* 메시지 입력 창 */}
        <ChatMessageInput
          onSendMessage={handleSendMessage}
          className="flex-shrink-0"
        />
        {/* 사이드바 영역 */}
        {/* 사이드바 오버레이 */}
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
              <h3 className="text-lg font-bold text-gray-800">참여자 목록</h3>
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                aria-label="참여자 목록 닫기"
              >
                {/* 닫기 버튼 아이콘 (생략) */}
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
                    className={`flex items-center space-x-3 p-2 rounded-xl transition duration-150 ${
                      user.id !== "user-me"
                        ? "cursor-pointer hover:bg-amber-50"
                        : "bg-gray-100"
                    }`}
                    onClick={(e) =>
                      handleSidebarProfileClick(
                        user,
                        e as unknown as React.MouseEvent<HTMLDivElement>
                      )
                    }
                    role={user.id !== "user-me" ? "button" : "status"}
                    aria-label={
                      user.id !== "user-me"
                        ? `${user.name}에게 1:1 대화 요청`
                        : "나 자신"
                    }
                  >
                    <ProfileIcon />
                    <span className="font-medium text-gray-800">
                      {user.name}
                      {user.id === "user-me" ? "(나)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* 하단 액션 버튼 */}
            <div className="p-4 mt-auto border-t flex flex-col space-y-2 flex-shrink-0">
              {/* 알림 토글 버튼 (생략) */}
              <button
                onClick={handleToggleNotification}
                className={`w-full px-4 py-3 rounded-xl shadow-sm transition text-sm font-semibold flex items-center justify-center ${
                  isNotificationOn
                    ? "bg-[#6E4213] text-white"
                    : "bg-[#999999] text-white"
                }`}
                aria-label={isNotificationOn ? "알림 끄기" : "알림 켜기"}
              >
                {isNotificationOn ? "알림 끄기" : "알림 켜기"}
              </button>
              {/* 나가기 버튼 */}
              <button className="w-full px-4 py-3 bg-[#CDCDCD] text-white rounded-xl shadow-sm hover:bg-red-600 transition text-sm font-semibold">
                채팅방 나가기
              </button>
            </div>
          </div>
        </div>
        {/* 2. 1:1 채팅 모달 */}
        {targetUserForPrivateChat && (
          <PrivateChatModal
            targetUser={targetUserForPrivateChat}
            onClose={closePrivateChatModal}
          />
        )}
      </main>
    </div>
  );
};

export default ChatDetailIntegratedPage;
