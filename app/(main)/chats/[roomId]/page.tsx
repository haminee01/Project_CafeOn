"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Client, IMessage } from "@stomp/stompjs";
import {
  getChatHistory,
  patchReadStatus,
  getChatRoomIdByCafeId,
  sendChatMessage,
} from "@/api/chat";
import { ChatHistoryMessage } from "@/api/chat";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const jump = searchParams.get("jump"); // "33" 같은 문자열

  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const latestIdRef = useRef<number>(0);
  const stompClientRef = useRef<Client | null>(null);

  const token = localStorage.getItem("accessToken") || "";
  const wsUrl = useMemo(() => "ws://localhost:8080/stomp/chats", []);

  // 인증 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("인증 토큰이 없어서 로그인 페이지로 리다이렉트");
      router.push("/login");
      return;
    }
  }, [router]);

  // 히스토리 로드
  const loadHistory = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    try {
      console.log("딥링크 채팅 페이지 - 히스토리 로드 시작:", { roomId, jump });

      const response = await getChatHistory(roomId, undefined, 50, true);
      const messages = response.data.content || [];

      // chatId 순으로 정렬 (오래된 → 최신)
      messages.sort(
        (a: ChatHistoryMessage, b: ChatHistoryMessage) => a.chatId - b.chatId
      );

      setChatHistory(messages);

      if (messages.length > 0) {
        latestIdRef.current = messages[messages.length - 1].chatId;
      }

      console.log(`히스토리 로드 완료: ${messages.length}개 메시지`);

      // jump가 있으면 해당 chatId로 스크롤
      if (jump) {
        setTimeout(() => {
          const targetElement = document.querySelector(
            `[data-chat-id="${jump}"]`
          );
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            console.log(`jump=${jump}로 스크롤 완료`);
          } else {
            console.log(`jump=${jump}에 해당하는 요소를 찾을 수 없음`);
          }
        }, 100);
      } else {
        // jump가 없으면 맨 아래로 스크롤
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
        }, 100);
      }

      // 최신을 보고 있으면 읽음 처리
      if (latestIdRef.current) {
        await patchReadStatus(roomId, latestIdRef.current);
        console.log("읽음 처리 완료:", latestIdRef.current);
      }
    } catch (err) {
      console.error("히스토리 로드 실패:", err);
      setError("채팅 히스토리를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, jump]);

  // STOMP 연결 및 구독
  const connectWebSocket = useCallback(() => {
    if (!roomId || !token) {
      console.log("roomId 또는 token이 없어서 WebSocket 연결 건너뜀");
      return;
    }

    console.log("딥링크 채팅 페이지 - WebSocket 연결 시작:", { roomId, wsUrl });

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: token,
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000, // 5초 후 재연결 시도
    });

    client.onConnect = () => {
      console.log("WebSocket 연결 성공");
      setIsConnected(true);

      // 방 구독
      const roomSubscription = client.subscribe(
        `/sub/rooms/${roomId}`,
        (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body) as ChatHistoryMessage;
            console.log("새 메시지 수신:", data);

            setChatHistory((prev) => {
              // 중복 메시지 방지
              if (prev.find((x) => x.chatId === data.chatId)) return prev;

              const newHistory = [...prev, data].sort(
                (a, b) => a.chatId - b.chatId
              );
              latestIdRef.current = Math.max(latestIdRef.current, data.chatId);
              return newHistory;
            });

            // 최신을 보고 있으면 읽음 처리 및 스크롤
            if (chatRef.current) {
              const nearBottom =
                chatRef.current.scrollHeight -
                  chatRef.current.scrollTop -
                  chatRef.current.clientHeight <
                20;

              if (nearBottom && data.messageType === "TEXT") {
                patchReadStatus(roomId, latestIdRef.current);
              }

              // 스크롤 따라가기
              if (nearBottom) {
                setTimeout(() => {
                  if (chatRef.current) {
                    chatRef.current.scrollTop = chatRef.current.scrollHeight;
                  }
                }, 100);
              }
            }
          } catch (err) {
            console.error("메시지 파싱 실패:", err);
          }
        }
      );

      // 개인 알림 구독
      const notificationSubscription = client.subscribe(
        `/user/queue/notifications`,
        (msg: IMessage) => {
          console.log("개인 알림 수신:", msg.body);
          // 필요시 알림 처리 로직 추가
        }
      );

      // 구독 정보 저장
      (client as any).__subscriptions = [
        roomSubscription,
        notificationSubscription,
      ];
    };

    client.onStompError = (frame) => {
      console.error("STOMP 에러:", frame);
      setIsConnected(false);

      // 에러 메시지 표시
      if (frame.headers && frame.headers.message) {
        setError(`WebSocket 연결 실패: ${frame.headers.message}`);
      } else {
        setError("WebSocket 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    };

    client.onDisconnect = () => {
      console.log("WebSocket 연결 해제");
      setIsConnected(false);
    };

    client.onWebSocketError = (error) => {
      console.error("WebSocket 에러:", error);
      setIsConnected(false);
      setError("WebSocket 연결에 실패했습니다.");
    };

    try {
      client.activate();
      stompClientRef.current = client;
    } catch (err) {
      console.error("STOMP 클라이언트 활성화 실패:", err);
      setError("실시간 채팅 연결에 실패했습니다.");
    }
  }, [roomId, token, wsUrl]);

  // 메시지 전송
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      console.log("메시지 전송:", { roomId, content: newMessage });
      await sendChatMessage(roomId, newMessage);
      setNewMessage("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      setError("메시지 전송에 실패했습니다.");
    }
  }, [newMessage, roomId]);

  // 초기화
  useEffect(() => {
    loadHistory();
    connectWebSocket();

    return () => {
      // 정리
      if (stompClientRef.current) {
        const subscriptions = (stompClientRef.current as any).__subscriptions;
        subscriptions?.forEach((sub: any) => sub?.unsubscribe?.());
        stompClientRef.current.deactivate();
      }
    };
  }, [loadHistory, connectWebSocket]);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* 채팅 헤더 */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">채팅방 #{roomId}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? "연결됨" : "연결 끊김"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                뒤로가기
              </button>
            </div>
          </div>

          {/* 채팅 메시지 영역 */}
          <div ref={chatRef} className="h-96 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-500">메시지를 불러오는 중...</div>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div
                  key={message.chatId}
                  data-chat-id={message.chatId}
                  className={`flex ${
                    message.mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.messageType === "SYSTEM"
                        ? "bg-gray-100 text-gray-700 text-center mx-auto"
                        : message.mine
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {message.messageType !== "SYSTEM" && (
                      <div className="text-xs opacity-70 mb-1">
                        {message.mine
                          ? "나"
                          : message.senderNickname || "알 수 없음"}
                      </div>
                    )}
                    <div>{message.message}</div>
                    {message.timeLabel && (
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {message.timeLabel}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 메시지 입력 영역 */}
          <div className="p-4 border-t">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
