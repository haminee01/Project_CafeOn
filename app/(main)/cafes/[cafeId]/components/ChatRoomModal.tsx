"use client";

import { useState } from "react";

interface ChatRoomModalProps {
  onClose: () => void;
  cafe: {
    name: string;
  };
}

export default function ChatRoomModal({ onClose, cafe }: ChatRoomModalProps) {
  const [nickname, setNickname] = useState("Sunwon903");

  const handleJoin = () => {
    console.log('채팅방 참여:', nickname);
    // 실제 구현에서는 채팅방 입장 로직
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{cafe.name} 채팅방</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-gray-600">
            해당 카페와 관련된 정보를 나누는 오픈 채팅방 입니다.
          </p>

          {/* 현재 참여자 수 */}
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <span className="text-gray-700 font-medium">현재 6명 대화 중</span>
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="닉네임을 입력하세요"
            />
          </div>

          {/* 참여하기 버튼 */}
          <button
            onClick={handleJoin}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            참여하기
          </button>
        </div>
      </div>
    </div>
  );
}
