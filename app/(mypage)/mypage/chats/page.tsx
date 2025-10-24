// mypage/chats/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyChatRooms } from "../../../../src/lib/api";
import { MyChatRoom, MyChatRoomsResponse } from "../../../../src/types/chat";
import { useCafeChat } from "../../../../src/hooks/useCafeChat";
import { useDmChat } from "../../../../src/hooks/useDmChat";
import ChatMessageList from "../../../../src/components/chat/ChatMessageList";
import ChatMessageInput from "../../../../src/components/chat/ChatMessageInput";
import ChatSidebar from "../../../../src/components/chat/ChatSidebar";
import ProfileMiniPopup from "../../../../src/components/common/ProfileMiniPopup";
import { useEscapeKey } from "../../../../src/hooks/useEscapeKey";
import { usePrivateChatFlow } from "../../../../src/hooks/usePrivateChatFlow";
import { useAuth } from "../../../../src/hooks/useAuth";

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

interface ChatRoomItemProps {
  room: MyChatRoom;
  isActive: boolean;
  onClick: () => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={`
        ${isActive ? "bg-[#F5F5F5] border-r-4 border-[#6E4213]" : ""}
        p-4 border-b border-[#CDCDCD] hover:bg-gray-50 cursor-pointer transition duration-150
      `}
      onClick={onClick}
    >
      <div className="flex items-start">
        <ProfileIcon size="w-12 h-12" />
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3
              className={`text-base font-semibold truncate ${
                isActive ? "text-[#6E4213]" : "text-gray-800"
              }`}
            >
              {room.displayName}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {room.memberCount}명
              </span>
              {room.unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {room.unreadCount > 99 ? "99+" : room.unreadCount}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 truncate mt-1">
            {room.lastMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

const ChatRoomList: React.FC<{
  chatRooms: MyChatRoom[];
  activeRoomId: number | null;
  onRoomClick: (roomId: number) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}> = ({ chatRooms, activeRoomId, onRoomClick, isLoading, error, onRetry }) => {
  return (
    <div className="w-full bg-white h-full overflow-y-auto">
      <h1 className="p-4 text-2xl font-bold border-b border-[#CDCDCD] text-gray-800">
        채팅방 목록
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">채팅방 목록을 불러오는 중...</div>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : chatRooms.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">참여 중인 채팅방이 없습니다.</div>
        </div>
      ) : (
        chatRooms.map((room) => (
          <ChatRoomItem
            key={room.roomId}
            room={room}
            isActive={activeRoomId === room.roomId}
            onClick={() => onRoomClick(room.roomId)}
          />
        ))
      )}
    </div>
  );
};

const ChatRoomView: React.FC<{
  activeRoom: MyChatRoom | null;
  onLeaveRoom: () => void;
}> = ({ activeRoom, onLeaveRoom }) => {
  // 채팅방 타입에 따라 다른 훅 사용
  const isGroupChat = activeRoom?.type === "GROUP";
  const isDmChat = activeRoom?.type === "PRIVATE";

  // 카페 단체 채팅 훅 (type이 GROUP인 경우)
  const cafeChat = useCafeChat({
    cafeId: activeRoom?.cafeId?.toString() || "",
    cafeName: activeRoom?.displayName || "",
  });

  // 1:1 채팅 훅 (type이 PRIVATE인 경우)
  // PRIVATE 채팅의 경우 counterpartId를 사용 (roomId가 아님)
  const dmChat = useDmChat({
    counterpartId:
      activeRoom?.counterpartId?.toString() ||
      activeRoom?.roomId?.toString() ||
      "",
    counterpartName: activeRoom?.displayName || "",
  });

  // 현재 활성화된 채팅 데이터 선택
  const currentChat = isGroupChat ? cafeChat : isDmChat ? dmChat : null;

  // 채팅방이 선택되면 자동으로 참여
  useEffect(() => {
    if (
      activeRoom &&
      currentChat &&
      !currentChat.isJoined &&
      !currentChat.isLoading
    ) {
      console.log("채팅방 자동 참여 시도:", {
        roomId: activeRoom.roomId,
        type: activeRoom.type,
        displayName: activeRoom.displayName,
      });
      currentChat.joinChat();
    }
  }, [activeRoom, currentChat]);

  if (!activeRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            채팅방을 선택해주세요
          </h2>
          <p className="text-gray-500">
            왼쪽에서 채팅방을 클릭하여 대화를 시작하세요
          </p>
        </div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            채팅방을 불러올 수 없습니다
          </h2>
          <p className="text-gray-500">채팅방 정보가 올바르지 않습니다</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (message: string) => {
    if (currentChat) {
      try {
        await currentChat.sendMessage(message);
      } catch (error) {
        console.error("메시지 전송 실패:", error);
      }
    }
  };

  const handleProfileClick = (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    // 프로필 클릭 시 동작 (1:1 채팅 시작 등)
    console.log("프로필 클릭:", { senderId, senderName });
  };

  const handleListClick = () => {
    // 메시지 리스트 클릭 시 동작
  };

  const handleLeaveChat = async () => {
    if (currentChat && window.confirm("정말로 이 채팅방을 나가시겠습니까?")) {
      try {
        await currentChat.leaveChat();
        // 채팅방 나가기 성공 시 목록에서 제거
        onLeaveRoom();
      } catch (error) {
        console.error("채팅방 나가기 실패:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 채팅방 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <ProfileIcon size="w-10 h-10" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {activeRoom.displayName}
            </h2>
            <p className="text-sm text-gray-500">
              {activeRoom.memberCount}명 참여 중
              {currentChat.stompConnected && (
                <span className="ml-2 text-green-500">● 연결됨</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {currentChat.isMuted ? (
            <span className="text-xs text-gray-500">🔕 알림 끔</span>
          ) : (
            <span className="text-xs text-gray-500">🔔 알림 켜짐</span>
          )}
          <button
            onClick={handleLeaveChat}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="채팅방 나가기"
          >
            나가기
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        {currentChat.isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">메시지를 불러오는 중...</div>
          </div>
        ) : currentChat.error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="text-red-500 mb-2">{currentChat.error}</div>
              <p className="text-gray-500">채팅방에 연결할 수 없습니다</p>
            </div>
          </div>
        ) : (
          <ChatMessageList
            messages={currentChat.messages}
            onProfileClick={handleProfileClick}
            onListClick={handleListClick}
          />
        )}
      </div>

      {/* 메시지 입력 */}
      <ChatMessageInput
        onSendMessage={handleSendMessage}
        disabled={currentChat.isLoading || !currentChat.stompConnected}
      />
    </div>
  );
};

const ChatListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatRooms, setChatRooms] = useState<MyChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [activeRoom, setActiveRoom] = useState<MyChatRoom | null>(null);

  // 채팅방 목록 로드
  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("채팅방 목록 로드 시작");
      const response: MyChatRoomsResponse = await getMyChatRooms();
      setChatRooms(response.data.content);
      console.log("채팅방 목록 로드 완료:", response.data.content);
    } catch (err) {
      console.error("채팅방 목록 로드 실패:", err);
      setError(
        err instanceof Error ? err.message : "채팅방 목록을 불러올 수 없습니다."
      );
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomClick = (roomId: number) => {
    setActiveRoomId(roomId);
    const room = chatRooms.find((r) => r.roomId === roomId);
    setActiveRoom(room || null);

    // 선택된 채팅방의 읽지 않은 메시지 개수를 0으로 업데이트
    if (room && room.unreadCount > 0) {
      setChatRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.roomId === roomId ? { ...r, unreadCount: 0 } : r
        )
      );
    }

    // URL에 선택된 채팅방 ID 추가 (새로고침 시 상태 유지)
    const params = new URLSearchParams(searchParams);
    params.set("room", roomId.toString());
    router.replace(`/mypage/chats?${params.toString()}`, { scroll: false });
  };

  // URL 파라미터에서 채팅방 ID 읽기
  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (roomParam && chatRooms.length > 0) {
      const roomId = parseInt(roomParam);
      const room = chatRooms.find((r) => r.roomId === roomId);
      if (room) {
        setActiveRoomId(roomId);
        setActiveRoom(room);
      }
    }
  }, [searchParams, chatRooms]);

  useEffect(() => {
    loadChatRooms();

    // 주기적으로 채팅방 목록 새로고침 (5초마다)
    const interval = setInterval(() => {
      // 현재 활성화된 채팅방이 있으면 읽지 않은 메시지 개수만 업데이트
      if (activeRoomId) {
        loadChatRooms();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeRoomId]);

  return (
    <div className="flex h-screen w-full bg-white">
      {/* 채팅방이 선택되지 않은 경우: 목록만 전체 화면에 표시 */}
      {!activeRoom ? (
        <div className="w-full h-full overflow-y-auto bg-white">
          <ChatRoomList
            chatRooms={chatRooms}
            activeRoomId={activeRoomId}
            onRoomClick={handleRoomClick}
            isLoading={isLoading}
            error={error}
            onRetry={loadChatRooms}
          />
        </div>
      ) : (
        <>
          {/* 채팅방이 선택된 경우: 왼쪽 목록 + 오른쪽 채팅방 */}
          <aside className="w-80 flex-shrink-0 border-r border-gray-200 h-full overflow-y-auto bg-white">
            <ChatRoomList
              chatRooms={chatRooms}
              activeRoomId={activeRoomId}
              onRoomClick={handleRoomClick}
              isLoading={isLoading}
              error={error}
              onRetry={loadChatRooms}
            />
          </aside>

          {/* 오른쪽: 채팅방 */}
          <main className="flex-1 flex flex-col h-full bg-white">
            <ChatRoomView
              activeRoom={activeRoom}
              onLeaveRoom={() => {
                setActiveRoom(null);
                setActiveRoomId(null);
              }}
            />
          </main>
        </>
      )}
    </div>
  );
};

export default ChatListPage;
