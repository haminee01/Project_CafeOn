"use client";

import React, { useEffect, useRef } from "react";
import ChatMessageItem from "./ChatMessageItem";
import { ChatMessage, ProfileClickHandler } from "@/types/chat";
import { ChatHistoryMessage } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessageListProps {
  messages: ChatMessage[];
  chatHistory?: ChatHistoryMessage[];
  hasMoreHistory?: boolean;
  isLoadingHistory?: boolean;
  onProfileClick: ProfileClickHandler;
  onListClick: () => void;
  onLoadMoreHistory?: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  chatHistory = [],
  hasMoreHistory = false,
  isLoadingHistory = false,
  onProfileClick,
  onListClick,
  onLoadMoreHistory,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // useAuth 훅 사용
  const { user } = useAuth();
  const currentUserNickname = user?.username || null;

  // 채팅 히스토리를 ChatMessage 형태로 변환
  const historyMessages: ChatMessage[] = chatHistory.map(
    (historyMsg, index) => {
      // 백엔드에서 mine: true로 보내는 메시지는 확실히 내 메시지
      const isMyMessage = Boolean(
        historyMsg.mine === true ||
          (currentUserNickname &&
            historyMsg.senderNickname === currentUserNickname)
      );

      const convertedMessage = {
        id: `history-${historyMsg.chatId}`,
        senderName: historyMsg.senderNickname,
        content: historyMsg.message,
        isMyMessage: isMyMessage,
        senderId: historyMsg.senderNickname, // 임시로 nickname을 ID로 사용
        messageType: historyMsg.messageType, // 메시지 타입 추가
      };

      console.log("히스토리 메시지 변환:", {
        originalMine: historyMsg.mine,
        currentUserNickname,
        senderNickname: historyMsg.senderNickname,
        convertedIsMyMessage: isMyMessage,
        messageId: convertedMessage.id,
      });

      return convertedMessage;
    }
  );

  // 히스토리와 실시간 메시지를 합치되 중복 제거
  const allMessages = React.useMemo(() => {
    const messageMap = new Map<string, ChatMessage>();

    // 히스토리 메시지 먼저 추가
    historyMessages.forEach((msg) => {
      messageMap.set(msg.id, msg);
    });

    // 실시간 메시지 추가 (중복되지 않는 것만)
    messages.forEach((msg) => {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg);
      }
    });

    // 시간순으로 정렬 (히스토리가 먼저, 그 다음 실시간 메시지)
    return Array.from(messageMap.values()).sort((a, b) => {
      // 히스토리 메시지는 앞에, 실시간 메시지는 뒤에
      const aIsHistory = a.id.startsWith("history-");
      const bIsHistory = b.id.startsWith("history-");

      if (aIsHistory && !bIsHistory) return -1;
      if (!aIsHistory && bIsHistory) return 1;

      return 0;
    });
  }, [historyMessages, messages]);

  // 모든 메시지가 비어있는지 확인 (로딩 중이 아닐 때만)
  const hasNoMessages = allMessages.length === 0 && !isLoadingHistory;

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 border-y"
      onClick={onListClick}
    >
      {/* 더 많은 히스토리 로드 버튼 - 메시지가 있을 때만 표시 */}
      {hasMoreHistory && onLoadMoreHistory && !hasNoMessages && (
        <div className="flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoadMoreHistory();
            }}
            disabled={isLoadingHistory}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingHistory ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                <span>로딩 중...</span>
              </div>
            ) : (
              "이전 메시지 더 보기"
            )}
          </button>
        </div>
      )}

      {/* 로딩 중일 때 로딩 메시지 표시 */}
      {isLoadingHistory && allMessages.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <div className="text-center text-gray-500 text-sm">
            <div className="mb-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            </div>
            <p>채팅 기록을 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 메시지가 없을 때 입장 메시지 표시 (로딩 중이 아닐 때만) */}
      {hasNoMessages && (
        <div className="flex justify-center items-center h-full">
          <div className="text-center text-gray-500 text-sm">
            <div className="mb-2">
              <svg
                className="w-8 h-8 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p>채팅방에 입장했습니다.</p>
            <p className="text-xs mt-1">첫 메시지를 보내보세요!</p>
          </div>
        </div>
      )}

      {/* 통합된 메시지 리스트 */}
      {allMessages.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          onProfileClick={onProfileClick}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
