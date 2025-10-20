// 채팅 관련 API 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 채팅방 참여 응답 타입
export interface NotificationResponse {
  notificationId: string;
  roomId: string;
  chatId: number;
  title: string; // DM(상대 유저 닉네임), CAFE(00카페)
  preview: string; // 메시지 미리보기
  deeplink: string; // /chats/4?jump=37
  read: boolean;
  createdAt: string;
}

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

// 채팅 히스토리 메시지 타입 (API 응답)
export interface ChatHistoryMessage {
  chatId: number;
  roomId: number;
  message: string;
  senderNickname: string;
  timeLabel: string;
  mine: boolean;
  messageType: "TEXT" | "SYSTEM" | string;
  createdAt: string;
}

// 채팅 히스토리 응답 타입 (커서 페이징)
export interface ChatHistoryResponse {
  data: {
    items: ChatHistoryMessage[];
    hasNext: boolean;
    nextCursor?: string;
  };
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
 * 카페 ID로 채팅방 ID 조회
 * GET /api/chat/rooms/cafe/:cafeId
 */
export const getChatRoomIdByCafeId = async (
  cafeId: string
): Promise<{ roomId: string }> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("카페 ID로 채팅방 ID 조회 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/cafe/${cafeId}`,
      token: token ? "토큰 존재" : "토큰 없음",
      cafeId,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/cafe/${cafeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "채팅방 ID 조회 API 에러:",
        response.status,
        response.statusText
      );

      // 403 Forbidden인 경우도 기본값 반환 (이미 참여 중일 수 있음)
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log(
          "채팅방 ID 조회 API 에러, 매핑된 값 반환:",
          response.status
        );

        // 데이터베이스 테이블 기반 매핑 (임시 하드코딩)
        const cafeToRoomMapping: { [key: string]: string } = {
          "261": "1", // 스타벅스 강남점 채팅방
          "262": "3", // 투썸플레이스 강남역점 채팅방
          "263": "6", // 커피빈 선릉점 채팅방
          // 프론트엔드 mockCafes.ts의 cafe_id와 매핑
          "1": "1", // 스타벅스 강남점 (mockCafes)
          "2": "3", // 투썸플레이스 강남역점 (mockCafes)
          "3": "6", // 커피빈 선릉점 (mockCafes)
          "33": "1", // 문래 마이스페이스 (현재 테스트 중인 카페)
        };

        const roomId = cafeToRoomMapping[cafeId] || "1"; // 기본값
        console.log(`카페 ID ${cafeId} -> 채팅방 ID ${roomId} 매핑`);
        return { roomId };
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("채팅방 ID 조회 응답:", data);

    return data;
  } catch (error) {
    console.error("채팅방 ID 조회 실패:", error);
    // 에러 발생 시 기본값 반환
    return { roomId: "1" };
  }
};

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

    // 응답 데이터 파싱 (빈 응답 처리)
    let responseData: any = {};
    const responseText = await response.text();

    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "JSON 파싱 실패:",
          parseError,
          "응답 텍스트:",
          responseText
        );
        responseData = { message: "서버 응답을 처리할 수 없습니다." };
      }
    }

    if (!response.ok) {
      console.error("API 에러 응답:", {
        status: response.status,
        statusText: response.statusText,
        responseData,
        responseText,
      });

      // 403 Forbidden 에러인 경우 특별 처리
      if (response.status === 403) {
        console.log("403 Forbidden - 권한 없음, 이미 참여 중인지 확인");

        // 실제 chatroom_id를 가져와서 이미 참여 중인 것으로 처리
        try {
          const roomInfo = await getChatRoomIdByCafeId(cafeId);
          console.log("카페 ID로 조회한 실제 채팅방 ID:", roomInfo);

          const defaultRoomInfo: ChatRoomJoinResponse = {
            roomId: roomInfo.roomId,
            cafeId: cafeId,
            message: "이미 참여 중인 채팅방입니다.",
          };
          console.log("403 에러를 이미 참여 중으로 처리:", defaultRoomInfo);
          return defaultRoomInfo;
        } catch (roomIdErr) {
          console.error("채팅방 ID 조회 실패:", roomIdErr);
          throw new Error(
            "채팅방에 접근할 권한이 없습니다. 로그인 상태를 확인해주세요."
          );
        }
      }

      // "이미 참여 중" 또는 중복 키 에러인 경우 정상 응답으로 처리
      const isAlreadyParticipating =
        responseData.message === "이미 채팅방에 참여 중입니다." ||
        responseData.message?.includes("Duplicate entry") ||
        responseData.message?.includes("uk_crm_room_user") ||
        responseData.message?.includes("chat_room_members");

      if (isAlreadyParticipating) {
        console.log("이미 참여 중인 채팅방 - 정상 처리");

        // 실제 chatroom_id를 가져오기
        const roomInfo = await getChatRoomIdByCafeId(cafeId);
        console.log("카페 ID로 조회한 실제 채팅방 ID:", roomInfo);

        // data가 있으면 반환, 없으면 실제 chatroom_id로 채팅방 정보 생성
        if (responseData.data) {
          return responseData.data;
        } else {
          // 실제 chatroom_id를 사용한 채팅방 정보 생성
          const defaultRoomInfo: ChatRoomJoinResponse = {
            roomId: roomInfo.roomId, // 실제 chatroom_id 사용
            cafeId: cafeId,
            message: "이미 참여 중인 채팅방입니다.",
          };
          console.log("실제 채팅방 정보 반환:", defaultRoomInfo);
          return defaultRoomInfo;
        }
      }

      // 실제 에러인 경우만 에러로 처리
      throw new Error(
        responseData.message ||
          responseData.error ||
          `HTTP error! status: ${response.status}`
      );
    }

    console.log("채팅방 참여 성공:", responseData);
    return responseData;
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

    console.log("참여자 목록 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/participants`,
      token: token ? "토큰 존재" : "토큰 없음",
      roomId,
    });

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
      console.error(
        "참여자 목록 API 에러:",
        response.status,
        response.statusText
      );

      // 403, 404, 500 에러인 경우 빈 배열 반환
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("참여자 목록 API 에러, 빈 배열 반환:", response.status);
        return [];
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("참여자 목록 응답:", data);
    return data;
  } catch (error) {
    console.error("채팅방 참여자 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 읽지 않은 알림 목록 조회
 * GET /api/notifications/unread
 */
export const getUnreadNotifications = async (): Promise<
  NotificationResponse[]
> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("읽지 않은 알림 목록 조회 요청:", {
      url: `${API_BASE_URL}/api/notifications/unread`,
      token: token ? "토큰 존재" : "토큰 없음",
      tokenValue: token ? token.substring(0, 50) + "..." : "토큰 없음",
      tokenLength: token ? token.length : 0,
    });

    const response = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "알림 목록 조회 API 에러:",
        response.status,
        response.statusText
      );

      // 403 Forbidden, 404, 500 에러인 경우 빈 배열 반환
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("알림 목록 API 에러, 빈 배열 반환:", response.status);
        return [];
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("알림 목록 응답:", data);

    // 응답 구조 확인 및 데이터 추출
    if (data && typeof data === "object") {
      if (Array.isArray(data)) {
        // 배열로 직접 반환된 경우
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        // { message: "...", data: [...] } 구조인 경우
        console.log("응답에서 data 배열 추출:", data.data);
        return data.data;
      } else {
        console.log("예상하지 못한 응답 구조:", data);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error("알림 목록 조회 실패:", error);
    return [];
  }
};

/**
 * 채팅 읽음 처리
 * PATCH /api/chat/rooms/:roomId/members/me/read
 */
export const patchReadStatus = async (
  roomId: string,
  lastReadChatId: number
): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("읽음 처리 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/read`,
      roomId,
      lastReadChatId,
      token: token ? "토큰 존재" : "토큰 없음",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/read`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lastReadChatId }),
      }
    );

    if (!response.ok) {
      console.error(
        "읽음 처리 API 에러:",
        response.status,
        response.statusText
      );

      // 403, 404, 500 에러인 경우 무시
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("읽음 처리 API 에러, 무시:", response.status);
        return;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("읽음 처리 성공");
  } catch (error) {
    console.error("읽음 처리 실패:", error);
    // 읽음 처리 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
};

/**
 * 채팅 메시지 전송 (데드락 에러 재시도 포함)
 * POST /api/chat/rooms/:roomId/messages
 */
export const sendChatMessage = async (
  roomId: string,
  content: string,
  retryCount = 0
): Promise<ChatMessageResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("메시지 전송 API 호출:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/messages`,
      roomId,
      content,
      retryCount,
    });

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
      const errorText = await response.text();
      console.error("메시지 전송 API 에러:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });

      // 데드락 에러인 경우 재시도 (최대 5번, 더 긴 대기 시간)
      if (response.status === 500 && retryCount < 5) {
        let isDeadlockError = false;

        try {
          // JSON 응답인 경우 파싱 시도
          const errorJson = JSON.parse(errorText);
          isDeadlockError =
            errorJson.message?.includes("서버 내부 오류") ||
            errorJson.message?.includes("Internal Server Error");
        } catch {
          // JSON이 아닌 경우 텍스트에서 직접 검색
          isDeadlockError =
            errorText.includes("Deadlock") ||
            errorText.includes("LockAcquisitionException") ||
            errorText.includes("could not execute statement") ||
            errorText.includes("서버 내부 오류") ||
            errorText.includes("Internal Server Error");
        }

        if (isDeadlockError) {
          console.log(
            `데드락 에러 발생, ${retryCount + 1}번째 재시도 중... (${
              retryCount + 1
            }/5)`
          );
          // 더 긴 지수 백오프: 2초, 4초, 8초, 16초, 32초 대기
          const delay = Math.pow(2, retryCount + 1) * 1000;
          console.log(`재시도까지 ${delay / 1000}초 대기...`);
          await new Promise((resolve) => setTimeout(resolve, delay));

          return sendChatMessage(roomId, content, retryCount + 1);
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("메시지 전송 성공:", data);
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

/**
 * 채팅 히스토리 조회 (커서 페이징)
 * GET /api/chat/rooms/{roomId}/messages?beforeId={id}&size=50&includeSystem=true
 */
export const getChatHistory = async (
  roomId: string,
  beforeId?: string,
  size: number = 50,
  includeSystem: boolean = true
): Promise<ChatHistoryResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    // 토큰이 없으면 에러
    if (!token) {
      console.error("인증 토큰이 없습니다.");
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }

    // 쿼리 파라미터 구성
    const params = new URLSearchParams();
    if (beforeId) {
      params.append("beforeId", beforeId);
    }
    params.append("size", size.toString());
    params.append("includeSystem", includeSystem.toString());

    const url = `${API_BASE_URL}/api/chat/rooms/${roomId}/messages?${params.toString()}`;

    console.log("채팅 히스토리 요청:", {
      url,
      token: token ? "토큰 존재" : "토큰 없음",
      roomId,
      beforeId,
      size,
      includeSystem,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "채팅 히스토리 API 에러:",
        response.status,
        response.statusText
      );

      // 403, 404, 500 에러인 경우 빈 히스토리 반환
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log(
          "채팅 히스토리 API 에러, 빈 히스토리 반환:",
          response.status
        );
        const emptyHistory: ChatHistoryResponse = {
          data: {
            items: [],
            hasNext: false,
            nextCursor: undefined,
          },
        };
        return emptyHistory;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("채팅 히스토리 응답:", data);

    // 응답이 빈 배열인 경우 그대로 반환
    if (
      data?.data?.items &&
      Array.isArray(data.data.items) &&
      data.data.items.length === 0
    ) {
      console.log("채팅 히스토리가 비어있음");
    }

    return data;
  } catch (error) {
    console.error("채팅 히스토리 조회 실패:", error);
    throw error;
  }
};

/**
 * 채팅 읽음 처리
 * PATCH /api/chat/rooms/{roomId}/members/me/read
 */
export const patchRead = async (
  roomId: string,
  lastReadChatId: number
): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/read`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lastReadChatId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("채팅 읽음 처리 실패:", error);
    throw error;
  }
};

/**
 * 1:1 채팅방 생성 + 가입
 * POST /api/chat/rooms/dm/join
 */
export const createDmChat = async (
  counterpartId: string
): Promise<ChatRoomJoinResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("1:1 채팅방 생성 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/dm/join`,
      counterpartId,
      token: token ? "토큰 존재" : "토큰 없음",
    });

    const response = await fetch(`${API_BASE_URL}/api/chat/rooms/dm/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ counterpartId }),
    });

    if (!response.ok) {
      console.error(
        "1:1 채팅방 생성 API 에러:",
        response.status,
        response.statusText
      );

      // 403, 404, 500 에러인 경우 기본값 반환
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("1:1 채팅방 생성 API 에러, 기본값 반환:", response.status);
        return {
          roomId: "1",
          cafeId: "",
          message: "1:1 채팅방 생성에 실패했습니다.",
        };
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("1:1 채팅방 생성 응답:", data);
    return data;
  } catch (error) {
    console.error("1:1 채팅방 생성 실패:", error);
    throw error;
  }
};

/**
 * 채팅방 나가기
 * POST /api/chat/rooms/{roomId}/members/me/leave
 */
export const leaveChatRoomNew = async (roomId: string): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("채팅방 나가기 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/leave`,
      roomId,
      token: token ? "토큰 존재" : "토큰 없음",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/leave`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "채팅방 나가기 API 에러:",
        response.status,
        response.statusText
      );

      // 403, 404, 500 에러인 경우 무시 (이미 나간 것으로 처리)
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("채팅방 나가기 API 에러, 무시:", response.status);
        return;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("채팅방 나가기 성공");
  } catch (error) {
    console.error("채팅방 나가기 실패:", error);
    throw error;
  }
};

/**
 * 채팅방 알림 on/off
 * PATCH /api/chat/rooms/{roomId}/members/me/mute
 */
export const toggleChatMute = async (
  roomId: string,
  muted: boolean
): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("채팅방 알림 설정 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/mute`,
      roomId,
      muted,
      token: token ? "토큰 존재" : "토큰 없음",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/mute`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ muted }),
      }
    );

    if (!response.ok) {
      console.error(
        "채팅방 알림 설정 API 에러:",
        response.status,
        response.statusText
      );

      // 403, 404, 500 에러인 경우 무시
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("채팅방 알림 설정 API 에러, 무시:", response.status);
        return;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("채팅방 알림 설정 성공:", muted ? "끄기" : "켜기");
  } catch (error) {
    console.error("채팅방 알림 설정 실패:", error);
    throw error;
  }
};
