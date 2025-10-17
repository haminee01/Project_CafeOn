// 채팅 관련 API 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 채팅방 참여 응답 타입
export interface ChatRoomJoinResponse {
  roomId: string;
  cafeId: string;
  message: string;
}

// 채팅방 참여자 타입
export interface ChatParticipant {
  userId: string;
  nickname: string;
  profileImage?: string;
}

// 채팅 메시지 타입
export interface ChatMessageResponse {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isMyMessage?: boolean;
}

// 채팅방 정보 타입
export interface ChatRoomInfo {
  roomId: string;
  cafeId: string;
  cafeName: string;
  participants: ChatParticipant[];
  participantCount: number;
}

/**
 * 카페 단체 채팅방 생성 + 가입
 * POST /api/chat/rooms/group/:cafeId/join
 */
export const joinCafeGroupChat = async (
  cafeId: string,
  retryCount = 0
): Promise<ChatRoomJoinResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("채팅방 참여 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/group/${cafeId}/join`,
      token: token ? "토큰 존재" : "토큰 없음",
      cafeId,
      retryCount,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/group/${cafeId}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      // 에러 응답의 상세 정보를 확인
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("API 에러 응답:", errorData);

        // "이미 참여 중"인 경우에도 채팅방 정보가 있다면 정상 응답으로 처리
        if (
          errorData.message === "이미 채팅방에 참여 중입니다." &&
          errorData.data
        ) {
          console.log("이미 참여 중이지만 채팅방 정보 반환:", errorData.data);
          return errorData.data; // 채팅방 정보를 정상 응답으로 반환
        }

        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error("에러 응답 파싱 실패:", e);
        const errorText = await response.text();
        console.error("에러 응답 텍스트:", errorText);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("채팅방 참여 성공:", data);
    return data;
  } catch (error) {
    console.error("카페 단체 채팅방 가입 실패:", error);

    // 데드락 에러인 경우 재시도 (최대 2번)
    if (
      error instanceof Error &&
      error.message.includes("Deadlock") &&
      retryCount < 2
    ) {
      console.log(`데드락 발생, ${retryCount + 1}번째 재시도 중...`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );
      return joinCafeGroupChat(cafeId, retryCount + 1);
    }

    throw error;
  }
};

/**
 * 채팅방 참여자 목록 조회
 * GET /api/chat/rooms/:roomId/participants
 */
export const getChatParticipants = async (
  roomId: string
): Promise<ChatParticipant[]> => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/participants`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("채팅방 참여자 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 채팅 메시지 전송
 * POST /api/chat/rooms/:roomId/messages
 */
export const sendChatMessage = async (
  roomId: string,
  content: string
): Promise<ChatMessageResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("채팅 메시지 전송 실패:", error);
    throw error;
  }
};

/**
 * 채팅방 메시지 목록 조회
 * GET /api/chat/rooms/:roomId/messages
 */
export const getChatMessages = async (
  roomId: string
): Promise<ChatMessageResponse[]> => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/messages`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("채팅 메시지 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 채팅방 나가기
 * DELETE /api/chat/rooms/:roomId/leave
 */
export const leaveChatRoom = async (roomId: string): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("채팅방 나가기 실패:", error);
    throw error;
  }
};
