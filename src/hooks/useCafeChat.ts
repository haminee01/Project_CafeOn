import { useEffect, useCallback, useRef, useMemo } from "react";
import {
  joinCafeGroupChat,
  getChatMessages,
  leaveChatRoomNew,
  createDmChat,
  readLatest,
  ChatRoomJoinResponse,
  ChatMessageResponse,
} from "@/api/chat";
import { useAuth } from "@/contexts/AuthContext";
import {
  setChatMapping,
  getRoomIdByCafe,
  removeChatMapping,
} from "@/utils/chatMapping";
import {
  useChatStore,
  createCafeChatSessionState,
  CafeSessionUpdater,
} from "@/stores/chatStore";
import { useChatPreferencesStore } from "@/stores/chatPreferencesStore";
import { useStompConnection } from "./useStompConnection";
import { useChatMessages } from "./useChatMessages";
import { useChatParticipants } from "./useChatParticipants";
import { useChatReadStatus } from "./useChatReadStatus";
import { useChatMute } from "./useChatMute";
import { ChatMessage } from "@/types/chat";
import { isErrorStatus } from "@/utils/errorHandler";
import { AuthorizationError } from "@/errors/AppError";

interface UseCafeChatProps {
  cafeId: string;
  cafeName: string;
}

interface UseCafeChatReturn {
  // 채팅방 상태
  roomId: string | null;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
  requiresLogin: boolean; // 로그인 필요 여부

  // 참여자 관련
  participants: any[];
  participantCount: number;

  // 메시지 관련
  messages: ChatMessage[];
  chatHistory: any[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;

  // 알림 상태
  isMuted: boolean;

  // STOMP 연결 상태
  stompConnected: boolean;

  // 액션 함수들
  joinChat: () => Promise<void>;
  leaveChat: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshParticipants: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;

  // 새로운 기능들
  createDmChat: (counterpartId: string) => Promise<void>;
  toggleMute: () => Promise<void>;
  markAsRead: () => Promise<void>;
}

export const useCafeChat = ({
  cafeId,
  cafeName,
}: UseCafeChatProps): UseCafeChatReturn => {
  // 세션 관리 - selector는 store에서 직접 가져오기만 함 (기본값은 initCafeSession에서 처리)
  const session = useChatStore((state) => state.cafeSessions[cafeId]);
  const initCafeSession = useChatStore((state) => state.initCafeSession);
  const patchCafeSession = useChatStore((state) => state.patchCafeSession);
  const resetCafeSession = useChatStore((state) => state.resetCafeSession);

  useEffect(() => {
    initCafeSession(cafeId);
    return () => resetCafeSession(cafeId);
  }, [cafeId, initCafeSession, resetCafeSession]);

  const updateSession = useCallback(
    (updater: CafeSessionUpdater) => patchCafeSession(cafeId, updater),
    [cafeId, patchCafeSession]
  );

  // 상태 업데이트 함수들
  const setRoomId = useCallback(
    (value: string | null) => updateSession({ roomId: value }),
    [updateSession]
  );
  const setIsJoined = useCallback(
    (value: boolean) => updateSession({ isJoined: value }),
    [updateSession]
  );
  const setIsLoading = useCallback(
    (value: boolean) => updateSession({ isLoading: value }),
    [updateSession]
  );
  const setError = useCallback(
    (value: string | null) => updateSession({ error: value }),
    [updateSession]
  );
  const setParticipants = useCallback(
    (updater: any[] | ((prev: any[]) => any[])) =>
      updateSession((prev) => ({
        ...prev,
        participants:
          typeof updater === "function" ? updater(prev.participants) : updater,
      })),
    [updateSession]
  );
  const setMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) =>
      updateSession((prev) => ({
        ...prev,
        messages:
          typeof updater === "function" ? updater(prev.messages) : updater,
      })),
    [updateSession]
  );
  const setChatHistory = useCallback(
    (updater: any[] | ((prev: any[]) => any[])) =>
      updateSession((prev) => ({
        ...prev,
        chatHistory:
          typeof updater === "function" ? updater(prev.chatHistory) : updater,
      })),
    [updateSession]
  );
  const setHasMoreHistory = useCallback(
    (value: boolean) => updateSession({ hasMoreHistory: value }),
    [updateSession]
  );
  const setIsLoadingHistory = useCallback(
    (value: boolean) => updateSession({ isLoadingHistory: value }),
    [updateSession]
  );
  const setIsJoining = useCallback(
    (value: boolean) => updateSession({ isJoining: value }),
    [updateSession]
  );
  const setIsRetrying = useCallback(
    (value: boolean) => updateSession({ isRetrying: value }),
    [updateSession]
  );
  const setIsMuted = useCallback(
    (value: boolean) => updateSession({ isMuted: value }),
    [updateSession]
  );
  const setStompConnected = useCallback(
    (value: boolean) => updateSession({ stompConnected: value }),
    [updateSession]
  );

  // session이 없으면 기본값 사용 (initCafeSession이 호출되기 전일 수 있음)
  // useMemo로 캐싱하여 매번 새로 생성되지 않도록 함
  const defaultSession = useMemo(() => createCafeChatSessionState(), []);
  const {
    roomId,
    isJoined,
    isLoading,
    error,
    participants,
    messages,
    chatHistory,
    hasMoreHistory,
    isLoadingHistory,
    isJoining,
    isRetrying,
    isMuted,
    stompConnected,
  } = session ?? defaultSession;

  // 참여자 관리 Hook
  const { refreshParticipants } = useChatParticipants({
    roomId,
    isCafeChat: true,
    onParticipantsChange: setParticipants,
    onMutedChange: setIsMuted,
  });

  // 읽음 상태 관리 Hook
  const { scheduleReadLatest, markAsRead } = useChatReadStatus({
    roomId,
    messages,
    chatHistory,
    onMessagesUpdate: setMessages,
    onChatHistoryUpdate: setChatHistory,
  });

  // 메시지 관리 Hook
  const { loadMoreHistory, handleStompMessage, handleReadReceipt } =
    useChatMessages({
      roomId,
      messages,
      chatHistory,
      hasMoreHistory,
      isLoadingHistory,
      onMessagesChange: setMessages,
      onChatHistoryChange: setChatHistory,
      onHasMoreHistoryChange: setHasMoreHistory,
      onIsLoadingHistoryChange: setIsLoadingHistory,
      isCafeChat: true,
    });

  // STOMP 연결 관리 Hook
  const {
    stompConnected: stompConnectedState,
    connectStomp,
    disconnectStomp,
    subscribeToRoom,
    sendMessage: stompSendMessage,
    isConnected: isStompConnected,
  } = useStompConnection({
    roomId,
    onMessageReceived: handleStompMessage,
    onReadReceiptReceived: handleReadReceipt,
    onConnectedChange: setStompConnected,
    scheduleReadLatest,
  });

  // 알림 관리 Hook
  const { toggleMute } = useChatMute({
    roomId,
    isMuted,
    isCafeChat: true,
    onMutedChange: setIsMuted,
  });

  // 참여자 목록 기반 닉네임 저장
  const myNicknameRef = useRef<string | null>(null);
  const joinedCafeIdRef = useRef<string | null>(null);

  // 채팅방 참여 관련
  const getRoomLeftPref = useChatPreferencesStore((state) => state.getRoomLeft);
  const markRoomLeftPref = useChatPreferencesStore(
    (state) => state.markRoomLeft
  );
  const clearRoomLeftPref = useChatPreferencesStore(
    (state) => state.clearRoomLeft
  );

  // 채팅방 참여 (재시도 로직 포함)
  const joinChat = useCallback(
    async (retryCount = 0) => {
      if (!cafeId || cafeId === "" || cafeId === "0") {
        console.error("joinChat: cafeId가 유효하지 않습니다:", cafeId);
        setError("카페 정보가 없습니다. 페이지를 새로고침해주세요.");
        return;
      }

      if (isJoining || isJoined || isRetrying) {
        return;
      }

      setIsJoining(true);
      setIsLoading(true);
      setError(null);

      // joinChat 시작 시 항상 메시지/히스토리 초기화
      setChatHistory([]);
      setMessages([]);
      setHasMoreHistory(true);

      try {
        const existingRoomId = getRoomIdByCafe(parseInt(cafeId));

        // 채팅방 참여 시도
        const response: ChatRoomJoinResponse = await joinCafeGroupChat(cafeId);

        if (!response || !response.data || !response.data.roomId) {
          console.error("채팅방 참여 응답에 roomId가 없습니다:", response);
          throw new Error("채팅방 참여 응답이 올바르지 않습니다.");
        }

        const responseCafeId = response.data.cafeId || parseInt(cafeId);
        const newRoomId = response.data.roomId.toString();

        setRoomId(newRoomId);
        setIsJoined(true);

        // 매핑 저장
        setChatMapping(responseCafeId, parseInt(newRoomId));

        // 나간 채팅방인지 확인
        const leftKey = `cafe_${cafeId}`;
        const leftInfo = getRoomLeftPref(leftKey);

        if (leftInfo) {
          clearRoomLeftPref(leftKey);
          setHasMoreHistory(false);
          await refreshParticipants(newRoomId);
        } else {
          await Promise.all([
            refreshParticipants(newRoomId),
            loadMoreHistory(newRoomId),
          ]);
        }

        // STOMP 연결 및 구독
        await connectStomp();

        // 방 입장 시 최신 메시지 읽음 처리
        setTimeout(async () => {
          try {
            await readLatest(newRoomId);

            // 입장 시 읽음 처리 후 즉시 로컬 상태 업데이트
            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (!msg.isMyMessage) {
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

            setChatHistory((prevHistory) => {
              return prevHistory.map((msg) => {
                if (!msg.mine) {
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
          } catch (err) {
            console.error("입장 시 읽음 처리 실패:", err);
          }
        }, 1000);

        // 연결 완료 후 구독 - 연결 상태를 확인하며 재시도
        const attemptSubscribe = async (retries = 5) => {
          for (let i = 0; i < retries; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 현재 연결 상태 확인
            if (isStompConnected()) {
              subscribeToRoom(newRoomId);
              return;
            }
          }

          // 최대 재시도 후에도 연결되지 않으면 경고만 표시
          console.warn("STOMP 연결이 완료되지 않았지만 구독을 시도합니다.");
          subscribeToRoom(newRoomId);
        };

        attemptSubscribe();
      } catch (err) {
        // 403 에러 (권한 없음) 처리 - 로그인 필요
        if (isErrorStatus(err, 403) || err instanceof AuthorizationError) {
          setError(null); // 에러 메시지는 표시하지 않음
          updateSession({ requiresLogin: true });
          setIsLoading(false);
          setIsJoining(false);
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "채팅방 참여에 실패했습니다.";

        // message_type 컬럼 길이 초과 에러 처리
        const isMessageTypeError =
          errorMessage.includes("Data too long for column 'message_type'") ||
          errorMessage.includes("message_type") ||
          errorMessage.includes("Data truncation");

        const isAlreadyParticipating =
          errorMessage.includes("이미 채팅방에 참여 중입니다.") ||
          errorMessage.includes("Duplicate entry") ||
          errorMessage.includes("uk_crm_room_user") ||
          errorMessage.includes("chat_room_members") ||
          errorMessage.includes("uk_cafe_one_group") ||
          errorMessage.includes("Entry for instance") ||
          errorMessage.includes("alreadyJoined") ||
          errorMessage.includes("already joined") ||
          errorMessage.includes("단체 채팅방 가입 실패");

        const isJoinStatusError = errorMessage.includes("가입 상태 조회 실패");
        const isHibernateEntityError =
          errorMessage.includes("has a null identifier") ||
          errorMessage.includes("ChatRoomEntity");

        // message_type 에러 처리 (백엔드 데이터베이스 스키마 문제)
        if (isMessageTypeError) {
          console.error(
            "백엔드 데이터베이스 스키마 문제: message_type 컬럼 길이 제한 초과"
          );
          console.error(
            "이 문제는 백엔드에서 해결해야 합니다. message_type 컬럼의 길이를 늘려야 합니다."
          );
          setError(
            "채팅방 입장 중 데이터베이스 오류가 발생했습니다.\n\n이 문제는 백엔드 설정 문제입니다.\n관리자에게 문의해주세요."
          );
          return;
        }

        if (isHibernateEntityError) {
          if (retryCount === 0) {
            setIsRetrying(true);
            setTimeout(() => {
              setIsRetrying(false);
              joinChat();
            }, 3000);
            setError(
              "채팅방 생성 중 일시적인 문제가 발생했습니다. 잠시 후 자동으로 재시도합니다..."
            );
            return;
          }
          setError(
            "채팅방 생성 중 데이터베이스 문제가 발생했습니다. 다음 중 하나를 시도해주세요:\n1. 페이지 새로고침 (F5)\n2. 잠시 후 다시 시도\n3. 관리자에게 문의"
          );
          return;
        }

        if (isJoinStatusError) {
          if (retryCount === 0) {
            setTimeout(() => {
              joinChat();
            }, 3000);
            setError(
              "인증 문제가 발생했습니다. 잠시 후 자동으로 재시도합니다..."
            );
            return;
          }
          setError(
            "처음 채팅방 입장 시 인증 문제가 발생했습니다. 다음 중 하나를 시도해주세요:\n1. 페이지 새로고침 (F5)\n2. 다시 로그인\n3. 잠시 후 다시 시도"
          );
          return;
        }

        if (isAlreadyParticipating) {
          setError(
            "채팅방 참여 중 에러가 발생했습니다. 페이지를 새로고침해주세요."
          );
          return;
        }

        if (errorMessage.includes("Deadlock") && retryCount < 3) {
          setTimeout(() => {
            joinChat(retryCount + 1);
          }, 1000 * (retryCount + 1));
          return;
        }

        setError(errorMessage);
        console.error("채팅방 참여 실패:", err);
      } finally {
        setIsLoading(false);
        setIsJoining(false);
      }
    },
    [
      cafeId,
      isJoining,
      isJoined,
      isRetrying,
      connectStomp,
      subscribeToRoom,
      refreshParticipants,
      loadMoreHistory,
      getRoomLeftPref,
      clearRoomLeftPref,
      stompConnectedState,
    ]
  );

  // 채팅방 나가기
  const leaveChat = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    try {
      await leaveChatRoomNew(roomId);

      const leftKey = `cafe_${cafeId}`;
      markRoomLeftPref(leftKey, {
        timestamp: Date.now(),
        cafeId,
        roomId,
      });

      removeChatMapping(parseInt(cafeId));
      disconnectStomp();

      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
      setChatHistory([]);
      setHasMoreHistory(true);
      setIsMuted(false);

      joinedCafeIdRef.current = null;
    } catch (err) {
      console.error("=== 채팅방 나가기 API 실패 ===", err);
      const errorMessage =
        err instanceof Error ? err.message : "채팅방 나가기에 실패했습니다.";

      setError(`나가기 실패: ${errorMessage}\n다시 시도해주세요.`);

      alert(
        `채팅방 나가기에 실패했습니다.\n\n${errorMessage}\n\n다시 시도해주세요.`
      );

      disconnectStomp();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [roomId, cafeId, disconnectStomp, markRoomLeftPref]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      if (!roomId || !content.trim()) {
        return;
      }

      try {
        stompSendMessage(roomId, content);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "메시지 전송에 실패했습니다."
        );
        console.error("메시지 전송 실패:", err);
      }
    },
    [roomId, stompSendMessage]
  );

  // 메시지 목록 새로고침
  const refreshMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const response: ChatMessageResponse[] = await getChatMessages(roomId);

      const convertedMessages: ChatMessage[] = response.map((msg) => ({
        id: msg.messageId,
        senderName: msg.senderName,
        content: msg.content,
        isMyMessage: msg.isMyMessage || false,
        senderId: msg.senderId,
      }));

      setMessages(convertedMessages);
    } catch (err) {
      console.error("메시지 목록 조회 실패:", err);
    }
  }, [roomId, setMessages]);

  // 1:1 채팅방 생성
  const createDmChatRoom = useCallback(
    async (counterpartId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await createDmChat(counterpartId);

        setRoomId(response.data.roomId.toString());
        setIsJoined(true);

        await Promise.all([refreshParticipants(), loadMoreHistory()]);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "1:1 채팅방 생성에 실패했습니다.";
        setError(errorMessage);
        console.error("1:1 채팅방 생성 실패:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshParticipants, loadMoreHistory]
  );

  // roomId가 설정되면 STOMP 구독
  useEffect(() => {
    if (roomId && stompConnectedState) {
      subscribeToRoom(roomId);
    }
  }, [roomId, stompConnectedState, subscribeToRoom]);

  // 초기 채팅방 참여
  useEffect(() => {
    if (cafeId && !isJoined && !isLoading && !isJoining) {
      if (joinedCafeIdRef.current === cafeId) {
        return;
      }
      joinedCafeIdRef.current = cafeId;
      joinChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeId]);

  const requiresLogin = session?.requiresLogin ?? false;

  return {
    roomId,
    isJoined,
    isLoading,
    error,
    requiresLogin,
    participants,
    participantCount: participants.length,
    messages,
    chatHistory,
    hasMoreHistory,
    isLoadingHistory,
    isMuted,
    stompConnected: stompConnectedState,
    joinChat,
    leaveChat,
    sendMessage,
    refreshParticipants,
    refreshMessages,
    loadMoreHistory,
    createDmChat: createDmChatRoom,
    toggleMute,
    markAsRead,
  };
};
