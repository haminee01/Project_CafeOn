import { Client, IMessage } from "@stomp/stompjs";

export function createStompClient(serverUrl: string, token: string) {
  // 토큰에서 사용자 ID 추출 (JWT 토큰의 payload에서 sub 추출)
  const getUserNameFromToken = (token: string): string => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.userId || "anonymous";
    } catch (error) {
      console.warn("토큰에서 사용자 ID 추출 실패, 기본값 사용:", error);
      return "anonymous";
    }
  };

  const userName = getUserNameFromToken(token);
  console.log("STOMP 클라이언트 생성:", { serverUrl, userName });

  const client = new Client({
    brokerURL: serverUrl, // ws://localhost:8080/stomp/chats
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      "user-name": userName, // 사용자 ID 사용
    },
    heartbeatIncoming: 0,
    heartbeatOutgoing: 10000,
    debug: (str) => {
      console.log("STOMP Debug:", str);
    },
    reconnectDelay: 5000, // 5초 후 재연결 시도
    onConnect: (frame) => {
      console.log("STOMP 연결 성공:", frame);
    },
    onStompError: (frame) => {
      console.error("STOMP 에러 상세:", {
        command: frame.command,
        headers: frame.headers,
        body: frame.body,
        message: frame.headers?.message,
      });
    },
    onWebSocketError: (error) => {
      console.error("WebSocket 에러:", error);
    },
    onDisconnect: () => {
      console.log("STOMP 연결 해제됨");
    },
  });
  return client;
}

export interface StompSubscription {
  unsubscribe: () => void;
}

export interface ChatMessage {
  chatId: number;
  roomId: number;
  message: string;
  senderNickname: string;
  timeLabel: string;
  mine: boolean;
  messageType: "TEXT" | "SYSTEM" | "SYSTEM_JOIN" | string;
  createdAt: string;
  images?: Array<{
    imageId: number;
    originalFileName: string;
    imageUrl: string;
  }>;
}

export interface ChatNotification {
  notificationId: number;
  roomId: number;
  chatId: number;
  title: string;
  preview: string;
  deeplink: string;
  read: boolean;
  createdAt: string;
}
