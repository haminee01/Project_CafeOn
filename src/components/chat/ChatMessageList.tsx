"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessageItem from "./ChatMessageItem";
import { ChatMessage, ProfileClickHandler } from "@/types/chat";
import { ChatHistoryMessage } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";
import { getChatMessagesWithUnreadCount } from "@/lib/api";

interface ChatMessageListProps {
  messages: ChatMessage[];
  chatHistory?: ChatHistoryMessage[];
  hasMoreHistory?: boolean;
  isLoadingHistory?: boolean;
  onProfileClick: ProfileClickHandler;
  onListClick: () => void;
  onLoadMoreHistory?: () => void;
  onMarkAsRead?: () => void;
  roomId?: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  chatHistory = [],
  hasMoreHistory = false,
  isLoadingHistory = false,
  onProfileClick,
  onListClick,
  onLoadMoreHistory,
  onMarkAsRead,
  roomId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);
  const [readStatus, setReadStatus] = useState<{ [messageId: string]: number }>(
    {}
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 스크롤 이벤트 핸들러 - 사용자가 메시지를 실제로 볼 때 읽음 처리
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onMarkAsRead) return;

    const handleScroll = () => {
      // 스크롤이 맨 아래에 가까우면 읽음 처리
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100;

      if (isNearBottom && !hasMarkedAsRead.current) {
        hasMarkedAsRead.current = true;
        onMarkAsRead();
      }
    };

    container.addEventListener("scroll", handleScroll);

    // 초기 로드 시에도 체크
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [onMarkAsRead]);

  // 메시지가 변경될 때 읽음 처리 상태 리셋
  useEffect(() => {
    hasMarkedAsRead.current = false;
  }, [messages]);

  // 읽음 상태 조회 (othersUnreadUsers 포함된 메시지 API 사용)
  useEffect(() => {
    if (!roomId) {
      console.log("roomId가 없어서 읽음 상태 조회를 건너뜁니다.");
      return;
    }

    const fetchReadStatus = async () => {
      try {
        const response = await getChatMessagesWithUnreadCount(roomId);
        console.log("메시지 목록 조회 결과:", response);

        // 응답 데이터 구조에 따라 읽음 상태 설정
        if (response.data && response.data.content) {
          const statusMap: { [messageId: string]: number } = {};

          // 각 메시지의 othersUnreadUsers 값을 사용
          response.data.content.forEach((message: any) => {
            const chatId = message.chatId.toString();
            // chatHistory 메시지의 경우 "history-" 접두사가 붙은 ID로 매핑
            const historyMessageId = `history-${chatId}`;

            // 두 가지 ID 형태 모두 매핑
            statusMap[chatId] = message.othersUnreadUsers || 0;
            statusMap[historyMessageId] = message.othersUnreadUsers || 0;

            console.log("API 메시지 처리:", {
              chatId: message.chatId,
              messageId: chatId,
              historyMessageId,
              content: message.message,
              othersUnreadUsers: message.othersUnreadUsers,
            });
          });

          console.log("읽음 상태 맵 (정확한 값):", statusMap);
          setReadStatus(statusMap);
        } else {
          console.log("API 응답 데이터가 없습니다:", response);
        }
      } catch (error) {
        console.error("메시지 목록 조회 실패:", error);
      }
    };

    // 초기 로드 시에만 호출
    fetchReadStatus();
  }, [roomId]);

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

    // 시간순으로 정렬 (오래된 메시지부터 최신 메시지 순)
    return Array.from(messageMap.values()).sort((a, b) => {
      // 메시지 ID에서 시간 정보 추출 (chatId는 시간순으로 증가)
      const aId = a.id.replace("history-", "");
      const bId = b.id.replace("history-", "");

      // 숫자로 변환하여 비교 (오래된 메시지가 먼저)
      const aNum = parseInt(aId) || 0;
      const bNum = parseInt(bId) || 0;

      return aNum - bNum;
    });
  }, [historyMessages, messages]);

  // 모든 메시지가 비어있는지 확인 (로딩 중이 아닐 때만)
  const hasNoMessages = allMessages.length === 0 && !isLoadingHistory;

  return (
    <div
      ref={containerRef}
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
      {allMessages.map((message) => {
        const messageId = message.id;
        const unreadCount = readStatus[messageId] || 0;

        console.log("메시지 렌더링:", {
          messageId,
          content: message.content,
          unreadCount,
          readStatusMap: readStatus,
          messageExistsInStatusMap: messageId in readStatus,
        });

        return (
          <ChatMessageItem
            key={messageId}
            message={message}
            onProfileClick={onProfileClick}
            unreadCount={unreadCount}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
