import { useCallback, useEffect, useRef } from "react";
import {
  getChatHistory,
  ChatHistoryMessage,
  ChatHistoryResponse,
} from "@/api/chat";
import { ChatMessage } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStore } from "@/stores/authStore";

interface UseChatMessagesProps {
  roomId: string | null;
  messages: ChatMessage[];
  chatHistory: ChatHistoryMessage[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;
  onMessagesChange: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  onChatHistoryChange: (
    updater:
      | ChatHistoryMessage[]
      | ((prev: ChatHistoryMessage[]) => ChatHistoryMessage[])
  ) => void;
  onHasMoreHistoryChange: (value: boolean) => void;
  onIsLoadingHistoryChange: (value: boolean) => void;
  onReadReceiptReceived?: (readReceipt: {
    readerId: string;
    lastReadChatId: number;
  }) => void;
  isCafeChat?: boolean; // true면 카페 채팅, false면 DM 채팅
}

interface UseChatMessagesReturn {
  loadMoreHistory: (targetRoomId?: string) => Promise<void>;
  handleStompMessage: (data: any) => void;
  handleReadReceipt: (readReceipt: {
    readerId: string;
    lastReadChatId: number;
  }) => void;
}

/**
 * 채팅 메시지 관리 Hook
 * 단일 책임: 메시지 수신, 히스토리 로드, 읽음 영수증 처리
 */
export const useChatMessages = ({
  roomId,
  messages,
  chatHistory,
  hasMoreHistory,
  isLoadingHistory,
  onMessagesChange,
  onChatHistoryChange,
  onHasMoreHistoryChange,
  onIsLoadingHistoryChange,
  onReadReceiptReceived,
  isCafeChat = false,
}: UseChatMessagesProps): UseChatMessagesReturn => {
  const { user } = useAuth();
  const lastReadSeenRef = useRef<Map<string, number>>(new Map());

  // 사용자 닉네임 로드가 늦었을 때 기존 메시지 보정 (카페 채팅만)
  useEffect(() => {
    if (!isCafeChat) return;

    const myNickname = user?.username;
    if (!myNickname) return;

    onMessagesChange((prev) => {
      let changed = false;
      const next = prev.map((m) => {
        if (!m.isMyMessage && m.senderName === myNickname) {
          changed = true;
          return { ...m, isMyMessage: true };
        }
        return m;
      });
      return changed ? next : prev;
    });
  }, [user?.username, isCafeChat, onMessagesChange]);

  // STOMP 메시지 처리
  const handleStompMessage = useCallback(
    (data: any) => {
      // 내 닉네임 추출 (토큰 payload의 sub 또는 userId)
      const getMyNicknameFromToken = (): string | null => {
        try {
          const token = useAuthStore.getState().accessToken;
          if (!token) return null;
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload?.sub || payload?.userId || payload?.username || null;
        } catch {
          return null;
        }
      };

      // 가능한 모든 소스에서 내 닉네임을 확보 (지연 로딩 대비)
      const storedUsername =
        useAuthStore.getState().user?.nickname ||
        useAuthStore.getState().user?.username ||
        null;

      const myNickname =
        user?.username || storedUsername || getMyNicknameFromToken();

      // 입장/퇴장 메시지 체크 (카페 채팅만)
      let isMyJoinOrLeaveMessage = false;
      if (isCafeChat) {
        const isJoinOrLeaveMessage =
          (data.message || "").includes("님이 입장했습니다.") ||
          (data.message || "").includes("님이 퇴장했습니다.");
        isMyJoinOrLeaveMessage =
          isJoinOrLeaveMessage &&
          myNickname &&
          (data.message || "").includes(myNickname);
      }

      const isMine = Boolean(
        data.mine ||
          (myNickname && data.senderNickname === myNickname) ||
          isMyJoinOrLeaveMessage
      );

      // 표시명은 항상 서버 닉네임 사용 (내 메시지는 표시단에서 (나)만 붙임)
      const displaySenderName = data.senderNickname;

      // ChatMessage 형태로 변환
      const newMessage: ChatMessage = {
        id: data.chatId.toString(),
        senderName: displaySenderName,
        content: data.message,
        isMyMessage: isMine,
        senderId: data.senderNickname,
        messageType: data.messageType,
        images: data.images?.map((img: any) => img.imageUrl) || undefined,
        timeLabel: data.timeLabel,
        othersUnreadUsers: data.othersUnreadUsers,
        createdAt: data.createdAt,
      };

      // 중복 방지
      onMessagesChange((prev) => {
        // 같은 ID가 이미 있으면 추가하지 않음
        const messageExists = prev.some((msg) => msg.id === newMessage.id);
        if (messageExists) {
          return prev;
        }

        return [...prev, newMessage];
      });

      // 새 메시지가 추가되면 읽지 않은 사람 수 업데이트를 위한 이벤트 발생
      if (roomId) {
        window.dispatchEvent(
          new CustomEvent("chatMessageAdded", {
            detail: { roomId, messageId: newMessage.id },
          })
        );
      }
    },
    [roomId, user?.username, isCafeChat, onMessagesChange]
  );

  // 읽음 영수증 처리
  const handleReadReceipt = useCallback(
    (readReceipt: { readerId: string; lastReadChatId: number }) => {
      const prev = lastReadSeenRef.current.get(readReceipt.readerId) || 0;
      const cur = readReceipt.lastReadChatId;

      // 이미 처리한 읽음 영수증은 무시
      if (cur <= prev) {
        return;
      }

      lastReadSeenRef.current.set(readReceipt.readerId, cur);

      // (prev, cur] 범위의 메시지들의 othersUnreadUsers를 1씩 감소
      onMessagesChange((prevMessages) => {
        return prevMessages.map((msg) => {
          const chatId = parseInt(msg.id.replace("history-", "")) || 0;
          // 이 메시지가 (prev, cur] 범위에 있으면 안읽음 수 감소
          if (chatId > prev && chatId <= cur) {
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
      onChatHistoryChange((prevHistory) => {
        return prevHistory.map((msg) => {
          const chatId = msg.chatId;
          if (chatId > prev && chatId <= cur) {
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

      // 외부 핸들러 호출
      onReadReceiptReceived?.(readReceipt);
    },
    [onMessagesChange, onChatHistoryChange, onReadReceiptReceived]
  );

  // 채팅 히스토리 로드 (커서 페이징)
  const loadMoreHistory = useCallback(
    async (targetRoomId?: string) => {
      const useRoomId = targetRoomId || roomId;
      if (!useRoomId || isLoadingHistory) {
        return;
      }

      onIsLoadingHistoryChange(true);

      try {
        // 현재 히스토리의 마지막 메시지 ID를 beforeId로 사용
        const beforeId =
          chatHistory.length > 0
            ? chatHistory[chatHistory.length - 1].chatId.toString()
            : undefined;

        const response: ChatHistoryResponse = await getChatHistory(
          useRoomId,
          beforeId,
          50,
          true
        );

        // 응답 데이터 안전하게 처리
        const items = response.data?.content || [];
        const hasNext = response.data?.hasNext || false;

        // 새로운 히스토리를 기존 히스토리 뒤에 추가 (날짜 메시지 포함)
        onChatHistoryChange((prev) => [...prev, ...items]);
        onHasMoreHistoryChange(hasNext);
      } catch (err) {
        console.error("채팅 히스토리 조회 실패:", err);
        onChatHistoryChange([]);
        onHasMoreHistoryChange(false);
      } finally {
        onIsLoadingHistoryChange(false);
      }
    },
    [
      roomId,
      chatHistory,
      isLoadingHistory,
      onChatHistoryChange,
      onHasMoreHistoryChange,
      onIsLoadingHistoryChange,
    ]
  );

  return {
    loadMoreHistory,
    handleStompMessage,
    handleReadReceipt,
  };
};
