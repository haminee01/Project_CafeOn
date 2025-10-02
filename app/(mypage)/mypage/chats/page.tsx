// mypage/chats/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
interface UserProfile {
  id: string;
  name: string;
}

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

const DUMMY_PROFILES: { [key: string]: UserProfile } = {
  // ...
  "user-me": { id: "user-me", name: "닉네임" },
  "user-alice": { id: "user-alice", name: "엘리스" },
  "user-study": { id: "user-study", name: "스터디 리더" },
  "user-code": { id: "user-code", name: "코드 봇" },
  "user-test1": { id: "user-test1", name: "테스터1" },
  "user-test2": { id: "user-test2", name: "테스터2" },
  "user-test3": { id: "user-test3", name: "테스터3" },
};

const dummyChatRooms = [
  {
    id: "cafe-1",
    cafeName: "문래 마이스페이스 6",
    lastMessage: "궁금한 점을 말씀해주세요! 메뉴는...",
    isUnread: true,
    messages: [
      /*...*/
    ] as ChatMessage[],
    participants: [
      /*...*/
    ],
  },
  {
    id: "cafe-2",
    cafeName: "강남 스터디룸",
    lastMessage: "이번 주말 영업시간 알려주세요.",
    isUnread: false,
    messages: [
      /*...*/
    ] as ChatMessage[],
    participants: [
      /*...*/
    ],
  },
  {
    id: "group-3",
    cafeName: "코드 리뷰방",
    lastMessage: "PR 올려두었습니다.",
    isUnread: false,
    messages: [
      /*...*/
    ] as ChatMessage[],
    participants: [
      /*...*/
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

  const handleRoomClick = (roomId: string) => {
    router.push(`/mypage/chats/${roomId}`);
  };

  return (
    <div className="w-full bg-white h-full overflow-y-auto">
      <h1 className="p-4 text-2xl font-bold border-b border-[#CDCDCD] text-gray-800">
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

const ChatListPage = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <ChatRoomList />
    </div>
  );
};

export default ChatListPage;
