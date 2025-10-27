// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ==================== Auth API ====================

// 회원가입
export async function signup(userData: {
  email: string;
  password: string;
  nickname: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "회원가입 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("회원가입 API 호출 실패:", error);
    throw error;
  }
}

// 로그인
export async function login(credentials: { email: string; password: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // 상태 코드별 에러 메시지
      if (response.status === 400) {
        throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else if (response.status === 401) {
        throw new Error(
          "인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
        );
      } else if (response.status === 403) {
        throw new Error("계정이 정지되었거나 접근 권한이 없습니다.");
      }

      throw new Error(
        errorData.message || "로그인에 실패했습니다. 다시 시도해주세요."
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("로그인 API 호출 실패:", error);
    throw error;
  }
}

// 임시 비밀번호 발급
export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      // 에러 응답 파싱 시도
      const contentType = response.headers.get("content-type");
      let errorData: any = {};

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json().catch(() => ({}));
      }

      // 에러 메시지 결정
      if (response.status === 403) {
        throw new Error("접근이 거부되었습니다. 백엔드 설정을 확인해주세요.");
      }
      if (response.status === 500) {
        // 백엔드에서 온 메시지 우선 사용
        const message = errorData.message || "서버 오류가 발생했습니다.";
        throw new Error(message);
      }

      throw new Error(
        errorData.message || `비밀번호 재설정 요청 실패 (${response.status})`
      );
    }

    // 응답이 비어있을 수 있으므로 안전하게 처리
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else {
      // JSON이 아닌 경우 기본 메시지 반환
      return { message: "임시 비밀번호가 이메일로 발송되었습니다." };
    }
  } catch (error) {
    console.error("비밀번호 재설정 API 호출 실패:", error);
    throw error;
  }
}

// ==================== Cafe API ====================

// 사용자 위치를 백엔드로 전송하고 거리 계산 결과를 받아오는 함수
export async function sendUserLocation(
  cafeId: string,
  latitude: number,
  longitude: number
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/cafes/${cafeId}/distance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userLatitude: latitude,
          userLongitude: longitude,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("거리 계산 요청 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("거리 계산 API 호출 실패:", error);
    throw error;
  }
}

// 카페 상세 정보 조회 시 사용자 위치 전송
export async function getCafeDetailWithLocation(
  cafeId: string,
  userLatitude?: number,
  userLongitude?: number
) {
  try {
    const params = new URLSearchParams();
    if (userLatitude !== undefined && userLongitude !== undefined) {
      params.append("userLatitude", userLatitude.toString());
      params.append("userLongitude", userLongitude.toString());
    }

    const url = `${API_BASE_URL}/api/cafes/${cafeId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("카페 상세 정보 조회 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("카페 상세 정보 API 호출 실패:", error);
    throw error;
  }
}

// ==================== User API ====================

// 비밀번호 변경
export async function changePassword(passwordData: {
  oldPassword: string;
  newPassword: string;
}) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // 상태 코드별 에러 메시지
      if (response.status === 400) {
        throw new Error("현재 비밀번호가 일치하지 않습니다.");
      } else if (response.status === 401) {
        throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
      } else if (response.status === 403) {
        throw new Error("접근 권한이 없습니다.");
      } else if (response.status === 500) {
        // 500 에러 시에도 현재 비밀번호 불일치로 처리
        throw new Error("현재 비밀번호가 일치하지 않습니다.");
      }

      throw new Error(errorData.message || "비밀번호 변경에 실패했습니다.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("비밀번호 변경 API 호출 실패:", error);
    throw error;
  }
}

// ==================== Admin Inquiries API ====================

// 관리자 문의 목록 조회
export async function getAdminInquiries(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.keyword) queryParams.append("keyword", params.keyword);
    if (params?.status) queryParams.append("status", params.status);

    const url = `${API_BASE_URL}/api/admin/inquiries${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const token = localStorage.getItem("accessToken");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("관리자 권한이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `문의 목록 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin 문의 목록 API 호출 실패:", error);
    throw error;
  }
}

// 관리자 문의 상세 조회
export async function getAdminInquiryDetail(id: number) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/inquiries/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("문의 상세 조회 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin 문의 상세 API 호출 실패:", error);
    throw error;
  }
}

// 관리자 답변 목록 조회
export async function getAdminInquiryAnswers(inquiryId: number) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/api/admin/inquiries/${inquiryId}/answers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("답변 목록 조회 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin 답변 목록 API 호출 실패:", error);
    throw error;
  }
}

// 관리자 답변 작성
export async function createAdminInquiryAnswer(
  inquiryId: number,
  content: string
) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/api/admin/inquiries/${inquiryId}/answers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error("답변 작성 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin 답변 작성 API 호출 실패:", error);
    throw error;
  }
}

// ==================== Wishlist API ====================

// 위시리스트 목록 조회 (카테고리별)
export async function getWishlist(params: {
  category: string;
  page?: number;
  size?: number;
  sort?: string;
}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("category", params.category);
    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.sort) queryParams.append("sort", params.sort);

    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/api/my/wishlist?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `위시리스트 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("위시리스트 조회 API 호출 실패:", error);
    throw error;
  }
}

// 위시리스트 추가/제거
export async function toggleWishlist(cafeId: number, category: string) {
  try {
    const token = localStorage.getItem("accessToken");
    const requestBody = { category };

    console.log("위시리스트 API 호출:", {
      url: `${API_BASE_URL}/api/my/wishlist/${cafeId}`,
      method: "POST",
      body: requestBody,
      category,
    });

    const response = await fetch(`${API_BASE_URL}/api/my/wishlist/${cafeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }

      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        // JSON 파싱 실패 시 빈 객체 유지
      }

      // 500 에러 또는 서버 에러에 대한 메시지 처리
      const errorMessage =
        errorData.message ||
        (response.status === 500
          ? "서버 내부 오류가 발생했습니다."
          : `위시리스트 처리 실패 (${response.status})`);

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("위시리스트 처리 API 호출 실패:", error);
    throw error;
  }
}

// 위시리스트 제거 (DELETE)
export async function deleteWishlist(cafeId: number, category: string) {
  try {
    const token = localStorage.getItem("accessToken");
    const queryParams = new URLSearchParams({ category });

    console.log("위시리스트 삭제 API 호출:", {
      url: `${API_BASE_URL}/api/my/wishlist/${cafeId}?${queryParams.toString()}`,
      method: "DELETE",
      category,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/my/wishlist/${cafeId}?${queryParams.toString()}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }

      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        // JSON 파싱 실패 시 빈 객체 유지
      }

      const errorMessage =
        errorData.message ||
        (response.status === 500
          ? "서버 내부 오류가 발생했습니다."
          : `위시리스트 제거 실패 (${response.status})`);

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("위시리스트 제거 API 호출 실패:", error);
    throw error;
  }
}

// 특정 카페의 위시리스트 카테고리 조회
export async function getWishlistCategories(cafeId: number) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/my/wishlist/${cafeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `카테고리 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("위시리스트 카테고리 조회 API 호출 실패:", error);
    throw error;
  }
}

// ==================== Chat API ====================

// 내 채팅방 목록 조회
export async function getMyChatRooms() {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/my/chat/rooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `채팅방 목록 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("내 채팅방 목록 API 호출 실패:", error);
    throw error;
  }
}

// 채팅 읽음 처리
export async function markChatAsRead(roomId: string, lastReadChatId: string) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/members/me/read-latest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          lastReadChatId: lastReadChatId,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `채팅 읽음 처리 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("채팅 읽음 처리 API 호출 실패:", error);
    throw error;
  }
}

// 사용자의 읽지 않은 채팅 목록 조회
export async function getNotificationsUnread() {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `읽지 않은 알림 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("읽지 않은 알림 조회 API 호출 실패:", error);
    throw error;
  }
}

// 채팅방 메시지 목록 조회 (othersUnreadUsers 포함)
export async function getChatMessagesWithUnreadCount(roomId: string) {
  try {
    if (!roomId || roomId === "undefined" || roomId === "null") {
      throw new Error("유효하지 않은 roomId입니다.");
    }

    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/messages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `채팅 메시지 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("채팅 메시지 조회 API 호출 실패:", error);
    throw error;
  }
}
