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
import { markChatAsRead } from "@/lib/api";
import { ChatMessage, Participant } from "@/types/chat";
import {
  setDmChatMapping,
  getRoomIdByCounterpart,
  getCounterpartByRoom,
  removeDmChatMapping,
  debugDmMappings,
  removeInvalidMappings,
} from "@/utils/dmChatMapping";
import {
  createStompClient,
  StompSubscription,
  ChatMessage as StompChatMessage,
} from "@/lib/stompClient";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/contexts/AuthContext";

interface UseDmChatProps {
  counterpartId: string;
  counterpartName: string;
  existingRoomId?: string; // 마이페이지에서 이미 존재하는 채팅방의 roomId
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
  markAsRead: () => Promise<void>;
}

export const useDmChat = ({
  counterpartId,
  counterpartName,
  existingRoomId,
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
    (targetRoomId: string) => {
      // roomId가 "1"인 경우 구독하지 않음 (잘못된 상태)
      if (targetRoomId === "1") {
        console.error("❌ subscribeToRoom: 잘못된 roomId(1) 구독 시도 차단!");
        return;
      }

      if (!stompClientRef.current?.connected || !targetRoomId) {
        return;
      }

      // 현재 활성화된 roomId와 일치하는지 확인
      if (roomId && roomId !== targetRoomId) {
        console.warn(
          `⚠️ STOMP 구독 대상 roomId(${targetRoomId})가 현재 활성화된 roomId(${roomId})와 일치하지 않음. 구독 중단.`
        );
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
          `/sub/rooms/${targetRoomId}`,
          (message) => {
            try {
              const data: StompChatMessage = JSON.parse(message.body);

              // mine 속성을 올바르게 판단 (메시지를 받을 때마다 최신 사용자 정보 사용)
              let isMyMessage = data.mine === true;

              if (!isMyMessage) {
                // 1) 사용자 ID 비교 (가장 확실) - 메시지를 받을 때마다 최신 정보 가져오기
                let myId: string | null = null;
                // 먼저 useAuth의 user 객체 확인 (가장 신뢰 가능)
                try {
                  const token = localStorage.getItem("accessToken");
                  if (token) {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    myId =
                      payload?.sub || payload?.userId || payload?.id || null;
                  }
                } catch {}
                // 로컬 스토리지에서도 확인
                if (!myId) {
                  try {
                    const stored = localStorage.getItem("userInfo");
                    if (stored) {
                      const parsed = JSON.parse(stored);
                      myId = parsed?.id || null;
                    }
                  } catch {}
                }

                const senderIdFromServer: string | null =
                  (data as any)?.senderId ||
                  (data as any)?.senderUserId ||
                  null;
                if (
                  myId &&
                  senderIdFromServer &&
                  String(myId) === String(senderIdFromServer)
                ) {
                  isMyMessage = true;
                }

                // 2) 닉네임 후보 수집: useAuth, 로컬스토리지, 토큰 - 메시지를 받을 때마다 최신 정보 가져오기
                let storedUsername: string | null = null;
                try {
                  const stored = localStorage.getItem("userInfo");
                  if (stored)
                    storedUsername = JSON.parse(stored)?.username || null;
                } catch {}
                let tokenName: string | null = null;
                try {
                  const token = localStorage.getItem("accessToken");
                  if (token) {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    tokenName = payload?.nickname || payload?.username || null;
                  }
                } catch {}
                // useAuth의 currentUserNickname도 포함
                const myNameCandidates = [
                  currentUserNickname,
                  storedUsername,
                  tokenName,
                ].filter(Boolean) as string[];

                if (!isMyMessage && myNameCandidates.length > 0) {
                  const sender = (data.senderNickname || "").trim();
                  isMyMessage = myNameCandidates.some(
                    (n) => (n || "").trim() === sender
                  );
                }
              }

              // 날짜 메시지인지 확인하는 함수
              const isDateMessage = (content: string): boolean => {
                // 한국어 날짜 형식 패턴: "YYYY년 MM월 DD일" 또는 "YYYY-MM-DD"
                const datePattern =
                  /^\d{4}년\s?\d{1,2}월\s?\d{1,2}일$|^\d{4}-\d{2}-\d{2}$/;
                return datePattern.test(content.trim());
              };

              // 날짜 메시지는 필터링하여 제외
              if (isDateMessage(data.message || "")) {
                return;
              }

              // ChatMessage 형태로 변환
              const newMessage: ChatMessage = {
                id: data.chatId.toString(),
                senderName: data.senderNickname,
                content: data.message,
                isMyMessage: isMyMessage,
                senderId: data.senderNickname,
                messageType: data.messageType,
                images: data.images?.map((img) => img.imageUrl) || undefined,
              };

              // 중복 메시지 방지
              setMessages((prev) => {
                const messageExists = prev.some(
                  (msg) => msg.id === newMessage.id
                );
                if (messageExists) {
                  return prev;
                }
                return [...prev, newMessage];
              });
            } catch (error) {
              console.error("1:1 채팅 메시지 파싱 오류:", error);
            }
          }
        );

        subscriptionRef.current = subscription;
      } catch (error) {
        console.error("1:1 채팅 STOMP 구독 실패:", error);
      }
    },
    [currentUserNickname, roomId, user, currentUserId]
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

  // 채팅방별 muted 상태를 로컬 스토리지에서 가져오기
  const getMutedStateFromStorage = useCallback(
    (targetRoomId: string): boolean => {
      const key = `chat_muted_${targetRoomId}`;
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const muted = stored === "true";
        console.log(
          `🔔 DM 로컬 스토리지에서 muted 상태 로드: ${muted} (${targetRoomId})`
        );
        return muted;
      }
      console.log(
        `🔔 DM 로컬 스토리지에 muted 상태 없음 - 기본값 false (${targetRoomId})`
      );
      return false;
    },
    []
  );

  // 채팅방별 muted 상태를 로컬 스토리지에 저장
  const saveMutedStateToStorage = useCallback(
    (targetRoomId: string, muted: boolean): void => {
      const key = `chat_muted_${targetRoomId}`;
      localStorage.setItem(key, String(muted));
      console.log(
        `🔔 DM 로컬 스토리지에 muted 상태 저장: ${muted} (${targetRoomId})`
      );
    },
    []
  );

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(async () => {
    if (!roomId) {
      return;
    }

    try {
      const response = await getChatParticipants(roomId);

      const participantList: Participant[] = response.map(
        (p: ChatParticipant) => ({
          id: p.userId,
          name: p.nickname, // 순수한 닉네임만 사용
        })
      );

      setParticipants(participantList);
      setParticipantCount(participantList.length);

      // 현재 사용자 찾기
      const currentUser = response.find((p) => p.me === true);

      if (currentUser) {
        // 로컬 스토리지에서 muted 상태 가져오기 (서버가 반환하지 않으므로)
        const mutedState = getMutedStateFromStorage(roomId);
        setIsMuted(mutedState);
      }
    } catch (err) {
      console.error("1:1 채팅 참여자 목록 새로고침 실패:", err);
    }
  }, [roomId, getMutedStateFromStorage, user, currentUserId]);

  // 채팅 히스토리 로딩
  const loadMoreHistory = useCallback(async () => {
    if (!roomId || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      // 현재 채팅 히스토리 상태를 직접 참조
      setChatHistory((currentHistory) => {
        const lastMessageId =
          currentHistory.length > 0
            ? currentHistory[currentHistory.length - 1].chatId.toString()
            : undefined;

        // 비동기로 히스토리 로드
        getChatHistory(roomId, lastMessageId)
          .then((response) => {
            console.log("1:1 채팅 히스토리 응답:", response);

            if (response.data.content.length > 0) {
              // 날짜 메시지인지 확인하는 함수
              const isDateMessage = (content: string): boolean => {
                // 한국어 날짜 형식 패턴: "YYYY년 MM월 DD일" 또는 "YYYY-MM-DD"
                const datePattern =
                  /^\d{4}년\s?\d{1,2}월\s?\d{1,2}일$|^\d{4}-\d{2}-\d{2}$/;
                return datePattern.test(content.trim());
              };

              // 날짜 메시지를 필터링하여 제외
              const filteredContent = response.data.content.filter(
                (msg: ChatHistoryMessage) => !isDateMessage(msg.message)
              );

              setChatHistory((prev) => [...prev, ...filteredContent]);
              setHasMoreHistory(response.data.hasNext);

              // 히스토리 메시지를 ChatMessage 형태로 변환 (날짜 메시지 제외)
              const historyMessages: ChatMessage[] = filteredContent.map(
                (msg: ChatHistoryMessage) => ({
                  id: msg.chatId.toString(),
                  senderName: msg.senderNickname,
                  content: msg.message,
                  isMyMessage: msg.mine,
                  senderId: msg.senderNickname,
                  messageType: msg.messageType,
                  images: msg.images?.map((img) => img.imageUrl) || undefined,
                })
              );

              setMessages((prev) => [...historyMessages, ...prev]);
              console.log(
                "1:1 채팅 히스토리 로딩 완료:",
                historyMessages.length,
                "개 메시지"
              );
            } else {
              console.log("더 이상 로드할 히스토리가 없음");
              setHasMoreHistory(false);
            }
          })
          .catch((err) => {
            console.error("1:1 채팅 히스토리 로딩 실패:", err);
            setHasMoreHistory(false);
          })
          .finally(() => {
            setIsLoadingHistory(false);
          });

        return currentHistory; // 현재 상태 유지
      });
    } catch (err) {
      console.error("1:1 채팅 히스토리 로딩 실패:", err);
      setHasMoreHistory(false);
      setIsLoadingHistory(false);
    }
  }, [roomId, isLoadingHistory]);

  // 1:1 채팅방 참여
  const joinChat = useCallback(async () => {
    // 이미 참여 중이거나 로딩 중이면 중복 호출 방지
    if (isJoined || isLoading) {
      return;
    }
    // 이전 채팅방이 있고 새로운 채팅방으로 전환하는 경우 정리
    if (roomId && existingRoomId && roomId !== existingRoomId) {
      console.log("🔔 채팅방 전환: 이전 채팅방 정리", {
        previousRoomId: roomId,
        newRoomId: existingRoomId,
      });
      // 이전 STOMP 구독 해제
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // 채팅방 데이터 및 상태 초기화 - 새 채팅방 준비
      setMessages([]);
      setChatHistory([]);
      setParticipants([]);
      setParticipantCount(0);
      setRoomId(null);
      setIsJoined(false);
      console.log("🔔 새 채팅방을 위해 상태 완전 초기화");
    }

    // 마이페이지에서 이미 존재하는 채팅방인 경우
    if (existingRoomId) {
      setIsLoading(true);
      setError(null);

      // 이전 메시지 초기화
      setMessages([]);
      setChatHistory([]);
      setParticipants([]);
      setParticipantCount(0);

      setRoomId(existingRoomId);
      setIsJoined(true);

      try {
        // 참여자 목록 로드
        const participantsResponse = await getChatParticipants(existingRoomId);
        const participantList: Participant[] = participantsResponse.map(
          (p: ChatParticipant) => ({
            id: p.userId,
            name: p.nickname,
          })
        );
        setParticipants(participantList);
        setParticipantCount(participantList.length);

        // 참여자 목록 로드 후 refreshParticipants를 호출하여 상태 동기화
        // (user 정보가 준비되지 않았을 경우를 대비)
        const targetRoomIdForExisting = existingRoomId;
        setTimeout(() => {
          // roomId가 여전히 유효한지 확인
          if (roomId === targetRoomIdForExisting) {
            refreshParticipants();
          }
        }, 100);

        // 채팅 히스토리 로드
        const historyResponse = await getChatHistory(existingRoomId);
        if (historyResponse.data.content.length > 0) {
          // 날짜 메시지인지 확인하는 함수
          const isDateMessage = (content: string): boolean => {
            const datePattern =
              /^\d{4}년\s?\d{1,2}월\s?\d{1,2}일$|^\d{4}-\d{2}-\d{2}$/;
            return datePattern.test(content.trim());
          };

          // 날짜 메시지를 필터링하여 제외 (입장/퇴장 메시지는 포함)
          const filteredContent = historyResponse.data.content.filter(
            (msg: ChatHistoryMessage) => !isDateMessage(msg.message)
          );

          // 입장/퇴장 메시지 디버깅
          const joinMessages = filteredContent.filter((msg) =>
            msg.message.includes("님이 입장했습니다.")
          );
          const leaveMessages = filteredContent.filter((msg) =>
            msg.message.includes("님이 퇴장했습니다.")
          );
          console.log("1:1 채팅 히스토리 입장/퇴장 메시지:", {
            전체메시지수: filteredContent.length,
            입장메시지수: joinMessages.length,
            퇴장메시지수: leaveMessages.length,
            입장메시지: joinMessages.map((m) => m.message),
            퇴장메시지: leaveMessages.map((m) => m.message),
          });

          setChatHistory(filteredContent);
          setHasMoreHistory(historyResponse.data.hasNext);
        }
        // existingRoomId가 있으면 마이페이지이므로 messages는 비워둠 (ChatMessageList에서 chatHistory를 변환)
        // existingRoomId가 없으면 PrivateChatModal이므로 messages에 히스토리를 넣음
        setMessages([]);

        // STOMP 연결
        await connectStomp();
        setIsLoading(false);
        return;
      } catch (err) {
        console.error("기존 채팅방 로드 실패:", err);
        setError("채팅방 로드에 실패했습니다.");
        setIsLoading(false);
        return;
      }
    }

    // counterpartId 유효성 검사 (최소한만 확인)
    if (
      !counterpartId ||
      counterpartId.trim() === "" ||
      counterpartId === "user-me" ||
      counterpartId === "user-1"
    ) {
      const errorMsg = `유효하지 않은 상대방 ID: ${counterpartId}`;
      console.error("=== 1:1 채팅방 참여 실패 ===", {
        counterpartId,
        counterpartName,
        errorMsg,
        counterpartIdType: typeof counterpartId,
        counterpartIdLength: counterpartId?.length,
      });
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 먼저 모든 잘못된 매핑 제거
      removeInvalidMappings();

      let existingRoomIdFromMapping = getRoomIdByCounterpart(counterpartId);

      if (existingRoomIdFromMapping) {
        setRoomId(existingRoomIdFromMapping.toString());
        setIsJoined(true);

        try {
          // 참여자 목록 로드
          const participantsResponse = await getChatParticipants(
            existingRoomIdFromMapping.toString()
          );
          const participantList: Participant[] = participantsResponse.map(
            (p: ChatParticipant) => ({
              id: p.userId,
              name: p.nickname, // 순수한 닉네임만 사용
            })
          );
          setParticipants(participantList);
          setParticipantCount(participantList.length);

          // 참여자 목록 로드 후 refreshParticipants를 호출하여 상태 동기화
          // (user 정보가 준비되지 않았을 경우를 대비)
          const targetRoomId = existingRoomIdFromMapping.toString();
          setTimeout(() => {
            // roomId가 여전히 유효한지 확인
            if (roomId === targetRoomId) {
              refreshParticipants();
            }
          }, 100);

          // 채팅 히스토리 로드
          const historyResponse = await getChatHistory(
            existingRoomIdFromMapping.toString()
          );
          let hasJoinMessage = false;
          if (historyResponse.data.content.length > 0) {
            // 날짜 메시지인지 확인하는 함수
            const isDateMessage = (content: string): boolean => {
              const datePattern =
                /^\d{4}년\s?\d{1,2}월\s?\d{1,2}일$|^\d{4}-\d{2}-\d{2}$/;
              return datePattern.test(content.trim());
            };

            // 날짜 메시지를 필터링하여 제외 (입장/퇴장 메시지는 포함)
            const filteredContent = historyResponse.data.content.filter(
              (msg: ChatHistoryMessage) => !isDateMessage(msg.message)
            );

            // 입장 메시지가 있는지 확인
            hasJoinMessage = filteredContent.some((msg) =>
              msg.message.includes("님이 입장했습니다.")
            );

            setChatHistory(filteredContent);
            setHasMoreHistory(historyResponse.data.hasNext);

            // PrivateChatModal에서는 messages에 히스토리를 넣어야 표시됨
            // 입장/퇴장 메시지를 포함하여 변환
            const historyMessages: ChatMessage[] = filteredContent.map(
              (msg: ChatHistoryMessage) => ({
                id: msg.chatId.toString(),
                senderName: msg.senderNickname,
                content: msg.message,
                isMyMessage: msg.mine,
                senderId: msg.senderNickname,
                messageType: msg.messageType,
                images: msg.images?.map((img) => img.imageUrl) || undefined,
              })
            );
            setMessages(historyMessages);
          } else {
            setMessages([]);
          }

          // STOMP 연결 후 입장 메시지가 없으면 발송
          if (!hasJoinMessage && currentUserNickname) {
            setTimeout(() => {
              sendMessage(`${currentUserNickname}님이 입장했습니다.`);
            }, 300);
          }
        } catch (dataLoadError) {
          console.error("기존 1:1 채팅방 데이터 로드 실패:", dataLoadError);
        }

        try {
          await connectStomp();
        } catch (stompError) {
          console.warn("기존 1:1 채팅방 STOMP 연결 실패:", stompError);
        }
        return;
      }

      // createDmChat API 호출
      let response;
      let newRoomId: string | null = null;

      try {
        response = await createDmChat(counterpartId);
        // 응답 검증: roomId가 1이면 에러
        if (response.data.roomId === 1) {
          throw new Error(
            "백엔드에서 잘못된 roomId(1)를 반환했습니다. counterpartId를 확인해주세요."
          );
        }
        newRoomId = response.data.roomId.toString();
      } catch (createError: any) {
        // 이미 참여 중인 경우 (Duplicate entry 에러) - 조용히 처리
        if (createError?.isDuplicateEntry) {
          // 에러에서 추출한 roomId 사용 또는 매핑에서 찾기
          if (createError.roomId) {
            newRoomId = createError.roomId;
          } else {
            // 매핑에서 기존 채팅방 찾기
            const existingRoomIdFromMapping =
              getRoomIdByCounterpart(counterpartId);
            if (existingRoomIdFromMapping) {
              newRoomId = existingRoomIdFromMapping.toString();
            } else {
              // 매핑도 없으면 참여자 목록 API로 기존 채팅방 찾기 시도
              // 이 경우는 무시하고 기존 채팅방 로직으로 처리
              // (이미 참여 중이므로 매핑이나 다른 방법으로 찾을 수 있어야 함)
            }
          }

          // roomId를 찾지 못한 경우, 약간의 지연 후 재시도 (React Strict Mode 대응)
          // 첫 번째 요청이 성공해서 매핑이 저장되었을 수 있음
          if (!newRoomId) {
            // 200ms 후 매핑이 업데이트되었는지 확인
            await new Promise((resolve) => setTimeout(resolve, 200));
            const retryRoomId = getRoomIdByCounterpart(counterpartId);
            if (retryRoomId) {
              newRoomId = retryRoomId.toString();
            }
          }

          // 여전히 roomId를 찾지 못한 경우, 성공한 요청의 응답을 확인
          // React Strict Mode에서 첫 번째 요청이 성공했을 수 있음
          if (!newRoomId) {
            // 에러가 발생했지만 실제로는 채팅방이 생성되었을 수 있음
            // 이 경우 사용자에게 에러를 보여주지 않고 정상적으로 처리
            // roomId를 찾기 위해 다시 매핑 확인 (약간 더 긴 지연)
            await new Promise((resolve) => setTimeout(resolve, 300));
            const finalRetryRoomId = getRoomIdByCounterpart(counterpartId);
            if (finalRetryRoomId) {
              newRoomId = finalRetryRoomId.toString();
            }
          }

          // 기존 채팅방으로 처리하기 위해 응답 객체 생성
          if (newRoomId) {
            response = {
              data: { roomId: parseInt(newRoomId) },
            };
            // 에러 상태 초기화 (이미 참여 중인 경우는 정상 상황)
            setError(null);
          } else {
            // roomId를 찾을 수 없는 경우만 에러로 처리
            throw createError;
          }
        } else {
          // 다른 에러는 그대로 throw
          throw createError;
        }
      }

      if (!newRoomId) {
        throw new Error("채팅방 ID를 가져올 수 없습니다.");
      }

      setRoomId(newRoomId);
      setIsJoined(true);

      // 참여자 목록을 즉시 로드하여 사이드바에 반영
      try {
        const participantsResponse = await getChatParticipants(newRoomId);
        const participantList: Participant[] = participantsResponse.map(
          (p: ChatParticipant) => ({
            id: p.userId,
            name: p.nickname, // 순수한 닉네임만 사용
          })
        );
        setParticipants(participantList);
        setParticipantCount(participantList.length);

        // 참여자 목록 로드 후 refreshParticipants를 호출하여 상태 동기화
        // (user 정보가 준비되지 않았을 경우를 대비)
        const targetRoomIdForNew = newRoomId;
        setTimeout(() => {
          // roomId가 여전히 유효한지 확인
          if (roomId === targetRoomIdForNew) {
            refreshParticipants();
          }
        }, 100);
      } catch (e) {
        console.error("새 채팅방 참여자 목록 로드 실패:", e);
      }

      // 매핑 저장
      setDmChatMapping(counterpartId, parseInt(newRoomId));

      // STOMP 연결 및 구독
      await connectStomp();
      if (response.data.roomId) {
        subscribeToRoom(response.data.roomId.toString());
      }

      // 새 채팅방의 히스토리 로드
      try {
        const historyResponse = await getChatHistory(newRoomId);
        let hasJoinMessage = false;
        if (historyResponse.data.content.length > 0) {
          // 날짜 메시지인지 확인하는 함수
          const isDateMessage = (content: string): boolean => {
            const datePattern =
              /^\d{4}년\s?\d{1,2}월\s?\d{1,2}일$|^\d{4}-\d{2}-\d{2}$/;
            return datePattern.test(content.trim());
          };

          // 날짜 메시지를 필터링하여 제외 (입장/퇴장 메시지는 포함)
          const filteredContent = historyResponse.data.content.filter(
            (msg: ChatHistoryMessage) => !isDateMessage(msg.message)
          );

          // 입장 메시지가 있는지 확인
          hasJoinMessage = filteredContent.some((msg) =>
            msg.message.includes("님이 입장했습니다.")
          );

          setChatHistory(filteredContent);
          setHasMoreHistory(historyResponse.data.hasNext);

          // PrivateChatModal에서는 messages에 히스토리를 넣어야 표시됨
          // 입장/퇴장 메시지를 포함하여 변환
          const historyMessages: ChatMessage[] = filteredContent.map(
            (msg: ChatHistoryMessage) => ({
              id: msg.chatId.toString(),
              senderName: msg.senderNickname,
              content: msg.message,
              isMyMessage: msg.mine,
              senderId: msg.senderNickname,
              messageType: msg.messageType,
              images: msg.images?.map((img) => img.imageUrl) || undefined,
            })
          );
          setMessages(historyMessages);
        } else {
          setChatHistory([]);
          setHasMoreHistory(false);
          setMessages([]);
        }

        // 입장 메시지가 없으면 입장 메시지 발송
        if (!hasJoinMessage && currentUserNickname) {
          setTimeout(() => {
            sendMessage(`${currentUserNickname}님이 입장했습니다.`);
          }, 300);
        }
      } catch (historyError) {
        console.error("새 채팅방 히스토리 로드 실패:", historyError);
        setChatHistory([]);
        setMessages([]);
      }

      // 성공적으로 완료되었으므로 에러 상태 명시적으로 초기화
      setError(null);
    } catch (err: any) {
      // 이미 참여 중인 경우(isDuplicateEntry)는 내부 catch 블록에서 처리되었으므로 여기까지 오지 않음
      // 하지만 안전을 위해 다시 한 번 확인
      if (err?.isDuplicateEntry) {
        // 이미 처리된 경우이므로 에러를 표시하지 않음
        setError(null);
        return;
      }
      // 다른 에러만 처리
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
    isJoined,
    isLoading,
    roomId,
    connectStomp,
    subscribeToRoom,
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
      setIsMuted(false); // 알림 상태 초기화
      setError(null);

      console.log("1:1 채팅방 나가기 완료");
    } catch (err) {
      console.error("1:1 채팅방 나가기 실패:", err);

      // API 에러가 발생해도 로컬 상태는 초기화 (사용자 경험 개선)
      removeDmChatMapping(counterpartId);
      disconnectStomp();

      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
      setChatHistory([]);
      setError(null);

      console.log("1:1 채팅방 나가기 완료 (에러 발생했지만 상태 초기화)");
    }
  }, [roomId, counterpartId, disconnectStomp]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !roomId) {
        return;
      }

      // STOMP 연결 상태 확인
      if (!stompClientRef.current?.connected) {
        setError("채팅 연결이 끊어졌습니다. 다시 시도해주세요.");
        return;
      }

      try {
        // STOMP로 메시지 발행
        stompClientRef.current.publish({
          destination: `/pub/rooms/${roomId}`,
          body: JSON.stringify({ message }),
        });
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
      const newMutedState = !isMuted;
      console.log("🔔 DM 알림 토글 시작:", newMutedState ? "끄기" : "켜기");

      // 서버에 muted 값 업데이트
      await toggleChatMute(roomId, newMutedState);

      // 로컬 상태 업데이트
      setIsMuted(newMutedState);

      // 로컬 스토리지에 저장 (새로고침 시 유지)
      saveMutedStateToStorage(roomId, newMutedState);

      console.log("🔔 DM 알림 토글 완료:", newMutedState ? "끄기" : "켜기");
    } catch (err) {
      console.error("1:1 채팅 알림 토글 실패:", err);
      // 에러가 발생해도 UI 상태는 변경 (사용자 경험 개선)
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      saveMutedStateToStorage(roomId, newMutedState);
      console.log("API 에러로 인한 로컬 상태 변경");
    }
  }, [roomId, isMuted, saveMutedStateToStorage]);

  // 이전 existingRoomId 추적
  const previousExistingRoomIdRef = useRef<string | undefined>(undefined);

  // existingRoomId가 바뀔 때 이전 채팅방 상태 정리 및 새 채팅방 준비
  useEffect(() => {
    if (!existingRoomId) return;

    // 이전과 같은 경우 무시
    if (previousExistingRoomIdRef.current === existingRoomId) {
      return;
    }

    console.log("🔔 existingRoomId 변경 감지:", {
      previousExistingRoomId: previousExistingRoomIdRef.current,
      currentRoomId: roomId,
      newExistingRoomId: existingRoomId,
    });

    // 이전 채팅방 STOMP 구독 해제
    if (subscriptionRef.current) {
      console.log("🔔 이전 채팅방 STOMP 구독 해제");
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // 상태 초기화하여 새 채팅방 준비
    setIsJoined(false);
    setRoomId(null);
    setMessages([]);
    setChatHistory([]);
    setParticipants([]);
    setParticipantCount(0);
    setError(null);

    // 이전 existingRoomId 업데이트
    previousExistingRoomIdRef.current = existingRoomId;
  }, [existingRoomId]);

  // existingRoomId가 바뀔 때 새로운 채팅방 참여 시작
  useEffect(() => {
    if (!existingRoomId) return;

    console.log("🔔 existingRoomId가 변경되어 채팅방 참여 시작:", {
      existingRoomId,
      currentRoomId: roomId,
      isJoined,
      isLoading,
    });

    // 상태가 준비되었고 아직 조인되지 않은 경우에만 조인
    if (!isJoined && !isLoading && !error) {
      console.log("🔔 새 채팅방 자동 조인 시작");
      joinChat();
    }
  }, [existingRoomId, isJoined, isLoading, error, joinChat, roomId]);

  // roomId가 설정되면 STOMP 구독
  useEffect(() => {
    // roomId가 "1"인 경우 구독하지 않음 (잘못된 상태)
    if (roomId === "1") {
      console.warn("⚠️ 잘못된 roomId(1) 감지, STOMP 구독 중단");
      return;
    }

    if (roomId && stompConnected && stompClientRef.current?.connected) {
      subscribeToRoom(roomId);
    }
  }, [roomId, stompConnected, subscribeToRoom]);

  // 초기 데이터 로드는 joinChat 함수에서 처리하므로 여기서는 제거

  // 채팅 읽음 처리
  const markAsRead = useCallback(async () => {
    if (!roomId) return;

    try {
      // 현재 메시지 목록에서 가장 최근 메시지의 ID를 찾음
      const allMessages = [...messages, ...chatHistory];
      if (allMessages.length === 0) return;

      // 메시지를 시간순으로 정렬하여 가장 최근 메시지 찾기
      const sortedMessages = allMessages.sort((a, b) => {
        const aId = "id" in a ? parseInt(a.id) : a.chatId;
        const bId = "id" in b ? parseInt(b.id) : b.chatId;
        return aId - bId;
      });

      // 내가 보낸 메시지가 아닌 가장 최근 메시지를 찾기
      const lastUnreadMessage = [...sortedMessages]
        .reverse()
        .find((message) => {
          const isMyMessage =
            "isMyMessage" in message ? message.isMyMessage : message.mine;
          return !isMyMessage;
        });

      if (lastUnreadMessage) {
        const messageId =
          "id" in lastUnreadMessage
            ? lastUnreadMessage.id
            : lastUnreadMessage.chatId.toString();
        await markChatAsRead(roomId, messageId);
        console.log("DM 채팅 읽음 처리 완료:", {
          roomId,
          lastReadChatId: messageId,
          messageContent:
            "content" in lastUnreadMessage
              ? lastUnreadMessage.content
              : lastUnreadMessage.message,
        });
      }
    } catch (err) {
      console.error("DM 채팅 읽음 처리 실패:", err);
    }
  }, [roomId, messages, chatHistory]);

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
    markAsRead,
  };
};
