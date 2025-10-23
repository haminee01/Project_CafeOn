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
import {
  setChatMapping,
  getRoomIdByCafe,
  getCafeIdByRoom,
  removeChatMapping,
  debugMappings,
} from "@/utils/chatMapping";

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
  const [isRetrying, setIsRetrying] = useState(false); // 재시도 중 상태
  const [isMuted, setIsMuted] = useState(false); // 알림 상태
  const [stompConnected, setStompConnected] = useState(false); // STOMP 연결 상태

  // STOMP 관련 상태
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

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
      stompClientRef.current = client;

      client.onConnect = (frame) => {
        console.log("STOMP 연결 성공:", frame);
        setStompConnected(true);
      };

      client.onStompError = (frame) => {
        console.error("STOMP 에러:", frame);
        setStompConnected(false);
      };

      client.onWebSocketError = (error) => {
        console.error("WebSocket 에러:", error);
        setStompConnected(false);
      };

      client.onDisconnect = () => {
        console.log("STOMP 연결 해제");
        setStompConnected(false);
      };

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("STOMP 연결 실패:", error);
      setStompConnected(false);
    }
  }, []);

  // STOMP 구독
  const subscribeToRoom = useCallback((roomId: string) => {
    if (!stompClientRef.current?.connected || !roomId) return;

    try {
      // 기존 구독 해제
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

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

              const updatedMessages = [...prev, newMessage];
              console.log("메시지 상태 업데이트:", {
                이전메시지수: prev.length,
                새메시지: newMessage,
                업데이트된메시지수: updatedMessages.length,
                전체메시지목록: updatedMessages,
              });

              return updatedMessages;
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

    setStompConnected(false);
    console.log("STOMP 연결 해제");
  }, []);

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(
    async (targetRoomId?: string) => {
      const useRoomId = targetRoomId || roomId;
      if (!useRoomId) {
        console.log("refreshParticipants: roomId가 없음");
        return;
      }

      console.log("참여자 목록 새로고침 시작:", useRoomId);

      try {
        const response: ChatParticipant[] = await getChatParticipants(
          useRoomId
        );
        console.log("참여자 목록 조회 성공:", response);

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
        setParticipants([]);
      }
    },
    [roomId]
  );

  // 채팅 히스토리 로드 (커서 페이징)
  const loadMoreHistory = useCallback(
    async (targetRoomId?: string) => {
      const useRoomId = targetRoomId || roomId;
      if (!useRoomId || isLoadingHistory) {
        console.log("loadMoreHistory: roomId가 없거나 로딩 중");
        return;
      }

      console.log("채팅 히스토리 로드 시작:", useRoomId);
      setIsLoadingHistory(true);

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

        console.log("채팅 히스토리 조회 성공:", {
          roomId: useRoomId,
          itemsCount: response.data?.content?.length || 0,
          hasNext: response.data?.hasNext || false,
        });

        // 응답 데이터 안전하게 처리
        const items = response.data?.content || [];
        const hasNext = response.data?.hasNext || false;

        // 새로운 히스토리를 기존 히스토리 뒤에 추가
        setChatHistory((prev) => [...prev, ...items]);
        setHasMoreHistory(hasNext);
      } catch (err) {
        console.error("채팅 히스토리 조회 실패:", err);
        setChatHistory([]);
        setHasMoreHistory(false);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [roomId, chatHistory, isLoadingHistory]
  );

  // 채팅방 참여 (재시도 로직 포함)
  const joinChat = useCallback(
    async (retryCount = 0) => {
      console.log("=== joinChat 함수 호출됨 ===", {
        cafeId,
        isJoining,
        isJoined,
        retryCount,
        currentRoomId: roomId,
      });

      if (!cafeId || isJoining || isJoined || isRetrying) {
        console.log("joinChat 조건 불만족:", {
          cafeId: !!cafeId,
          isJoining,
          isJoined,
          isRetrying,
        });
        return;
      }

      setIsJoining(true);
      setIsLoading(true);
      setError(null);

      try {
        // 기존 매핑이 있어도 API를 호출하여 정확한 roomId 확인
        // 이전에 잘못된 매핑이 있을 수 있으므로 항상 API로 검증
        const existingRoomId = getRoomIdByCafe(parseInt(cafeId));
        if (existingRoomId) {
          console.log("=== 로컬 매핑 발견 (검증 필요) ===", {
            cafeId,
            localMappedRoomId: existingRoomId,
          });
        }

        // 채팅방 참여 시도 (신규 생성 또는 기존 참여)
        // API가 이미 참여 중인 경우 alreadyJoined: true와 함께 기존 roomId 반환
        const response: ChatRoomJoinResponse = await joinCafeGroupChat(cafeId);
        console.log("채팅방 참여 응답:", response, {
          alreadyJoined: response?.data?.alreadyJoined,
          roomId: response?.data?.roomId,
          cafeId: response?.data?.cafeId,
        });

        // 응답 데이터 안전하게 처리
        if (!response || !response.data || !response.data.roomId) {
          console.error("채팅방 참여 응답에 roomId가 없습니다:", response);
          throw new Error("채팅방 참여 응답이 올바르지 않습니다.");
        }

        // API 응답에서 cafeId와 roomId 추출
        const responseCafeId = response.data.cafeId || parseInt(cafeId);
        const newRoomId = response.data.roomId.toString();

        console.log("API 응답 데이터:", {
          responseCafeId,
          responseRoomId: response.data.roomId,
          alreadyJoined: response.data.alreadyJoined,
          originalCafeId: cafeId,
        });

        setRoomId(newRoomId);
        setIsJoined(true);

        // 매핑 저장 - API 응답의 cafeId 사용
        console.log("=== 매핑 저장 시작 ===", {
          responseCafeId,
          newRoomId: parseInt(newRoomId),
          매핑키: responseCafeId,
          매핑값: parseInt(newRoomId),
        });
        setChatMapping(responseCafeId, parseInt(newRoomId));

        const savedRoomId = getRoomIdByCafe(responseCafeId);
        console.log("매핑 저장 후 확인:", {
          responseCafeId,
          savedRoomId,
          expectedRoomId: parseInt(newRoomId),
          매핑성공: savedRoomId === parseInt(newRoomId),
        });
        debugMappings();

        // 원래 cafeId로도 한번 더 확인
        const savedByOriginalId = getRoomIdByCafe(parseInt(cafeId));
        console.log("원래 cafeId로 조회:", {
          originalCafeId: parseInt(cafeId),
          savedByOriginalId,
          매핑존재: savedByOriginalId !== undefined,
        });

        // 참여자 목록과 채팅 히스토리를 가져옴 (새로운 roomId 전달)
        console.log("참여자 목록 및 채팅 히스토리 로드 시작:", newRoomId);
        await Promise.all([
          refreshParticipants(newRoomId),
          loadMoreHistory(newRoomId),
        ]);
        console.log("참여자 목록 및 채팅 히스토리 로드 완료");

        // STOMP 연결 및 구독
        await connectStomp();
        // 연결 완료 후 구독 (약간의 지연)
        setTimeout(() => {
          subscribeToRoom(newRoomId);
        }, 1000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "채팅방 참여에 실패했습니다.";

        // "이미 참여 중" 또는 중복 키 에러는 정상적인 상황으로 처리
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

        // "가입 상태 조회 실패" 에러는 사용자 인증 문제일 수 있음
        const isJoinStatusError = errorMessage.includes("가입 상태 조회 실패");

        // Hibernate 엔티티 ID null 에러는 백엔드 데이터베이스 문제
        const isHibernateEntityError =
          errorMessage.includes("has a null identifier") ||
          errorMessage.includes("ChatRoomEntity");

        if (isHibernateEntityError) {
          console.error(
            "Hibernate 엔티티 ID null 에러 - 백엔드 데이터베이스 문제"
          );
          console.error(
            "채팅방 생성 시 데이터베이스 제약 조건 위반 또는 트랜잭션 문제"
          );

          // 처음 시도인 경우 자동 재시도
          if (retryCount === 0) {
            console.log("Hibernate 에러 - 3초 후 자동 재시도...");
            setIsRetrying(true);
            setTimeout(() => {
              console.log("Hibernate 에러 후 자동 재시도 시작");
              setIsRetrying(false);
              joinChat();
            }, 3000);
            setError(
              "채팅방 생성 중 일시적인 문제가 발생했습니다. 잠시 후 자동으로 재시도합니다..."
            );
            return;
          }

          // 재시도도 실패한 경우 - 사용자에게 해결 방법 안내
          console.error("Hibernate 에러 재시도도 실패 - 사용자 개입 필요");
          setError(
            "채팅방 생성 중 데이터베이스 문제가 발생했습니다. 다음 중 하나를 시도해주세요:\n1. 페이지 새로고침 (F5)\n2. 잠시 후 다시 시도\n3. 관리자에게 문의"
          );
          return;
        }

        if (isJoinStatusError) {
          console.error("가입 상태 조회 실패 - 사용자 인증 문제");
          console.error("처음 채팅방 입장 시 발생하는 알려진 문제입니다.");

          // 처음 시도인 경우 자동 재시도
          if (retryCount === 0) {
            console.log("가입 상태 조회 실패 - 3초 후 자동 재시도...");
            setTimeout(() => {
              console.log("자동 재시도 시작");
              joinChat();
            }, 3000);
            setError(
              "인증 문제가 발생했습니다. 잠시 후 자동으로 재시도합니다..."
            );
            return;
          }

          // 재시도도 실패한 경우 - 사용자에게 해결 방법 안내
          console.error("재시도도 실패 - 사용자 개입 필요");
          setError(
            "처음 채팅방 입장 시 인증 문제가 발생했습니다. 다음 중 하나를 시도해주세요:\n1. 페이지 새로고침 (F5)\n2. 다시 로그인\n3. 잠시 후 다시 시도"
          );
          return;
        }

        if (isAlreadyParticipating) {
          console.log("이미 참여 중인 채팅방 또는 중복 생성 시도 - 정상 처리");
          console.error(
            "예상치 못한 중복 참여 에러 발생. 이 에러는 발생하지 않아야 합니다."
          );
          console.error("에러 메시지:", errorMessage);

          // 이 시점에는 joinCafeGroupChat이 이미 호출되어 에러가 발생한 상태
          // 매핑이 저장되지 않았을 수 있으므로 재시도
          setError(
            "채팅방 참여 중 에러가 발생했습니다. 페이지를 새로고침해주세요."
          );
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
    [
      cafeId,
      isJoining,
      isJoined,
      roomId,
      connectStomp,
      subscribeToRoom,
      refreshParticipants,
      loadMoreHistory,
    ]
  );

  // 채팅방 나가기
  const leaveChat = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    try {
      await leaveChatRoomNew(roomId);

      // 매핑 제거
      removeChatMapping(parseInt(cafeId));

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
  }, [roomId, cafeId, disconnectStomp]);

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
    [roomId]
  );

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

  // 1:1 채팅방 생성
  const createDmChatRoom = useCallback(
    async (counterpartId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("1:1 채팅방 생성 시도:", counterpartId);
        const response = await createDmChat(counterpartId);
        console.log("1:1 채팅방 생성 응답:", response);

        setRoomId(response.data.roomId.toString());
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

  // roomId가 설정되면 STOMP 구독
  useEffect(() => {
    if (roomId && stompConnected && stompClientRef.current?.connected) {
      subscribeToRoom(roomId);
    }
  }, [roomId, stompConnected, subscribeToRoom]);

  // 초기 채팅방 참여 - cafeId가 변경될 때만 실행
  useEffect(() => {
    if (cafeId && !isJoined && !isLoading && !isJoining) {
      joinChat();
    }
    // joinChat을 의존성에서 제거하여 무한 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeId]);

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
    stompConnected,
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
