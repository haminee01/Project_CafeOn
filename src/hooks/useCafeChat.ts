import { useState, useEffect, useCallback, useRef } from "react";
import {
  joinCafeGroupChat,
  getChatParticipants,
  getChatMessages,
  leaveChatRoom,
  getChatHistory,
  createDmChat,
  leaveChatRoomNew,
  toggleChatMute,
  getChatRoomIdByCafeId,
  ChatRoomJoinResponse,
  ChatParticipant,
  ChatMessageResponse,
  ChatHistoryMessage,
  ChatHistoryResponse,
} from "@/api/chat";
import { ChatMessage, Participant } from "@/types/chat";
import {
  createStompClient,
  StompSubscription,
  ChatMessage as StompChatMessage,
} from "@/lib/stompClient";
import { Client } from "@stomp/stompjs";

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

  // 참여자 관련
  participants: Participant[];
  participantCount: number;

  // 메시지 관련
  messages: ChatMessage[];
  chatHistory: ChatHistoryMessage[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;

  // 알림 상태
  isMuted: boolean;

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
}

export const useCafeChat = ({
  cafeId,
  cafeName,
}: UseCafeChatProps): UseCafeChatReturn => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isJoining, setIsJoining] = useState(false); // 중복 참여 방지
  const [isMuted, setIsMuted] = useState(false); // 알림 상태

  // STOMP 관련 상태
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // STOMP 클라이언트 연결
  const connectStomp = useCallback(async () => {
    if (stompClientRef.current?.connected) {
      console.log("STOMP 이미 연결됨");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const serverUrl =
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/stomp/chats";
      console.log("STOMP 연결 시도:", serverUrl);

      const client = createStompClient(serverUrl, token);

      client.onConnect = (frame) => {
        console.log("STOMP 연결 성공:", frame);
        setIsConnected(true);
      };

      client.onStompError = (frame) => {
        console.error("STOMP 에러:", frame);
        setIsConnected(false);
      };

      client.onWebSocketError = (error) => {
        console.error("WebSocket 에러:", error);
        setIsConnected(false);
      };

      client.onDisconnect = () => {
        console.log("STOMP 연결 해제");
        setIsConnected(false);
      };

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("STOMP 연결 실패:", error);
      setIsConnected(false);
    }
  }, []);

  // STOMP 구독
  const subscribeToRoom = useCallback((roomId: string) => {
    if (!stompClientRef.current?.connected || !roomId) return;

    try {
      const subscription = stompClientRef.current.subscribe(
        `/sub/rooms/${roomId}`,
        (message) => {
          try {
            const data: StompChatMessage = JSON.parse(message.body);
            console.log("받은 메시지:", data);

            // ChatMessage 형태로 변환
            const newMessage: ChatMessage = {
              id: data.chatId.toString(),
              senderName: data.senderNickname,
              content: data.message,
              isMyMessage: data.mine,
              senderId: data.senderNickname,
              messageType: data.messageType,
            };

            // 중복 메시지 방지: 이미 존재하는 메시지인지 확인
            setMessages((prev) => {
              const messageExists = prev.some(
                (msg) => msg.id === newMessage.id
              );
              if (messageExists) {
                console.log("중복 메시지 무시:", newMessage.id);
                return prev;
              }
              return [...prev, newMessage];
            });
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        }
      );

      subscriptionRef.current = subscription;
      console.log(`STOMP 구독 성공: /sub/rooms/${roomId}`);
    } catch (error) {
      console.error("STOMP 구독 실패:", error);
    }
  }, []);

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

    setIsConnected(false);
    console.log("STOMP 연결 해제");
  }, []);

  // 채팅방 참여 (재시도 로직 포함)
  const joinChat = useCallback(
    async (retryCount = 0) => {
      if (!cafeId || isJoining || isJoined) return;

      setIsJoining(true);
      setIsLoading(true);
      setError(null);

      try {
        const response: ChatRoomJoinResponse = await joinCafeGroupChat(cafeId);
        console.log("채팅방 참여 응답:", response);
        setRoomId(response.roomId);
        setIsJoined(true);
        console.log("roomId 설정됨:", response.roomId);

        // 참여자 목록과 채팅 히스토리를 가져옴
        await Promise.all([refreshParticipants(), loadMoreHistory()]);

        // STOMP 연결 및 구독
        await connectStomp();
        // 연결 완료 후 구독 (약간의 지연)
        setTimeout(() => {
          subscribeToRoom(response.roomId);
        }, 1000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "채팅방 참여에 실패했습니다.";

        // "이미 참여 중" 또는 중복 키 에러는 정상적인 상황으로 처리 (에러 로그 제거)
        const isAlreadyParticipating =
          errorMessage.includes("이미 채팅방에 참여 중입니다.") ||
          errorMessage.includes("Duplicate entry") ||
          errorMessage.includes("uk_crm_room_user") ||
          errorMessage.includes("chat_room_members");

        if (isAlreadyParticipating) {
          console.log("이미 참여 중인 채팅방 - 정상 처리");
          // 이미 참여 중인 경우에도 채팅방 정보를 가져와서 모달을 표시
          // 실제 chatroom_id를 매핑으로 가져오기
          try {
            const roomInfo = await getChatRoomIdByCafeId(cafeId);
            console.log("이미 참여 중인 채팅방, roomId 설정:", roomInfo.roomId);
            setRoomId(roomInfo.roomId);
            setIsJoined(true);

            // 참여자 목록과 채팅 히스토리를 가져옴
            try {
              await Promise.all([refreshParticipants(), loadMoreHistory()]);
            } catch (refreshErr) {
              console.warn(
                "이미 참여 중인 채팅방 데이터 새로고침 실패:",
                refreshErr
              );
            }

            // STOMP 연결 및 구독
            await connectStomp();
            // 연결 완료 후 구독 (약간의 지연)
            setTimeout(() => {
              subscribeToRoom(roomInfo.roomId);
            }, 1000);
          } catch (roomIdErr) {
            console.error("채팅방 ID 조회 실패:", roomIdErr);
            // 에러 발생 시 기본값 사용
            const defaultRoomId = "1";
            setRoomId(defaultRoomId);
            setIsJoined(true);

            // STOMP 연결 및 구독
            await connectStomp();
            setTimeout(() => {
              subscribeToRoom(defaultRoomId);
            }, 1000);
          }
          return;
        }

        // 데드락 에러인 경우 재시도 (최대 3번)
        if (errorMessage.includes("Deadlock") && retryCount < 3) {
          console.log(`데드락 발생, ${retryCount + 1}번째 재시도 중...`);
          setTimeout(() => {
            joinChat(retryCount + 1);
          }, 1000 * (retryCount + 1)); // 지수 백오프
          return;
        }

        setError(errorMessage);
        console.error("채팅방 참여 실패:", err);
      } finally {
        setIsLoading(false);
        setIsJoining(false);
      }
    },
    [cafeId, isJoining, isJoined]
  );

  // 채팅방 나가기
  const leaveChat = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    try {
      await leaveChatRoomNew(roomId);

      // STOMP 연결 해제
      disconnectStomp();

      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
      setChatHistory([]);
      setHasMoreHistory(true);
      setIsMuted(false);
    } catch (err) {
      console.error("채팅방 나가기 실패:", err);

      // STOMP 연결 해제 (API 에러가 발생해도)
      disconnectStomp();

      // API 에러가 발생해도 로컬 상태는 초기화 (사용자 경험 개선)
      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
      setChatHistory([]);
      setHasMoreHistory(true);
      setIsMuted(false);
      console.log("API 에러로 인한 로컬 상태 초기화");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, disconnectStomp]);

  // 메시지 전송 (STOMP 발행)
  const sendMessage = useCallback(
    async (content: string) => {
      console.log("메시지 전송 시도:", { roomId, content });

      if (!roomId || !content.trim()) {
        console.log("메시지 전송 실패: roomId 또는 content가 없음", {
          roomId,
          content,
        });
        return;
      }

      if (!stompClientRef.current?.connected) {
        console.log("메시지 전송 실패: STOMP 연결이 없음", {
          roomId,
          content,
          isConnected: stompClientRef.current?.connected,
        });
        return;
      }

      try {
        console.log("STOMP 메시지 발행:", { roomId, content });

        // STOMP로 메시지 발행
        stompClientRef.current.publish({
          destination: `/pub/rooms/${roomId}`,
          body: JSON.stringify({
            message: content,
            roomId: parseInt(roomId),
          }),
        });

        console.log("메시지 발행 성공");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "메시지 전송에 실패했습니다."
        );
        console.error("메시지 전송 실패:", err);
      }
    },
    [roomId, connectStomp]
  );

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(async () => {
    if (!roomId) {
      console.log("roomId가 없어서 참여자 목록 조회 건너뜀");
      return;
    }

    try {
      console.log("참여자 목록 조회 시작, roomId:", roomId);
      const response: ChatParticipant[] = await getChatParticipants(roomId);
      console.log("참여자 목록 원본 응답:", response);

      // ChatParticipant를 Participant로 변환
      const convertedParticipants: Participant[] = response.map(
        (participant) => ({
          id: participant.userId,
          name: participant.nickname,
        })
      );

      console.log("변환된 참여자 목록:", convertedParticipants);
      setParticipants(convertedParticipants);
    } catch (err) {
      console.error("참여자 목록 조회 실패:", err);
      // 에러가 발생했을 때 빈 배열로 설정
      setParticipants([]);
    }
  }, [roomId]);

  // 메시지 목록 새로고침
  const refreshMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const response: ChatMessageResponse[] = await getChatMessages(roomId);

      // ChatMessageResponse를 ChatMessage로 변환
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
  }, [roomId]);

  // 채팅 히스토리 로드 (커서 페이징)
  const loadMoreHistory = useCallback(async () => {
    if (!roomId || isLoadingHistory) return;

    setIsLoadingHistory(true);

    try {
      // 현재 히스토리의 마지막 메시지 ID를 beforeId로 사용
      const beforeId =
        chatHistory.length > 0
          ? chatHistory[chatHistory.length - 1].chatId.toString()
          : undefined;

      const response: ChatHistoryResponse = await getChatHistory(
        roomId,
        beforeId,
        50,
        true
      );

      // 응답 데이터 안전하게 처리
      const items = response.data?.items || [];
      const hasNext = response.data?.hasNext || false;

      // 새로운 히스토리를 기존 히스토리 뒤에 추가
      setChatHistory((prev) => [...prev, ...items]);
      setHasMoreHistory(hasNext);

      console.log(
        `채팅 히스토리 로드 완료: ${items.length}개 메시지, 더 있음: ${hasNext}`
      );
    } catch (err) {
      console.error("채팅 히스토리 조회 실패:", err);
      // 에러가 발생했을 때 빈 히스토리로 설정
      setChatHistory([]);
      setHasMoreHistory(false);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [roomId, chatHistory, isLoadingHistory]);

  // 1:1 채팅방 생성
  const createDmChatRoom = useCallback(
    async (counterpartId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("1:1 채팅방 생성 시도:", counterpartId);
        const response = await createDmChat(counterpartId);
        console.log("1:1 채팅방 생성 응답:", response);

        setRoomId(response.roomId);
        setIsJoined(true);

        // 참여자 목록과 채팅 히스토리를 가져옴
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

  // 채팅방 알림 토글
  const toggleMute = useCallback(async () => {
    if (!roomId) return;

    try {
      const newMutedState = !isMuted;
      await toggleChatMute(roomId, newMutedState);
      setIsMuted(newMutedState);
      console.log("채팅방 알림 설정 변경:", newMutedState ? "끄기" : "켜기");
    } catch (err) {
      console.error("채팅방 알림 설정 실패:", err);
      // 에러가 발생해도 UI 상태는 변경 (사용자 경험 개선)
      setIsMuted(!isMuted);
      console.log("API 에러로 인한 로컬 상태 변경");
    }
  }, [roomId, isMuted]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 STOMP 연결 해제
      disconnectStomp();
    };
  }, [disconnectStomp]);

  return {
    roomId,
    isJoined,
    isLoading,
    error,
    participants,
    participantCount: participants.length,
    messages,
    chatHistory,
    hasMoreHistory,
    isLoadingHistory,
    isMuted,
    joinChat,
    leaveChat,
    sendMessage,
    refreshParticipants,
    refreshMessages,
    loadMoreHistory,
    createDmChat: createDmChatRoom,
    toggleMute,
  };
};
