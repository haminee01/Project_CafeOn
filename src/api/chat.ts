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
  message: string;
  data: {
    userId: string;
    memberId: number;
    cafeId: number;
    roomId: number;
    roomName: string;
    type: string;
    muted: boolean;
    maxCapacity: number;
    currentMembers: number;
    joinedAt: string;
    alreadyJoined: boolean;
  };
}

// 1:1 채팅방 생성 응답 타입
export interface DmChatJoinResponse {
  message: string;
  data: {
    userId: string;
    memberId: number;
    roomId: number;
    type: string;
    muted: boolean;
    joinedAt: string;
    alreadyJoined: boolean;
  };
}

// 채팅방 참여자 타입
export interface ChatParticipant {
  userId: string;
  nickname: string;
  profileImage?: string | null;
  me: boolean; // 채팅목록에서 나 표시
  muted?: boolean; // 알림 상태
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
  othersUnreadUsers?: number; // 안읽음 카운트 추가
  images?: Array<{
    imageId: number;
    originalFileName: string;
    imageUrl: string;
  }>;
}

// 채팅 히스토리 응답 타입 (커서 페이징)
export interface ChatHistoryResponse {
  message: string;
  data: {
    content: ChatHistoryMessage[];
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

// 요청 중복 방지를 위한 Map
const pendingRequests = new Map<string, Promise<ChatRoomJoinResponse>>();

// 사용자 인증 상태 확인
async function checkAuthStatus(): Promise<boolean> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("토큰이 없습니다");
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("인증 상태 확인:", response.status);
    return response.ok;
  } catch (error) {
    console.error("인증 상태 확인 실패:", error);
    return false;
  }
}

/**
 * 카페 단체 채팅방 생성 + 가입
 * POST /api/chat/rooms/group/:cafeId/join
 */
export const joinCafeGroupChat = async (
  cafeId: string,
  retryCount = 0
): Promise<ChatRoomJoinResponse> => {
  // 중복 요청 방지
  const requestKey = `${cafeId}-${retryCount}`;
  if (pendingRequests.has(requestKey)) {
    console.log("중복 요청 감지, 기존 요청 반환:", requestKey);
    return pendingRequests.get(requestKey)!;
  }

  // Promise 생성 및 Map에 저장
  const requestPromise = (async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // 카페 ID 유효성 검사
      const parsedCafeId = parseInt(cafeId);
      if (isNaN(parsedCafeId) || parsedCafeId <= 0) {
        throw new Error(`유효하지 않은 카페 ID: ${cafeId}`);
      }

      console.log("채팅방 참여 요청:", {
        url: `${API_BASE_URL}/api/chat/rooms/group/${cafeId}/join`,
        token: token ? "토큰 존재" : "토큰 없음",
        cafeId,
        parsedCafeId,
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
          // body는 포함하지 않음 - cafeId는 URL path에 이미 포함됨
        }
      );

      if (!response.ok) {
        let errorText = "";
        let errorData: any = null;

        try {
          errorText = await response.text();
          // 빈 문자열이 아니고 유효한 JSON인 경우 파싱 시도
          if (errorText && errorText.trim()) {
            try {
              errorData = JSON.parse(errorText);
            } catch (parseError) {
              // JSON 파싱 실패 시 텍스트 그대로 사용
              errorData = errorText;
            }
          }
        } catch (textError) {
          console.warn("에러 응답 본문 읽기 실패:", textError);
        }

        // 에러 정보 구성
        const errorInfo: any = {
          status: response.status,
          statusText: response.statusText,
          cafeId,
          url: `${API_BASE_URL}/api/chat/rooms/group/${cafeId}/join`,
        };

        if (errorText) {
          errorInfo.errorText = errorText;
        }

        if (errorData) {
          errorInfo.errorData = errorData;
          // 백엔드에서 보내는 메시지가 있는 경우 포함
          if (errorData.message) {
            errorInfo.message = errorData.message;
          }
        }

        console.error("채팅방 참여 API 에러:", errorInfo);

        // 400 에러인 경우 더 자세한 정보 제공
        if (response.status === 400) {
          console.error("400 Bad Request - 요청 데이터 확인 필요:", {
            cafeId,
            cafeIdType: typeof cafeId,
            cafeIdParsed: parseInt(cafeId),
            isNaN: isNaN(parseInt(cafeId)),
            errorMessage: errorData?.message || errorText || "상세 정보 없음",
          });

          // 에러 응답을 JSON으로 파싱 시도
          if (errorData && typeof errorData === "object") {
            console.error("에러 응답 상세:", errorData);

            // "가입 상태 조회 실패" 에러인 경우 특별 처리
            if (
              errorData.message &&
              errorData.message.includes("가입 상태 조회 실패")
            ) {
              console.error(
                "가입 상태 조회 실패 - 사용자 인증 또는 권한 문제일 수 있음"
              );
              console.error("토큰 상태:", {
                hasToken: !!token,
                tokenLength: token ? token.length : 0,
                tokenPreview: token ? token.substring(0, 50) + "..." : "없음",
              });

              // 토큰이 있는데도 가입 상태 조회가 실패하면 토큰 갱신 시도
              if (token && retryCount === 0) {
                console.log("토큰 갱신 시도...");
                try {
                  const refreshToken = localStorage.getItem("refreshToken");
                  console.log("refreshToken 존재:", !!refreshToken);

                  if (refreshToken) {
                    console.log("토큰 갱신 요청:", {
                      url: `${API_BASE_URL}/api/auth/refresh`,
                      refreshTokenLength: refreshToken.length,
                    });

                    const refreshResponse = await fetch(
                      `${API_BASE_URL}/api/auth/refresh`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ refreshToken }),
                      }
                    );

                    console.log(
                      "토큰 갱신 응답 상태:",
                      refreshResponse.status,
                      refreshResponse.statusText
                    );

                    if (refreshResponse.ok) {
                      const refreshData = await refreshResponse.json();
                      console.log("토큰 갱신 응답:", refreshData);

                      // 응답 구조 확인 및 토큰 저장
                      const newAccessToken =
                        refreshData.accessToken ||
                        refreshData.data?.accessToken;
                      if (newAccessToken) {
                        localStorage.setItem("accessToken", newAccessToken);
                        console.log("토큰 갱신 성공, 재시도...");
                        return joinCafeGroupChat(cafeId, retryCount + 1);
                      } else {
                        console.error(
                          "토큰 갱신 응답에 accessToken이 없음:",
                          refreshData
                        );
                      }
                    } else {
                      const errorText = await refreshResponse.text();
                      console.error("토큰 갱신 실패:", {
                        status: refreshResponse.status,
                        statusText: refreshResponse.statusText,
                        errorText,
                      });
                    }
                  } else {
                    console.error("refreshToken이 없음");
                  }
                } catch (refreshError) {
                  console.error("토큰 갱신 실패:", refreshError);
                }
              }

              // 토큰 갱신이 실패하거나 효과가 없을 때, 사용자 인증 상태 재확인
              if (retryCount === 0) {
                console.log("사용자 인증 상태 재확인 시도...");
                try {
                  // 간단한 인증 확인 API 호출 (예: 사용자 정보 조회)
                  const authCheckResponse = await fetch(
                    `${API_BASE_URL}/api/auth/me`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  console.log("인증 상태 확인 응답:", authCheckResponse.status);

                  if (authCheckResponse.ok) {
                    console.log("인증 상태 정상, 잠시 후 재시도...");
                    // 인증이 정상이면 잠시 후 재시도
                    setTimeout(async () => {
                      console.log("인증 확인 후 재시도");
                      await joinCafeGroupChat(cafeId, retryCount + 1);
                    }, 2000);
                  } else {
                    console.error(
                      "인증 상태 확인 실패:",
                      authCheckResponse.status
                    );
                  }
                } catch (authCheckError) {
                  console.error("인증 상태 확인 중 에러:", authCheckError);
                }
              }
            }

            // Hibernate 엔티티 ID null 에러 처리
            if (
              errorData.message &&
              (errorData.message.includes("has a null identifier") ||
                errorData.message.includes("ChatRoomEntity"))
            ) {
              console.error(
                "Hibernate 엔티티 ID null 에러 - 백엔드 데이터베이스 문제"
              );
              console.error(
                "채팅방 생성 시 데이터베이스 제약 조건 위반 또는 트랜잭션 문제"
              );
              console.error("에러 상세:", errorData.message);

              // 처음 시도인 경우 인증 상태 확인 후 자동 재시도
              if (retryCount === 0) {
                console.log("Hibernate 에러 - 인증 상태 확인 후 재시도...");

                const isAuthValid = await checkAuthStatus();
                if (isAuthValid) {
                  console.log("인증 상태 정상, 3초 후 자동 재시도...");
                  setTimeout(async () => {
                    console.log("Hibernate 에러 후 자동 재시도");
                    await joinCafeGroupChat(cafeId, retryCount + 1);
                  }, 3000);
                } else {
                  console.error("인증 상태 이상, 재시도하지 않음");
                }
              }
            }
          }
        }

        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const responseData: ChatRoomJoinResponse = await response.json();
      console.log("채팅방 참여 성공:", responseData);

      // 응답 데이터 검증
      if (!responseData || !responseData.data || !responseData.data.roomId) {
        console.error(
          "채팅방 참여 응답 데이터가 올바르지 않습니다:",
          responseData
        );
        throw new Error("채팅방 참여 응답 데이터가 올바르지 않습니다.");
      }

      // 요청 완료 후 Map에서 제거
      pendingRequests.delete(requestKey);

      return responseData;
    } catch (error) {
      console.error("카페 단체 채팅방 가입 실패:", error);

      // 에러 발생 시에도 Map에서 제거
      pendingRequests.delete(requestKey);

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
  })();

  // Promise를 Map에 저장
  pendingRequests.set(requestKey, requestPromise);

  return requestPromise;
};

/**
 * 채팅방 참여자 목록 조회
 * GET /api/chat/rooms/:roomId/participants
 */
export const getChatParticipants = async (
  roomId: string
): Promise<ChatParticipant[]> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      console.warn("참여자 목록 조회: 인증 토큰이 없습니다.");
      return [];
    }

    console.log("참여자 목록 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members`,
      roomId,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members`,
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

      // 400, 403, 404, 500 에러인 경우 빈 배열 반환 (무한 재시도 방지)
      if (
        response.status === 400 ||
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
    return data.data || [];
  } catch (error) {
    console.error("채팅방 참여자 목록 조회 실패:", error);
    // 에러 발생 시 빈 배열 반환하여 무한 재시도 방지
    return [];
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

    // 토큰이 없으면 빈 배열 반환 (인증되지 않은 사용자)
    if (!token) {
      console.log("토큰이 없어 알림 목록 조회를 건너뜁니다.");
      return [];
    }

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
      // 403 Forbidden, 404, 500 에러인 경우 빈 배열 반환 (조용히 처리)
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        // 콘솔 에러 대신 로그만 출력 (403은 인증/권한 문제일 수 있으므로 정상 상황일 수 있음)
        if (response.status !== 403) {
          console.error(
            "알림 목록 조회 API 에러:",
            response.status,
            response.statusText
          );
        }
        return [];
      }

      console.error(
        "알림 목록 조회 API 에러:",
        response.status,
        response.statusText
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("알림 목록 응답:", data);

    // 응답 구조 확인 및 데이터 추출
    let notifications: NotificationResponse[] = [];

    if (data && typeof data === "object") {
      if (Array.isArray(data)) {
        // 배열로 직접 반환된 경우
        notifications = data;
      } else if (data.data && Array.isArray(data.data)) {
        // { message: "...", data: [...] } 구조인 경우
        console.log("응답에서 data 배열 추출:", data.data);
        notifications = data.data;
      } else {
        console.log("예상하지 못한 응답 구조:", data);
        return [];
      }
    }

    // ✅ 나간 단체 채팅방 알림 필터링
    const filteredNotifications = notifications.filter(
      (notification: NotificationResponse) => {
        // deeplink에서 roomId 추출 (예: /mypage/chats?roomId=9)
        if (notification.deeplink && notification.deeplink.includes("/chats")) {
          const match = notification.deeplink.match(/roomId=(\d+)/);
          if (match) {
            const notificationRoomId = match[1];

            // localStorage에서 모든 chat_left_ 키 확인
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith("chat_left_")) {
                try {
                  const leftData = JSON.parse(
                    localStorage.getItem(key) || "{}"
                  );
                  // roomId 비교 (문자열로 비교)
                  if (
                    leftData.roomId === notificationRoomId ||
                    leftData.roomId === parseInt(notificationRoomId)
                  ) {
                    console.log(
                      `🚫 나간 단체 채팅방 알림 필터링: roomId=${notificationRoomId}, title=${notification.title}`
                    );
                    return false; // 필터링 (알림 제외)
                  }
                } catch {}
              }
            }
          }
        }
        return true; // 유지
      }
    );

    console.log("필터링 후 알림:", {
      원본개수: notifications.length,
      필터링후: filteredNotifications.length,
    });

    return filteredNotifications;
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

    // 토큰이 없으면 빈 히스토리 반환 (무한 재시도 방지)
    if (!token) {
      console.warn("채팅 히스토리 조회: 인증 토큰이 없습니다.");
      return {
        message: "인증이 필요합니다",
        data: {
          content: [],
          hasNext: false,
          nextCursor: undefined,
        },
      };
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

      // 400, 403, 404, 500 에러인 경우 빈 히스토리 반환 (무한 재시도 방지)
      if (
        response.status === 400 ||
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log(
          "채팅 히스토리 API 에러, 빈 히스토리 반환:",
          response.status
        );
        return {
          message: "채팅 히스토리를 불러올 수 없습니다",
          data: {
            content: [],
            hasNext: false,
            nextCursor: undefined,
          },
        };
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
    // 에러 발생 시 빈 히스토리 반환하여 무한 재시도 방지
    return {
      message: "채팅 히스토리 조회에 실패했습니다",
      data: {
        content: [],
        hasNext: false,
        nextCursor: undefined,
      },
    };
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
): Promise<DmChatJoinResponse> => {
  try {
    const token = localStorage.getItem("accessToken");

    const url = `${API_BASE_URL}/api/chat/rooms/dm/join?counterpartId=${encodeURIComponent(
      counterpartId
    )}`;

    console.log("1:1 채팅방 생성 요청:", {
      url,
      counterpartId,
      token: token ? "토큰 존재" : "토큰 없음",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // 에러 응답 본문 파싱
      let errorMessage = `HTTP error! status: ${response.status}`;
      let isDuplicateEntry = false;
      let extractedRoomId: string | null = null;

      try {
        const errorText = await response.text();
        console.log("=== createDmChat 에러 응답 ===", {
          status: response.status,
          errorText,
        });

        // JSON 파싱 시도
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;

          // Duplicate entry 에러 감지 (이미 참여 중인 경우)
          if (
            (response.status === 400 || response.status === 500) &&
            (errorMessage.includes("Duplicate entry") ||
              errorMessage.includes("uk_crm_room_user") ||
              errorMessage.includes("chat_room_members"))
          ) {
            isDuplicateEntry = true;
            console.log("=== Duplicate entry 에러 감지 (JSON) ===");

            // roomId 추출 시도: "Duplicate entry '7-d06eeb70-...' for key..."
            const match = errorMessage.match(/Duplicate entry ['"](\d+)-/);
            if (match && match[1]) {
              extractedRoomId = match[1];
              console.log("=== 에러에서 roomId 추출 성공 ===", extractedRoomId);
            }
          }
        } catch {
          // JSON이 아닌 경우 텍스트 그대로 사용
          if (errorText) {
            errorMessage = errorText;
            // Duplicate entry 에러 감지 (이미 참여 중인 경우)
            if (
              (response.status === 400 || response.status === 500) &&
              (errorText.includes("Duplicate entry") ||
                errorText.includes("uk_crm_room_user") ||
                errorText.includes("chat_room_members"))
            ) {
              isDuplicateEntry = true;
              console.log("=== Duplicate entry 에러 감지 (텍스트) ===");

              // roomId 추출 시도
              const match = errorText.match(/Duplicate entry ['"](\d+)-/);
              if (match && match[1]) {
                extractedRoomId = match[1];
                console.log(
                  "=== 에러에서 roomId 추출 성공 ===",
                  extractedRoomId
                );
              }
            }
          }
        }

        // 백엔드 세션 플러시 에러 감지
        if (
          !isDuplicateEntry &&
          (errorMessage.includes("null identifier") ||
            errorMessage.includes("session is flushed") ||
            errorMessage.includes("ChatRoomEntity"))
        ) {
          errorMessage =
            "채팅방 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
      } catch (parseError) {
        // 파싱 에러는 무시
      }

      // Duplicate entry 에러인 경우 특별한 에러 타입으로 throw
      if (isDuplicateEntry) {
        console.log("=== Duplicate entry 에러로 처리 ===", {
          extractedRoomId,
          errorMessage,
        });

        const duplicateError: any = new Error(
          "ALREADY_PARTICIPATING: 이미 채팅방에 참여 중입니다."
        );
        duplicateError.isDuplicateEntry = true;
        duplicateError.status = response.status;
        duplicateError.roomId = extractedRoomId;
        throw duplicateError;
      }

      throw new Error(errorMessage);
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
 * DELETE /api/chat/rooms/{roomId}/members/me/leave
 */
export const leaveChatRoomNew = async (roomId: string): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("=== 채팅방 나가기 API 요청 ===", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/leave`,
      roomId,
      method: "DELETE",
      token: token ? `토큰 존재 (${token.substring(0, 20)}...)` : "토큰 없음",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/leave`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("=== 채팅방 나가기 API 응답 ===", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // 204 No Content는 성공 (본문 없음)
    if (response.status === 204) {
      console.log("=== 채팅방 나가기 API 성공 (204 No Content) ===");
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("=== 채팅방 나가기 API 에러 상세 ===", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        roomId,
      });

      // 404 (채팅방/멤버 없음)만 무시, 나머지는 에러 처리
      if (response.status === 404) {
        console.log("채팅방/멤버가 이미 삭제됨, 정상 처리:", response.status);
        return;
      }

      throw new Error(`채팅방 나가기 실패 (${response.status}): ${errorText}`);
    }

    console.log("=== 채팅방 나가기 API 성공 ===");
  } catch (error) {
    console.error("=== 채팅방 나가기 최종 에러 ===", error);
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

    const requestBody = { muted };
    console.log("채팅방 알림 설정 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/mute`,
      roomId,
      roomIdType: typeof roomId,
      muted,
      mutedType: typeof muted,
      requestBody,
      requestBodyString: JSON.stringify(requestBody),
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
      const errorText = await response.text();
      console.error(
        "채팅방 알림 설정 API 에러:",
        response.status,
        response.statusText,
        errorText
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

/**
 * 채팅방 최신 메시지 읽음 처리
 * POST /api/chat/rooms/{roomId}/members/me/read-latest
 */
export const readLatest = async (roomId: string): Promise<void> => {
  try {
    const token = localStorage.getItem("accessToken");

    console.log("최신 메시지 읽음 처리 요청:", {
      url: `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/read-latest`,
      roomId,
      token: token ? "토큰 존재" : "토큰 없음",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/read-latest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      console.error(
        "최신 메시지 읽음 처리 API 에러:",
        response.status,
        response.statusText,
        errorText
      );

      // 403, 404, 500 에러인 경우 무시
      if (
        response.status === 403 ||
        response.status === 404 ||
        response.status === 500
      ) {
        console.log("최신 메시지 읽음 처리 API 에러, 무시:", response.status);
        return;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("최신 메시지 읽음 처리 성공");
  } catch (error) {
    console.error("최신 메시지 읽음 처리 실패:", error);
    // 읽음 처리 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
};
