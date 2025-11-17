import { useEffect, useCallback, useRef } from "react";
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
  readLatest,
  ChatRoomJoinResponse,
  ChatParticipant,
  ChatMessageResponse,
  ChatHistoryMessage,
  ChatHistoryResponse,
} from "@/api/chat";
import { markChatAsRead } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
} from "@/utils/chatMapping";
import {
  useChatStore,
  createCafeChatSessionState,
  CafeSessionUpdater,
} from "@/stores/chatStore";
import { useChatPreferencesStore } from "@/stores/chatPreferencesStore";
import { getAccessToken, useAuthStore } from "@/stores/authStore";

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
  markAsRead: () => Promise<void>;
}

export const useCafeChat = ({
  cafeId,
  cafeName,
}: UseCafeChatProps): UseCafeChatReturn => {
  // 현재 로그인 사용자
  const { user } = useAuth();
  const getCafeMutePref = useChatPreferencesStore((state) => state.getCafeMute);
  const setCafeMutePref = useChatPreferencesStore((state) => state.setCafeMute);
  const getRoomLeftPref = useChatPreferencesStore((state) => state.getRoomLeft);
  const markRoomLeftPref = useChatPreferencesStore(
    (state) => state.markRoomLeft
  );
  const clearRoomLeftPref = useChatPreferencesStore(
    (state) => state.clearRoomLeft
  );
  const session = useChatStore(
    useCallback(
      (state) => state.cafeSessions[cafeId] ?? createCafeChatSessionState(),
      [cafeId]
    )
  );
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
    (updater: Participant[] | ((prev: Participant[]) => Participant[])) =>
      updateSession((prev) => ({
        ...prev,
        participants:
          typeof updater === "function"
            ? (updater as (prev: Participant[]) => Participant[])(
                prev.participants
              )
            : updater,
      })),
    [updateSession]
  );

  const setMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) =>
      updateSession((prev) => ({
        ...prev,
        messages:
          typeof updater === "function"
            ? (updater as (prev: ChatMessage[]) => ChatMessage[])(prev.messages)
            : updater,
      })),
    [updateSession]
  );

  const setChatHistory = useCallback(
    (
      updater:
        | ChatHistoryMessage[]
        | ((prev: ChatHistoryMessage[]) => ChatHistoryMessage[])
    ) =>
      updateSession((prev) => ({
        ...prev,
        chatHistory:
          typeof updater === "function"
            ? (updater as (prev: ChatHistoryMessage[]) => ChatHistoryMessage[])(
                prev.chatHistory
              )
            : updater,
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
  } = session;

  // STOMP 관련 상태
  const stompClientRef = useRef<Client | null>(null);
  const messageSubscriptionRef = useRef<StompSubscription | null>(null);
  const readSubscriptionRef = useRef<StompSubscription | null>(null);
  // 전송 직후 서버 에코가 오기 전까지 화면에 보일 낙관적(임시) 메시지 목록
  const pendingMessagesRef = useRef<
    Array<{ id: string; content: string; ts: number }>
  >([]);
  // 서버가 인식하는 내 닉네임(참여자 목록 기반)을 저장하여 신뢰도 높은 비교에 사용
  const myNicknameRef = useRef<string | null>(null);
  // 읽음 영수증: readerId별 마지막으로 적용된 lastReadChatId 저장 (중복 차감 방지)
  const lastReadSeenRef = useRef<Map<string, number>>(new Map());
  // 자동 read-latest 호출을 위한 타이머
  const readLatestTimerRef = useRef<NodeJS.Timeout | null>(null);
  // joinChat 중복 호출 방지를 위한 ref (React Strict Mode 대응)
  const joinedCafeIdRef = useRef<string | null>(null);

  // ===== Run Grouping 유틸 함수들 =====
  // 분 단위 시간 키 생성 (YYYY-MM-DD HH:MM)
  const minuteKeyOf = (createdAt: string): string | null => {
    try {
      const d = new Date(createdAt);
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const HH = String(d.getHours()).padStart(2, "0");
      const MM = String(d.getMinutes()).padStart(2, "0");
      return `${yy}-${mm}-${dd} ${HH}:${MM}`;
    } catch {
      return null;
    }
  };

  // 시스템 메시지 타입 체크
  const isSystemType = (messageType: string): boolean => {
    const type = (messageType || "").toString().toUpperCase();
    return type === "SYSTEM" || type.startsWith("SYSTEM_");
  };

  // Run 키 생성 (senderId|minuteKey)
  const runKeyOf = (msg: any): string | null => {
    if (isSystemType(msg.messageType)) return null;
    const sid = msg.senderId ? String(msg.senderId).trim() : "";
    const mk = minuteKeyOf(msg.createdAt);
    if (!sid || !mk) return null;
    return `${sid}|${mk}`;
  };

  // 자동 read-latest 호출 (400ms 디바운스)
  const scheduleReadLatest = useCallback((targetRoomId: string) => {
    if (readLatestTimerRef.current) {
      clearTimeout(readLatestTimerRef.current);
    }
    readLatestTimerRef.current = setTimeout(async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const res = await fetch(
          `/api/chat/rooms/${targetRoomId}/members/me/read-latest`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok || res.status === 204) {
        }
      } catch (error) {
        console.error("자동 read-latest 실패:", error);
      }
    }, 400);
  }, []);

  // STOMP 클라이언트 연결
  const connectStomp = useCallback(async () => {
    if (stompClientRef.current?.connected) {
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const serverUrl =
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/stomp/chats";

      const client = createStompClient(serverUrl, token);
      stompClientRef.current = client;

      client.onConnect = (frame) => {
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
        setStompConnected(false);
      };

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("STOMP 연결 실패:", error);
      setStompConnected(false);
    }
  }, []);

  // 사용자 닉네임 로드가 늦었을 때 기존 메시지 보정
  useEffect(() => {
    const myNickname = user?.username;
    if (!myNickname) return;

    setMessages((prev) => {
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
  }, [user?.username]);

  // STOMP 구독
  const subscribeToRoom = useCallback((roomId: string) => {
    if (!stompClientRef.current?.connected || !roomId) return;

    try {
      // 기존 구독 해제
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe();
        messageSubscriptionRef.current = null;
      }
      if (readSubscriptionRef.current) {
        readSubscriptionRef.current.unsubscribe();
        readSubscriptionRef.current = null;
      }

      // 메시지 스트림 구독
      const messageSubscription = stompClientRef.current.subscribe(
        `/sub/rooms/${roomId}`,
        (message) => {
          try {
            const data: StompChatMessage = JSON.parse(message.body);
            // 내 닉네임 추출 (토큰 payload의 sub 또는 userId)
            const getMyNicknameFromToken = (): string | null => {
              try {
                const token = getAccessToken();
                if (!token) return null;
                const payload = JSON.parse(atob(token.split(".")[1]));
                return (
                  payload?.sub || payload?.userId || payload?.username || null
                );
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
              user?.username ||
              storedUsername ||
              myNicknameRef.current ||
              getMyNicknameFromToken();

            // 입장/퇴장 메시지 체크
            const isJoinOrLeaveMessage =
              (data.message || "").includes("님이 입장했습니다.") ||
              (data.message || "").includes("님이 퇴장했습니다.");
            const isMyJoinOrLeaveMessage =
              isJoinOrLeaveMessage &&
              myNickname &&
              (data.message || "").includes(myNickname);

            const isMine = Boolean(
              data.mine ||
                (myNickname && data.senderNickname === myNickname) ||
                (myNicknameRef.current &&
                  data.senderNickname === myNicknameRef.current) ||
                isMyJoinOrLeaveMessage
            );

            // 표시명은 항상 서버 닉네임 사용 (내 메시지는 표시단에서 (나)만 붙임)
            const displaySenderName = data.senderNickname;

            // ChatMessage 형태로 변환
            const newMessage: ChatMessage = {
              id: data.chatId.toString(),
              senderName: displaySenderName,
              content: data.message,
              // 수신 직후 사용자 정보가 늦게 로드될 수 있으므로 임시 플래그라도 설정
              isMyMessage: isMine,
              senderId: data.senderNickname,
              messageType: data.messageType,
              images: data.images?.map((img) => img.imageUrl) || undefined,
              timeLabel: data.timeLabel,
              othersUnreadUsers: data.othersUnreadUsers,
              createdAt: data.createdAt,
            };

            // 중복 방지
            setMessages((prev) => {
              // 같은 ID가 이미 있으면 추가하지 않음
              const messageExists = prev.some(
                (msg) => msg.id === newMessage.id
              );
              if (messageExists) {
                return prev;
              }

              return [...prev, newMessage];
            });

            // 새 메시지가 추가되면 읽지 않은 사람 수 업데이트를 위한 이벤트 발생
            // ChatMessageList에서 이 이벤트를 감지하여 읽음 상태를 다시 조회하도록 함
            window.dispatchEvent(
              new CustomEvent("chatMessageAdded", {
                detail: { roomId, messageId: newMessage.id },
              })
            );

            // 시스템 메시지가 아닌 경우 자동 read-latest 호출 (400ms 디바운스)
            const isSystem = data.messageType
              ?.toUpperCase()
              .startsWith("SYSTEM");
            if (!isSystem && roomId) {
              scheduleReadLatest(roomId);
            }
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        }
      );

      messageSubscriptionRef.current = messageSubscription;

      // 읽음 영수증 스트림 구독
      const readSubscription = stompClientRef.current.subscribe(
        `/sub/rooms/${roomId}/read`,
        (message) => {
          try {
            const readReceipt = JSON.parse(message.body);

            // { roomId, readerId, lastReadChatId }
            if (
              !readReceipt ||
              !readReceipt.readerId ||
              typeof readReceipt.lastReadChatId !== "number"
            ) {
              return;
            }

            const prev = lastReadSeenRef.current.get(readReceipt.readerId) || 0;
            const cur = readReceipt.lastReadChatId;

            // 이미 처리한 읽음 영수증은 무시
            if (cur <= prev) {
              return;
            }

            lastReadSeenRef.current.set(readReceipt.readerId, cur);

            // (prev, cur] 범위의 메시지들의 othersUnreadUsers를 1씩 감소
            setMessages((prevMessages) => {
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

            // ✅ chatHistory도 동일하게 업데이트
            setChatHistory((prevHistory) => {
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
          } catch (error) {
            console.error("읽음 영수증 파싱 오류:", error);
          }
        }
      );

      readSubscriptionRef.current = readSubscription;
    } catch (error) {
      console.error("STOMP 구독 실패:", error);
    }
  }, []);

  // STOMP 연결 해제
  const disconnectStomp = useCallback(() => {
    if (messageSubscriptionRef.current) {
      messageSubscriptionRef.current.unsubscribe();
      messageSubscriptionRef.current = null;
    }

    if (readSubscriptionRef.current) {
      readSubscriptionRef.current.unsubscribe();
      readSubscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    // 자동 read-latest 타이머 정리
    if (readLatestTimerRef.current) {
      clearTimeout(readLatestTimerRef.current);
      readLatestTimerRef.current = null;
    }

    setStompConnected(false);
    lastReadSeenRef.current.clear();
  }, []);

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(
    async (targetRoomId?: string) => {
      const useRoomId = targetRoomId || roomId;
      if (!useRoomId) {
        return;
      }

      try {
        const response: ChatParticipant[] = await getChatParticipants(
          useRoomId
        );
        // 현재 사용자 username 가져오기
        const storedUsername =
          useAuthStore.getState().user?.nickname ||
          useAuthStore.getState().user?.username ||
          null;

        const currentUsername = user?.username || storedUsername;

        const convertedParticipants: Participant[] = response
          .map((participant) => {
            // "나 (nickname)" 형태에서 순수한 닉네임만 추출
            let cleanNickname = participant.nickname;
            if (cleanNickname.startsWith("나 (")) {
              cleanNickname = cleanNickname
                .replace("나 (", "")
                .replace(")", "");
            }

            // 서버에서 받은 닉네임을 그대로 사용하고, 내 계정이면 (나) 표기 추가
            const isMe = participant.me === true;
            const finalName = isMe ? `${cleanNickname} (나)` : cleanNickname;

            return {
              id: participant.userId,
              name: finalName, // 현재 사용자는 username 사용
              isMe: isMe, // 현재 사용자 표시
            } as Participant & { isMe: boolean };
          })
          .sort((a, b) => {
            // 현재 사용자를 맨 위로 정렬
            if ((a as any).isMe) return -1;
            if ((b as any).isMe) return 1;
            return 0;
          });

        // isMe 속성 제거하고 Participant 배열로 변환
        const finalParticipants = convertedParticipants.map((p) => {
          const { isMe, ...rest } = p as any;
          return rest as Participant;
        });
        setParticipants(finalParticipants);

        // 현재 사용자 찾기
        const currentUser = response.find((p) => p.me === true);

        if (currentUser) {
          // "나 (nickname)" -> nickname 으로 정규화하여 보관
          let myCleanNickname = currentUser.nickname;
          if (myCleanNickname.startsWith("나 (")) {
            myCleanNickname = myCleanNickname
              .replace("나 (", "")
              .replace(")", "");
          }
          myNicknameRef.current = myCleanNickname;
          const mutedState = getCafeMutePref(useRoomId);
          setIsMuted(mutedState);
        } else {
        }
      } catch (err) {
        console.error("참여자 목록 조회 실패:", err);
        setParticipants([]);
      }
    },
    [roomId, user?.username, setParticipants, setIsMuted, getCafeMutePref]
  );

  // 채팅 히스토리 로드 (커서 페이징)
  const loadMoreHistory = useCallback(
    async (targetRoomId?: string) => {
      const useRoomId = targetRoomId || roomId;
      if (!useRoomId || isLoadingHistory) {
        return;
      }

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

        // 응답 데이터 안전하게 처리
        const items = response.data?.content || [];
        const hasNext = response.data?.hasNext || false;

        // 새로운 히스토리를 기존 히스토리 뒤에 추가 (날짜 메시지 포함)
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
    [roomId, chatHistory, isLoadingHistory, cafeId]
  );

  // 채팅방 참여 (재시도 로직 포함)
  const joinChat = useCallback(
    async (retryCount = 0) => {
      // cafeId가 비어있거나 0이면 에러
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

      // joinChat 시작 시 항상 메시지/히스토리 초기화 (중복 방지)
      setChatHistory([]);
      setMessages([]);
      setHasMoreHistory(true);

      try {
        // 기존 매핑이 있어도 API를 호출하여 정확한 roomId 확인
        // 이전에 잘못된 매핑이 있을 수 있으므로 항상 API로 검증
        const existingRoomId = getRoomIdByCafe(parseInt(cafeId));
        if (existingRoomId) {
        }

        // 채팅방 참여 시도 (신규 생성 또는 기존 참여)
        // API가 이미 참여 중인 경우 alreadyJoined: true와 함께 기존 roomId 반환
        const response: ChatRoomJoinResponse = await joinCafeGroupChat(cafeId);

        // 응답 데이터 안전하게 처리
        if (!response || !response.data || !response.data.roomId) {
          console.error("채팅방 참여 응답에 roomId가 없습니다:", response);
          throw new Error("채팅방 참여 응답이 올바르지 않습니다.");
        }

        // API 응답에서 cafeId와 roomId 추출
        const responseCafeId = response.data.cafeId || parseInt(cafeId);
        const newRoomId = response.data.roomId.toString();

        setRoomId(newRoomId);
        setIsJoined(true);

        // 매핑 저장 - API 응답의 cafeId 사용
        setChatMapping(responseCafeId, parseInt(newRoomId));

        // 나간 채팅방인지 확인
        const leftKey = `cafe_${cafeId}`;
        const leftInfo = getRoomLeftPref(leftKey);

        if (leftInfo) {
          clearRoomLeftPref(leftKey);
          setHasMoreHistory(false);

          // 참여자 목록만 로드 (히스토리는 로드하지 않음)
          await refreshParticipants(newRoomId);
        } else {
          // 처음 입장하는 채팅방 - 히스토리 로드
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

        // 연결 완료 후 구독 (약간의 지연)
        setTimeout(() => {
          if (stompClientRef.current?.connected) {
            subscribeToRoom(newRoomId);
          } else {
            console.error("STOMP 연결이 완료되지 않음, 재시도...");
            setTimeout(() => {
              subscribeToRoom(newRoomId);
            }, 1000);
          }
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
            setTimeout(() => {
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
      getRoomLeftPref,
      clearRoomLeftPref,
    ]
  );

  // 채팅방 나가기
  const leaveChat = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 나가기 API 호출 - 반드시 성공해야 함
      await leaveChatRoomNew(roomId);

      // API 성공 후에만 로컬 스토리지에 기록
      const leftKey = `cafe_${cafeId}`;
      markRoomLeftPref(leftKey, {
        timestamp: Date.now(),
        cafeId,
        roomId,
      });

      // 매핑 제거
      removeChatMapping(parseInt(cafeId));

      // STOMP 연결 해제
      disconnectStomp();

      // 상태 완전 초기화
      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
      setChatHistory([]);
      setHasMoreHistory(true);
      setIsMuted(false);

      // joinChat 재호출 가능하도록 초기화
      joinedCafeIdRef.current = null;
    } catch (err) {
      console.error("=== 채팅방 나가기 API 실패 ===", err);

      // API 실패 시 로컬 저장소에 기록하지 않음
      // 사용자에게 명확한 에러 메시지 표시
      const errorMessage =
        err instanceof Error ? err.message : "채팅방 나가기에 실패했습니다.";

      setError(`나가기 실패: ${errorMessage}\n다시 시도해주세요.`);

      alert(
        `채팅방 나가기에 실패했습니다.\n\n${errorMessage}\n\n다시 시도해주세요.`
      );

      // 에러가 발생해도 STOMP는 해제
      disconnectStomp();

      throw err; // 에러를 상위로 전파하여 UI에서 처리
    } finally {
      setIsLoading(false);
    }
  }, [roomId, cafeId, disconnectStomp, markRoomLeftPref]);

  // 메시지 전송 (STOMP 발행)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!roomId || !content.trim()) {
        return;
      }

      // STOMP 연결 보장: 연결이 없으면 연결 시도 후 최대 5초 대기
      const waitForConnected = async (timeoutMs = 5000) => {
        const start = Date.now();
        while (!stompClientRef.current?.connected) {
          await new Promise((r) => setTimeout(r, 100));
          if (Date.now() - start > timeoutMs) break;
        }
        return Boolean(stompClientRef.current?.connected);
      };

      if (!stompClientRef.current?.connected) {
        try {
          await connectStomp();
        } catch (e) {
          console.error("STOMP 연결 시도 실패:", e);
        }
        const ok = await waitForConnected(5000);
        if (!ok) {
          return;
        }
      }

      try {
        // STOMP로 메시지 발행
        const client = stompClientRef.current;
        if (!client) {
          return;
        }

        client.publish({
          destination: `/pub/rooms/${roomId}`,
          body: JSON.stringify({
            message: content,
            roomId: parseInt(roomId),
          }),
        });
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
        const response = await createDmChat(counterpartId);

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

      // 서버에 muted 값 업데이트
      await toggleChatMute(roomId, newMutedState);

      // 로컬 상태 업데이트
      setIsMuted(newMutedState);
      setCafeMutePref(roomId, newMutedState);
    } catch (err) {
      console.error("채팅방 알림 설정 실패:", err);
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      setCafeMutePref(roomId, newMutedState);
    }
  }, [roomId, isMuted, setCafeMutePref]);

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

        setMessages((prevMessages) => {
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
        setChatHistory((prevHistory) => {
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
      } else {
      }
    } catch (err) {
      console.error("채팅 읽음 처리 실패:", err);
    }
  }, [roomId, messages, chatHistory]);

  // roomId가 설정되면 STOMP 구독
  useEffect(() => {
    if (roomId && stompConnected && stompClientRef.current?.connected) {
      subscribeToRoom(roomId);
    }
  }, [roomId, stompConnected, subscribeToRoom]);

  // 초기 채팅방 참여 - cafeId가 변경될 때만 실행
  useEffect(() => {
    // React Strict Mode 대응: 같은 cafeId로 이미 joinChat을 시도했으면 무시
    if (cafeId && !isJoined && !isLoading && !isJoining) {
      if (joinedCafeIdRef.current === cafeId) {
        return;
      }
      joinedCafeIdRef.current = cafeId;
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
    markAsRead,
  };
};
