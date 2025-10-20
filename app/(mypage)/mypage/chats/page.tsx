// mypage/chats/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUnreadNotifications, NotificationResponse } from "@/api/chat";

interface ChatRoom {
  id: string;
  cafeName: string;
  lastMessage: string;
  isUnread: boolean;
  createdAt: string;
}

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
  cafeName: string;
  lastMessage: string;
  isUnread: boolean;
  onClick: () => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  cafeName,
  lastMessage,
  isUnread,
  onClick,
}) => {
  return (
    <div
      className={`
        p-4 border-b border-[#CDCDCD] hover:bg-gray-50 cursor-pointer transition duration-150
      `}
      onClick={onClick}
    >
      <div className="flex items-start">
        <ProfileIcon size="w-12 h-12" />
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex justify-between items-center">
            {/* isSelected에 따른 텍스트 색상 변경 로직도 제거했습니다. */}
            <h3 className={`text-base font-semibold truncate text-gray-800`}>
              {cafeName}
            </h3>
            {isUnread && (
              <span className="w-2 h-2 ml-2 bg-red-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate mt-1">{lastMessage}</p>
        </div>
      </div>
    </div>
  );
};

const ChatRoomList: React.FC = () => {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 알림 데이터를 채팅방 데이터로 변환하는 함수
  const convertNotificationsToChatRooms = (
    notifications: NotificationResponse[]
  ): ChatRoom[] => {
    return notifications.map((notification) => ({
      id: notification.roomId,
      cafeName: notification.title,
      lastMessage: notification.preview,
      isUnread: !notification.read,
      createdAt: notification.createdAt,
    }));
  };

  // 채팅방 목록 로드
  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("채팅방 목록 로드 시작");
      const notifications = await getUnreadNotifications();
      console.log("알림 목록 응답:", notifications);

      const rooms = convertNotificationsToChatRooms(notifications);
      setChatRooms(rooms);

      console.log("채팅방 목록 로드 완료:", rooms);
    } catch (err) {
      console.error("채팅방 목록 로드 실패:", err);
      setError("채팅방 목록을 불러올 수 없습니다.");
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/mypage/chats/${roomId}`);
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

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
            onClick={loadChatRooms}
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
            key={room.id}
            cafeName={room.cafeName}
            lastMessage={room.lastMessage}
            isUnread={room.isUnread}
            onClick={() => handleRoomClick(room.id)}
          />
        ))
      )}
    </div>
  );
};

const ChatListPage = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <ChatRoomList />
    </div>
  );
};

export default ChatListPage;
