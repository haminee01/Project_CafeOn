import { useState, useEffect, useCallback, useRef } from "react";
import {
  createDmChat,
  getChatParticipants,
  getChatHistory,
  leaveChatRoomNew,
  toggleChatMute,
  DmChatJoinResponse,
  ChatParticipant,
  ChatHistoryMessage,
  ChatHistoryResponse,
} from "@/api/chat";
import { ChatMessage, Participant } from "@/types/chat";
import {
  setDmChatMapping,
  getRoomIdByCounterpart,
  getCounterpartByRoom,
  removeDmChatMapping,
  debugDmMappings,
} from "@/utils/dmChatMapping";
import {
  createStompClient,
  StompSubscription,
  ChatMessage as StompChatMessage,
} from "@/lib/stompClient";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./useAuth";

interface UseDmChatProps {
  counterpartId: string;
  counterpartName: string;
}

interface UseDmChatReturn {
  // 채팅방 상태
  roomId: string | null;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;

  // 참여자 관련
  participants: Participant[];
  participantCount: number;

  // 메시지 관련
  messages: ChatMessage[];
  chatHistory: ChatHistoryMessage[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;

  // 알림 관련
  isMuted: boolean;

  // STOMP 연결 상태
  stompConnected: boolean;

  // 액션 함수들
  joinChat: () => Promise<void>;
  leaveChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  refreshParticipants: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  toggleMute: () => Promise<void>;
}

export const useDmChat = ({
  counterpartId,
  counterpartName,
}: UseDmChatProps): UseDmChatReturn => {
  // 기본 상태
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 참여자 관련
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);

  // 메시지 관련
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 알림 관련
  const [isMuted, setIsMuted] = useState(false);

  // STOMP 관련
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const [stompConnected, setStompConnected] = useState(false);

  // 인증 관련
  const { user, currentUserId } = useAuth();
  const currentUserNickname = user?.username || null;

  // STOMP 클라이언트 연결
  const connectStomp = useCallback(async () => {
    if (stompClientRef.current?.connected) {
      console.log("1:1 채팅 STOMP 이미 연결됨");
      return;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const serverUrl =
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/stomp/chats";
      console.log("1:1 채팅 STOMP 연결 시도:", serverUrl);

      const client = createStompClient(serverUrl, token);
      stompClientRef.current = client;

      client.onConnect = (frame) => {
        console.log("1:1 채팅 STOMP 연결 성공:", frame);
        setStompConnected(true);
      };

      client.onStompError = (frame) => {
        console.error("1:1 채팅 STOMP 에러:", frame);
        setStompConnected(false);
      };

      client.onWebSocketError = (error) => {
        console.error("1:1 채팅 WebSocket 에러:", error);
        setStompConnected(false);
      };

      client.onDisconnect = () => {
        console.log("1:1 채팅 STOMP 연결 해제");
        setStompConnected(false);
      };

      client.activate();
      stompClientRef.current = client;

      // 연결 완료까지 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("1:1 채팅 STOMP 연결 실패:", error);
      setStompConnected(false);
    }
  }, []);

  // STOMP 구독
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      console.log("=== 1:1 채팅 STOMP 구독 시도 ===", {
        roomId,
        stompConnected: stompClientRef.current?.connected,
        hasStompClient: !!stompClientRef.current,
      });

      if (!stompClientRef.current?.connected || !roomId) {
        console.log("STOMP 구독 조건 불만족:", {
          stompConnected: stompClientRef.current?.connected,
          roomId,
        });
        return;
      }

      // 기존 구독 해제
      if (subscriptionRef.current) {
        console.log("기존 1:1 채팅 STOMP 구독 해제");
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      try {
        const subscription = stompClientRef.current.subscribe(
          `/sub/rooms/${roomId}`,
          (message) => {
            try {
              const data: StompChatMessage = JSON.parse(message.body);
              console.log("1:1 채팅 받은 메시지:", data);

              // mine 속성을 올바르게 판단
              let isMyMessage = data.mine === true;

              if (
                !isMyMessage &&
                (data.mine === undefined || data.mine === null)
              ) {
                if (currentUserNickname) {
                  isMyMessage = data.senderNickname === currentUserNickname;
                }
              }

              // ChatMessage 형태로 변환
              const newMessage: ChatMessage = {
                id: data.chatId.toString(),
                senderName: data.senderNickname,
                content: data.message,
                isMyMessage: isMyMessage,
                senderId: data.senderNickname,
                messageType: data.messageType,
              };

              // 중복 메시지 방지
              setMessages((prev) => {
                const messageExists = prev.some(
                  (msg) => msg.id === newMessage.id
                );
                if (messageExists) {
                  console.log("중복 메시지 무시:", newMessage.id);
                  return prev;
                }
                console.log("1:1 채팅 새 메시지 추가:", newMessage);
                return [...prev, newMessage];
              });
            } catch (error) {
              console.error("1:1 채팅 메시지 파싱 오류:", error);
            }
          }
        );

        subscriptionRef.current = subscription;
        console.log(`1:1 채팅 STOMP 구독 성공: /sub/rooms/${roomId}`);
      } catch (error) {
        console.error("1:1 채팅 STOMP 구독 실패:", error);
      }
    },
    [currentUserNickname]
  );

  // STOMP 연결 해제
  const disconnectStomp = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    setStompConnected(false);
    console.log("1:1 채팅 STOMP 연결 해제");
  }, []);

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(async () => {
    if (!roomId) {
      console.log("refreshParticipants: roomId가 없어서 실행하지 않음");
      return;
    }

    try {
      // 참여자 목록 조회 시작

      const response = await getChatParticipants(roomId);

      const participantList: Participant[] = response.map(
        (p: ChatParticipant) => ({
          id: p.userId,
          name: p.me ? `나 (${p.nickname})` : p.nickname,
        })
      );

      setParticipants(participantList);
      setParticipantCount(participantList.length);
      // 완료
    } catch (err) {
      console.error("1:1 채팅 참여자 목록 새로고침 실패:", err);
    }
  }, [roomId, currentUserId, currentUserNickname]);

  // 채팅 히스토리 로딩
  const loadMoreHistory = useCallback(async () => {
    if (!roomId || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      console.log("1:1 채팅 히스토리 로딩:", roomId);

      const lastMessageId =
        chatHistory.length > 0
          ? chatHistory[chatHistory.length - 1].chatId.toString()
          : undefined;

      const response = await getChatHistory(roomId, lastMessageId);
      console.log("1:1 채팅 히스토리 응답:", response);

      setChatHistory((prev) => [...prev, ...response.data.content]);
      setHasMoreHistory(response.data.hasNext);

      // 히스토리 메시지를 ChatMessage 형태로 변환
      const historyMessages: ChatMessage[] = response.data.content.map(
        (msg: ChatHistoryMessage) => ({
          id: msg.chatId.toString(),
          senderName: msg.senderNickname,
          content: msg.message,
          isMyMessage: msg.mine,
          senderId: msg.senderNickname,
          messageType: msg.messageType,
        })
      );

      setMessages((prev) => [...historyMessages, ...prev]);
      console.log(
        "1:1 채팅 히스토리 로딩 완료:",
        historyMessages.length,
        "개 메시지"
      );
    } catch (err) {
      console.error("1:1 채팅 히스토리 로딩 실패:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [roomId, chatHistory.length, isLoadingHistory]);

  // 1:1 채팅방 참여
  const joinChat = useCallback(async () => {
    console.log("=== 1:1 채팅방 참여 시작 ===", {
      counterpartId,
      counterpartName,
      currentUserId,
      currentUserNickname,
    });

    setIsLoading(true);
    setError(null);

    try {
      // 기존 매핑 확인
      const existingRoomId = getRoomIdByCounterpart(counterpartId);
      if (existingRoomId) {
        console.log("=== 이미 참여 중인 1:1 채팅방 발견 ===", {
          counterpartId,
          existingRoomId,
          currentRoomId: roomId,
        });
        console.log("기존 roomId로 상태 업데이트:", existingRoomId);
        setRoomId(existingRoomId.toString());
        setIsJoined(true);

        console.log("기존 1:1 채팅방 데이터 로드 시작");
        try {
          await Promise.all([refreshParticipants(), loadMoreHistory()]);
          console.log("기존 1:1 채팅방 데이터 로드 완료");
        } catch (dataLoadError) {
          console.error("기존 1:1 채팅방 데이터 로드 실패:", dataLoadError);
        }

        try {
          await connectStomp();
          console.log("기존 1:1 채팅방 STOMP 연결 완료");
        } catch (stompError) {
          console.warn("기존 1:1 채팅방 STOMP 연결 실패:", stompError);
        }
        return;
      }

      console.log("새로운 1:1 채팅방 생성 시도:", counterpartId);

      // createDmChat API 호출
      const response = await createDmChat(counterpartId);
      console.log("1:1 채팅방 생성 응답:", response);

      const newRoomId = response.data.roomId.toString();
      console.log("새로운 roomId 설정:", newRoomId);

      setRoomId(newRoomId);
      setIsJoined(true);

      // 참여자 목록을 즉시 로드하여 사이드바에 반영
      try {
        await refreshParticipants();
      } catch (e) {
        // 무시하고 진행 (에러는 상위에서 로깅됨)
      }

      // 매핑 저장
      console.log("=== 매핑 저장 시작 ===", {
        counterpartId,
        newRoomId: parseInt(newRoomId),
      });
      setDmChatMapping(counterpartId, parseInt(newRoomId));

      const savedRoomId = getRoomIdByCounterpart(counterpartId);
      console.log("매핑 저장 후 확인:", {
        counterpartId,
        savedRoomId,
        expectedRoomId: parseInt(newRoomId),
        매핑성공: savedRoomId === parseInt(newRoomId),
      });
      debugDmMappings();

      console.log("STOMP 연결 시작");
      // STOMP 연결 및 구독
      await connectStomp();

      console.log("STOMP 구독 시작");
      if (response.data.roomId) {
        subscribeToRoom(response.data.roomId.toString());
      }

      console.log("1:1 채팅방 생성 완료");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "1:1 채팅방 생성에 실패했습니다.";
      setError(errorMessage);
      console.error("1:1 채팅방 생성 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    counterpartId,
    counterpartName,
    currentUserId,
    currentUserNickname,
    roomId,
    connectStomp,
    subscribeToRoom,
    refreshParticipants,
    loadMoreHistory,
  ]);

  // 채팅방 나가기
  const leaveChat = useCallback(async () => {
    if (!roomId) return;

    try {
      console.log("1:1 채팅방 나가기:", roomId);
      await leaveChatRoomNew(roomId);

      // 매핑 제거
      removeDmChatMapping(counterpartId);

      // STOMP 연결 해제
      disconnectStomp();

      // 상태 초기화
      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
      setChatHistory([]);
      setError(null);

      console.log("1:1 채팅방 나가기 완료");
    } catch (err) {
      console.error("1:1 채팅방 나가기 실패:", err);
    }
  }, [roomId, counterpartId, disconnectStomp]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (message: string) => {
      console.log("=== 1:1 채팅 메시지 전송 시도 ===", {
        message,
        roomId,
        stompConnected: stompClientRef.current?.connected,
        hasStompClient: !!stompClientRef.current,
      });

      if (!message.trim() || !roomId) {
        console.log("메시지 전송 조건 불만족:", {
          message: message.trim(),
          roomId,
        });
        return;
      }

      // STOMP 연결 상태 확인
      if (!stompClientRef.current?.connected) {
        console.log("1:1 채팅 메시지 전송 실패: STOMP 연결이 끊어짐");
        setError("채팅 연결이 끊어졌습니다. 다시 시도해주세요.");
        return;
      }

      try {
        console.log("1:1 채팅 STOMP 메시지 발행:", { roomId, message });

        // STOMP로 메시지 발행
        stompClientRef.current.publish({
          destination: `/pub/rooms/${roomId}`,
          body: JSON.stringify({ message }),
        });

        console.log("1:1 채팅 메시지 발행 성공");
      } catch (err) {
        console.error("1:1 채팅 메시지 전송 실패:", err);
        setError(
          err instanceof Error ? err.message : "메시지 전송에 실패했습니다."
        );
      }
    },
    [roomId]
  );

  // 알림 토글
  const toggleMute = useCallback(async () => {
    if (!roomId) return;

    try {
      console.log("1:1 채팅 알림 토글:", roomId);
      await toggleChatMute(roomId, !isMuted);
      setIsMuted((prev) => !prev);
      console.log("1:1 채팅 알림 토글 완료");
    } catch (err) {
      console.error("1:1 채팅 알림 토글 실패:", err);
    }
  }, [roomId]);

  // 컴포넌트 마운트 시 1:1 채팅방 참여
  useEffect(() => {
    if (counterpartId && !isJoined && !isLoading) {
      joinChat();
    }
  }, [counterpartId, isJoined, isLoading, joinChat]);

  // roomId가 설정되면 STOMP 구독
  useEffect(() => {
    if (roomId && stompConnected && stompClientRef.current?.connected) {
      subscribeToRoom(roomId);
    }
  }, [roomId, stompConnected, subscribeToRoom]);

  // 초기 데이터 로드
  useEffect(() => {
    console.log("=== 초기화 useEffect 실행 ===");
    console.log("초기화 조건 확인:", {
      counterpartId,
      roomId,
      isJoined,
      participantsLength: participants.length,
      chatHistoryLength: chatHistory.length,
      messagesLength: messages.length,
    });

    if (counterpartId && roomId && isJoined) {
      console.log("=== 데이터 로드 조건 만족, 로드 시작 ===");

      console.log("참여자 목록 로드 시작");
      refreshParticipants();

      if (chatHistory.length === 0) {
        console.log("채팅 히스토리 로드 시작");
        loadMoreHistory();
      } else {
        console.log("채팅 히스토리 이미 있음, 로드 건너뜀");
      }
    } else {
      console.log("데이터 로드 조건 불만족:", {
        counterpartId: !!counterpartId,
        roomId: !!roomId,
        isJoined,
      });
    }
  }, [
    counterpartId,
    roomId,
    isJoined,
    participants.length,
    chatHistory.length,
    messages.length,
    refreshParticipants,
    loadMoreHistory,
  ]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnectStomp();
    };
  }, [disconnectStomp]);

  return {
    // 채팅방 상태
    roomId,
    isJoined,
    isLoading,
    error,

    // 참여자 관련
    participants,
    participantCount,

    // 메시지 관련
    messages,
    chatHistory,
    hasMoreHistory,
    isLoadingHistory,

    // 알림 관련
    isMuted,

    // STOMP 연결 상태
    stompConnected,

    // 액션 함수들
    joinChat,
    leaveChat,
    sendMessage,
    refreshParticipants,
    loadMoreHistory,
    toggleMute,
  };
};
