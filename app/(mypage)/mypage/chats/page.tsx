"use client";

import React from "react";
// import { MessageSquare, Calendar, User } from "lucide-react"; // 미리보기 환경 오류로 인해 제거

// 임시 채팅방 데이터 (실제로는 Firestore 등에서 불러옴)
const mockChatrooms = [
  {
    id: 1,
    cafeName: "북촌 한옥마을 조용한 카페",
    lastMessage: "오늘 오후 3시에 만날까요?",
    lastMessageTime: "오후 1:30",
    members: 3,
    date: "2025.09.28",
  },
  {
    id: 2,
    cafeName: "강남역 스터디 팀 프로젝트",
    lastMessage: "자료 준비 완료했습니다. 확인 부탁드립니다.",
    lastMessageTime: "어제",
    members: 5,
    date: "2025.09.25",
  },
  {
    id: 3,
    cafeName: "테마 카페 추천 요청",
    lastMessage: "홍대 쪽 괜찮은 곳 있나요?",
    lastMessageTime: "2025.09.20",
    members: 2,
    date: "2025.09.20",
  },
];

type ChatroomItemType = (typeof mockChatrooms)[0];

/**
 * 단일 채팅방 항목 컴포넌트
 */
const ChatroomItem = ({ item }: { item: ChatroomItemType }) => {
  // 아이콘 대체 (이모지 사용)
  const CalendarIcon = () => (
    <span className="text-sm text-gray-500 mr-1">📅</span>
  );
  const UserIcon = () => <span className="text-sm text-gray-500 mr-1">🧑‍🤝‍🧑</span>;

  return (
    <div
      className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => console.log(`${item.id}번 채팅방으로 이동`)}
    >
      {/* 1. 프로필 이미지 (카페 이미지 대체) */}
      <div className="flex-shrink-0 w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mr-4">
        <span className="text-2xl">☕</span>
      </div>

      {/* 2. 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold text-gray-800 truncate pr-2">
            {item.cafeName}
          </h3>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {item.lastMessageTime}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {item.lastMessage}
        </p>

        {/* 추가 정보 */}
        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
          <span className="flex items-center">
            <CalendarIcon />
            <span>{item.date}</span>
          </span>
          <span className="flex items-center">
            <UserIcon />
            <span>{item.members}명</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 마이페이지 참여 채팅방 목록 화면
 */
export default function MyChatsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">참여 채팅방</h1>

      {mockChatrooms.length > 0 ? (
        <div className="space-y-4">
          {mockChatrooms.map((room) => (
            <ChatroomItem key={room.id} item={room} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-6xl mb-4 block">💬</span>
          <p className="text-lg text-gray-600 font-medium">
            현재 참여 중인 채팅방이 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            다른 사용자와 함께 카페 정보를 공유해 보세요!
          </p>
        </div>
      )}
    </div>
  );
}
