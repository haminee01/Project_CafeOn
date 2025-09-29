"use client";

import React from "react";

// 임시 채팅방 데이터 구조
const mockChatrooms = [
  {
    id: 1,
    cafeName: "북촌 한옥마을 조용한 카페",
    lastMessage: "안녕하세요, 자리 있나요?",
    lastSentTime: "오후 3:30",
    unreadCount: 2,
    isOwner: false,
    partnerName: "카페 주인장 (운영자)",
  },
  {
    id: 2,
    cafeName: "강남역 24시간 스터디 카페",
    lastMessage: "주차장 이용은 어떻게 해야 하나요?",
    lastSentTime: "어제",
    unreadCount: 0,
    isOwner: true,
    partnerName: "김이름",
  },
  {
    id: 3,
    cafeName: "테마가 독특한 이색 카페",
    lastMessage: "곧 방문할게요! 감사합니다.",
    lastSentTime: "2025/09/20",
    unreadCount: 1,
    isOwner: false,
    partnerName: "박지성",
  },
];

/**
 * 단일 채팅방 목록 항목 컴포넌트
 */
const ChatroomItem = ({ room }: { room: (typeof mockChatrooms)[0] }) => {
  const MessageIcon = () => <span className="text-gray-500 text-2xl">💬</span>;
  const ArrowRightIcon = () => <span className="text-gray-400">▶</span>;

  const handleChatClick = () => {
    // 실제 환경에서는 채팅방 상세 페이지로 이동
    console.log(`${room.cafeName} 채팅방으로 이동`);
  };

  return (
    <div
      className="flex items-center p-4 bg-white border-b border-gray-100 cursor-pointer hover:bg-amber-50 transition-colors duration-200"
      onClick={handleChatClick}
    >
      {/* 1. 아이콘/썸네일 */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
        <MessageIcon />
      </div>

      {/* 2. 내용 */}
      <div className="flex-1 min-w-0">
        {/* 카페 이름 및 파트너 정보 */}
        <div className="flex items-center mb-1">
          <p className="text-base font-semibold text-gray-800 truncate">
            {room.cafeName}
          </p>
          <span
            className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
              room.isOwner
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {room.isOwner ? "운영자" : room.partnerName}
          </span>
        </div>

        {/* 마지막 메시지 */}
        <p
          className={`text-sm truncate ${
            room.unreadCount > 0 ? "font-bold text-gray-800" : "text-gray-500"
          }`}
        >
          {room.lastMessage}
        </p>
      </div>

      {/* 3. 시간 및 안 읽은 메시지 수 */}
      <div className="flex flex-col items-end ml-4 flex-shrink-0">
        <span className="text-xs text-gray-400 mb-1">{room.lastSentTime}</span>
        {room.unreadCount > 0 ? (
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {room.unreadCount}
          </span>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-xs text-transparent"></span>
        )}
      </div>

      {/* 4. 화살표 */}
      <div className="ml-3">
        <ArrowRightIcon />
      </div>
    </div>
  );
};

/**
 * 마이페이지 채팅방 목록 화면
 */
export default function MyChatroomsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">채팅방 목록</h1>

      {mockChatrooms.length > 0 ? (
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
          {mockChatrooms.map((room) => (
            <ChatroomItem key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-6xl mb-4 block">✉️</span>
          <p className="text-lg text-gray-600 font-medium">
            진행 중인 채팅이 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            카페 사장님과 대화하거나 다른 사용자와 소통해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
