import { useCallback, useRef } from "react";
import { readLatest } from "@/api/chat";
import { markChatAsRead } from "@/lib/api";
import { ChatMessage } from "@/types/chat";
import { ChatHistoryMessage } from "@/api/chat";

interface UseChatReadStatusProps {
  roomId: string | null;
  messages: ChatMessage[];
  chatHistory: ChatHistoryMessage[];
  onMessagesUpdate: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  onChatHistoryUpdate: (
    updater:
      | ChatHistoryMessage[]
      | ((prev: ChatHistoryMessage[]) => ChatHistoryMessage[])
  ) => void;
}

interface UseChatReadStatusReturn {
  scheduleReadLatest: (targetRoomId: string) => void;
  markAsRead: () => Promise<void>;
}

/**
 * 채팅 읽음 상태 관리 Hook
 * 단일 책임: 읽음 처리 및 read-latest 호출
 */
export const useChatReadStatus = ({
  roomId,
  messages,
  chatHistory,
  onMessagesUpdate,
  onChatHistoryUpdate,
}: UseChatReadStatusProps): UseChatReadStatusReturn => {
  const readLatestTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastReadSeenRef = useRef<Map<string, number>>(new Map());

  // 자동 read-latest 호출 (400ms 디바운스)
  const scheduleReadLatest = useCallback((targetRoomId: string) => {
    if (readLatestTimerRef.current) {
      clearTimeout(readLatestTimerRef.current);
    }
    readLatestTimerRef.current = setTimeout(async () => {
      try {
        // readLatest API 함수 사용 (올바른 엔드포인트와 에러 처리 포함)
        await readLatest(targetRoomId);
      } catch (error) {
        // 404 에러는 조용히 무시 (백엔드에서 해당 엔드포인트를 지원하지 않을 수 있음)
        if (error instanceof Error && error.message.includes("404")) {
          // 백엔드에서 해당 엔드포인트를 지원하지 않는 경우 조용히 무시
          return;
        }
        console.error("자동 read-latest 실패:", error);
      }
    }, 400);
  }, []);

  // 채팅 읽음 처리
  const markAsRead = useCallback(async () => {
    if (!roomId) return;

    try {
      // 현재 메시지 목록에서 가장 최근 메시지의 ID를 찾음
      const allMessages = [...messages, ...chatHistory];

      if (allMessages.length === 0) {
        return;
      }

      // 메시지를 시간순으로 정렬하여 가장 최근 메시지 찾기
      const sortedMessages = allMessages.sort((a, b) => {
        const aId = "id" in a ? parseInt(a.id) : a.chatId;
        const bId = "id" in b ? parseInt(b.id) : b.chatId;
        return aId - bId;
      });

      // 가장 최근 메시지를 찾기 (내 메시지 포함)
      const lastMessage = sortedMessages[sortedMessages.length - 1];

      if (lastMessage) {
        const messageId =
          "id" in lastMessage ? lastMessage.id : lastMessage.chatId.toString();

        await markChatAsRead(roomId, messageId);

        // 읽음 처리 즉시 로컬 상태에서 읽은 메시지들의 안읽음 수 감소
        const readMessageId =
          parseInt(messageId.replace("history-", "")) || parseInt(messageId);

        onMessagesUpdate((prevMessages) => {
          return prevMessages.map((msg) => {
            const msgId =
              parseInt(msg.id.replace("history-", "")) || parseInt(msg.id);
            // 읽은 메시지 ID 이하의 모든 메시지 안읽음 수 감소
            if (msgId <= readMessageId && !msg.isMyMessage) {
              const currentCount = msg.othersUnreadUsers || 0;
              const newCount = Math.max(0, currentCount - 1);
              return {
                ...msg,
                othersUnreadUsers: newCount,
              };
            }
            return msg;
          });
        });

        // chatHistory도 동일하게 업데이트
        onChatHistoryUpdate((prevHistory) => {
          return prevHistory.map((msg) => {
            const msgId = msg.chatId;
            if (msgId <= readMessageId && !msg.mine) {
              const currentCount = (msg as any).othersUnreadUsers || 0;
              const newCount = Math.max(0, currentCount - 1);
              return {
                ...msg,
                othersUnreadUsers: newCount,
              } as any;
            }
            return msg;
          });
        });

        // 읽음 처리 후 읽지 않은 사람 수 업데이트를 위한 이벤트 발생
        window.dispatchEvent(
          new CustomEvent("chatMarkedAsRead", {
            detail: { roomId, messageId },
          })
        );
      }
    } catch (err) {
      console.error("채팅 읽음 처리 실패:", err);
    }
  }, [roomId, messages, chatHistory, onMessagesUpdate, onChatHistoryUpdate]);

  return {
    scheduleReadLatest,
    markAsRead,
  };
};
