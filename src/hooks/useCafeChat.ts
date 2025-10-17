import { useState, useEffect, useCallback } from "react";
import {
  joinCafeGroupChat,
  getChatParticipants,
  sendChatMessage,
  getChatMessages,
  leaveChatRoom,
  ChatRoomJoinResponse,
  ChatParticipant,
  ChatMessageResponse,
} from "@/api/chat";
import { ChatMessage, Participant } from "@/types/chat";

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

  // 액션 함수들
  joinChat: () => Promise<void>;
  leaveChat: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshParticipants: () => Promise<void>;
  refreshMessages: () => Promise<void>;
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
  const [isJoining, setIsJoining] = useState(false); // 중복 참여 방지

  // 채팅방 참여 (재시도 로직 포함)
  const joinChat = useCallback(
    async (retryCount = 0) => {
      if (!cafeId || isJoining || isJoined) return;

      setIsJoining(true);
      setIsLoading(true);
      setError(null);

      try {
        const response: ChatRoomJoinResponse = await joinCafeGroupChat(cafeId);
        setRoomId(response.roomId);
        setIsJoined(true);

        // 참여자 목록과 메시지 목록을 가져옴
        await Promise.all([refreshParticipants(), refreshMessages()]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "채팅방 참여에 실패했습니다.";

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
      await leaveChatRoom(roomId);
      setRoomId(null);
      setIsJoined(false);
      setParticipants([]);
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "채팅방 나가기에 실패했습니다."
      );
      console.error("채팅방 나가기 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      if (!roomId || !content.trim()) return;

      try {
        const response: ChatMessageResponse = await sendChatMessage(
          roomId,
          content
        );

        // 전송된 메시지를 로컬 상태에 추가
        const newMessage: ChatMessage = {
          id: response.messageId,
          senderName: response.senderName,
          content: response.content,
          isMyMessage: response.isMyMessage || false,
          senderId: response.senderId,
        };

        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "메시지 전송에 실패했습니다."
        );
        console.error("메시지 전송 실패:", err);
      }
    },
    [roomId]
  );

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(async () => {
    if (!roomId) return;

    try {
      const response: ChatParticipant[] = await getChatParticipants(roomId);

      // ChatParticipant를 Participant로 변환
      const convertedParticipants: Participant[] = response.map(
        (participant) => ({
          id: participant.userId,
          name: participant.nickname,
        })
      );

      setParticipants(convertedParticipants);
    } catch (err) {
      console.error("참여자 목록 조회 실패:", err);
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

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 필요시 채팅방 나가기 로직 추가
    };
  }, []);

  return {
    roomId,
    isJoined,
    isLoading,
    error,
    participants,
    participantCount: participants.length,
    messages,
    joinChat,
    leaveChat,
    sendMessage,
    refreshParticipants,
    refreshMessages,
  };
};
