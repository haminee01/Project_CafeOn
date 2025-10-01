// src/components/chat/ChatRoomList.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ChatRoomItem from "./ChatRoomItem";

interface ChatRoom {
  id: string;
  cafeName: string;
  lastMessage: string;
  isUnread: boolean;
}

const dummyChatRooms: ChatRoom[] = [
  {
    id: "1",
    cafeName: "문래 마이스페이스 6",
    lastMessage: "안녕하세요, 궁금한 점 있으신가요?",
    isUnread: true,
  },
  {
    id: "2",
    cafeName: "루프트 커피",
    lastMessage: "이번 주말 영업시간 알려주세요.",
    isUnread: false,
  },
  {
    id: "3",
    cafeName: "앤트러사이트 서교",
    lastMessage: "네, 예약 가능합니다.",
    isUnread: false,
  },
];

const ChatRoomList: React.FC = () => {
  const router = useRouter();

  const handleRoomClick = (roomId: string) => {
    router.push(`/mypage/chats/${roomId}`);
  };

  return (
    <div className="w-full">
      <h1 className="p-4 text-2xl font-bold border-b border-gray-200">
        채팅방 목록
      </h1>
      {dummyChatRooms.map((room) => (
        <ChatRoomItem
          key={room.id}
          cafeName={room.cafeName}
          lastMessage={room.lastMessage}
          isUnread={room.isUnread}
          onClick={() => handleRoomClick(room.id)}
        />
      ))}
    </div>
  );
};

export default ChatRoomList;
