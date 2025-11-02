import apiClient from "./axios";
// fetch 기반 API에서 사용하는 베이스 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ==================== Auth API ====================

// 회원가입
export async function signup(userData: {
  email: string;
  password: string;
  nickname: string;
}) {
  try {
    const response = await apiClient.post("/api/auth/signup", userData);
    return response.data;
  } catch (error: any) {
    console.error("회원가입 API 호출 실패:", error);
    throw new Error(error.message || "회원가입 실패");
  }
}

// 로그인
export async function login(credentials: { email: string; password: string }) {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  } catch (error: any) {
    console.error("로그인 API 호출 실패:", error);

    // 상태 코드별 에러 메시지
    if (error.response?.status === 400) {
      throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
    } else if (error.response?.status === 401) {
      throw new Error("인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } else if (error.response?.status === 403) {
      throw new Error("계정이 정지되었거나 접근 권한이 없습니다.");
    }

    throw new Error(
      error.message || "로그인에 실패했습니다. 다시 시도해주세요."
    );
  }
}

// 임시 비밀번호 발급
export async function requestPasswordReset(email: string) {
  try {
    const response = await apiClient.post("/api/auth/password/reset", {
      email,
    });
    return (
      response.data || { message: "임시 비밀번호가 이메일로 발송되었습니다." }
    );
  } catch (error: any) {
    console.error("비밀번호 재설정 API 호출 실패:", error);

    // 에러 메시지 결정
    if (error.response?.status === 403) {
      throw new Error("접근이 거부되었습니다. 백엔드 설정을 확인해주세요.");
    }
    if (error.response?.status === 500) {
      throw new Error(error.message || "서버 오류가 발생했습니다.");
    }

    throw new Error(
      error.message ||
        `비밀번호 재설정 요청 실패 (${error.response?.status || "unknown"})`
    );
  }
}

// ==================== Cafe API ====================

// 전체 카페 목록 조회 (관리자용)
export async function getAllCafes() {
  try {
    const response = await apiClient.get("/api/cafes/search");
    return response.data;
  } catch (error: any) {
    console.error("전체 카페 조회 실패:", error);
    throw new Error(error.message || "전체 카페 조회 실패");
  }
}

// 카페 검색
export async function searchCafes(query?: string) {
  try {
    // 항상 전체 카페를 가져온 후 클라이언트에서 필터링 (Kakao API 검색이 불안정)
    const allResponse = await apiClient.get("/api/cafes/search");
    const allCafes =
      allResponse.data?.cafes || allResponse.data?.data || allResponse.data;

    if (Array.isArray(allCafes)) {
      if (query) {
        // 검색어로 필터링 (대소문자 구분 없음)
        const lowerQuery = query.toLowerCase();
        const filtered = allCafes.filter((cafe: any) => {
          const name = (cafe.name || "").toLowerCase();
          const address = (cafe.address || "").toLowerCase();
          return name.includes(lowerQuery) || address.includes(lowerQuery);
        });
        return filtered.map(convertCafeResponseToCafe);
      } else {
        // 전체 카페 반환
        return allCafes.map(convertCafeResponseToCafe);
      }
    }
    return [];
  } catch (error: any) {
    console.error("카페 검색 실패:", error);
    throw new Error(error.message || "카페 검색 실패");
  }
}

// 카페 상세 정보 조회
export async function getCafeDetail(cafeId: string) {
  try {
    const response = await apiClient.get(`/api/cafes/${cafeId}`);
    return response.data;
  } catch (error: any) {
    console.error("카페 상세 정보 조회 실패:", error);
    throw new Error(error.message || "카페 상세 정보 조회 실패");
  }
}

// 근처 카페 조회 (지도 페이지용)
export async function getNearbyCafes(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}) {
  try {
    const response = await apiClient.get("/api/cafes/nearby", {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 1000,
      },
    });

    // 백엔드 응답 형식에 따라 처리
    // nearby API는 { cafes: [...] } 형태일 수도 있음
    const cafesData =
      response.data?.cafes || response.data?.data || response.data;

    // 배열인지 확인하고 변환
    if (Array.isArray(cafesData)) {
      return cafesData.map(convertCafeResponseToCafe);
    }
    return [];
  } catch (error: any) {
    console.error("근처 카페 조회 실패:", error);
    // API 실패 시 빈 배열 반환 (에러를 throw하지 않음)
    console.warn("근처 카페 API 실패, 빈 배열 반환");
    return [];
  }
}

// 백엔드 카페 응답을 프론트엔드 Cafe 타입으로 변환
function convertCafeResponseToCafe(cafe: any): any {
  return {
    cafe_id: String(cafe.cafeId || cafe.id || cafe.cafe_id || ""),
    name: cafe.name || "",
    address: cafe.address || "",
    latitude: cafe.latitude || 0,
    longitude: cafe.longitude || 0,
    open_hours: cafe.openHours || cafe.open_hours || "",
    avg_rating: cafe.avgRating || cafe.avg_rating || 0,
    created_at: cafe.createdAt || cafe.created_at || "",
    description: cafe.description || cafe.reviewsSummary || "",
    tags: Array.isArray(cafe.tags) ? cafe.tags : [],
  };
}

// 랜덤 카페 10개 조회
export async function getRandomCafes() {
  try {
    const response = await apiClient.get("/api/cafes/random10");

    // 백엔드 응답 형식에 따라 처리
    const data = response.data?.data || response.data;

    // 배열인지 확인하고 변환
    if (Array.isArray(data)) {
      return data.map(convertCafeResponseToCafe);
    }
    return [];
  } catch (error: any) {
    console.error("랜덤 카페 조회 실패:", error);
    // API 실패 시 빈 배열 반환 (에러를 throw하지 않음)
    console.warn("랜덤 카페 API 실패, 빈 배열 반환");
    return [];
  }
}

// ==================== MyPage API ====================

// ==================== Review API ====================

// 카페별 리뷰 목록 조회
export async function getCafeReviews(
  cafeId: string,
  sort: "latest" | "rating-high" | "rating-low" | "likes" = "latest"
) {
  try {
    const response = await apiClient.get(`/api/cafes/${cafeId}/reviews`, {
      params: { sort },
    });
    return response.data || { reviews: [], count: 0 };
  } catch (error: any) {
    console.error("카페 리뷰 목록 조회 실패:", error);
    throw new Error(error.message || "리뷰 목록 조회 실패");
  }
}

// 리뷰 작성
export async function createReview(
  cafeId: string,
  reviewData: {
    content: string;
    rating: number;
    images?: File[];
  }
) {
  try {
    const formData = new FormData();

    // 리뷰 데이터를 JSON으로 변환하여 추가
    formData.append(
      "review",
      JSON.stringify({
        content: reviewData.content,
        rating: reviewData.rating,
      })
    );

    // 이미지 파일들 추가
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await apiClient.post(
      `/api/cafes/${cafeId}/reviews`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("리뷰 작성 실패:", error);
    throw new Error(error.message || "리뷰 작성 실패");
  }
}

// 리뷰 수정
export async function updateReview(
  reviewId: string,
  reviewData: {
    content: string;
    rating: number;
    images?: File[];
  }
) {
  try {
    const formData = new FormData();

    // 리뷰 데이터를 JSON으로 변환하여 추가
    formData.append(
      "review",
      JSON.stringify({
        content: reviewData.content,
        rating: reviewData.rating,
      })
    );

    // 이미지 파일들 추가
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await apiClient.put(`/api/reviews/${reviewId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("리뷰 수정 실패:", error);
    throw new Error(error.message || "리뷰 수정 실패");
  }
}

// 리뷰 삭제
export async function deleteReview(reviewId: string) {
  try {
    const response = await apiClient.delete(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    console.error("리뷰 삭제 실패:", error);
    throw new Error(error.message || "리뷰 삭제 실패");
  }
}

// 리뷰 신고 상태 확인
export async function checkReviewReportStatus(reviewId: string) {
  try {
    const response = await apiClient.get(
      `/api/reviews/${reviewId}/reports/status`
    );
    return response.data;
  } catch (error: any) {
    console.error("리뷰 신고 상태 확인 실패:", error);
    throw new Error(error.message || "리뷰 신고 상태 확인 실패");
  }
}

// 리뷰 신고
export async function reportReview(reviewId: string, content: string) {
  try {
    const response = await apiClient.post(`/api/reviews/${reviewId}/reports`, {
      content,
    });
    return response.data;
  } catch (error: any) {
    console.error("리뷰 신고 실패:", error);
    throw new Error(error.message || "리뷰 신고 실패");
  }
}

// 위시리스트 조회
export async function getWishlist(params?: {
  page?: number;
  size?: number;
  category?: string;
  sort?: string;
}) {
  try {
    const response = await apiClient.get("/api/my/wishlist", { params });
    return response.data;
  } catch (error: any) {
    console.error("위시리스트 조회 API 호출 실패:", error);
    throw new Error(error.message || "위시리스트 조회 실패");
  }
}

// 특정 카페의 위시리스트 카테고리 조회
export async function getWishlistCategories(cafeId: string) {
  try {
    const response = await apiClient.get(`/api/my/wishlist/${cafeId}`);
    return response.data;
  } catch (error: any) {
    console.error("위시리스트 카테고리 조회 API 호출 실패:", error);

    // 백엔드 서버가 실행되지 않은 경우 모킹된 응답 반환
    if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error")
    ) {
      console.log("백엔드 서버가 실행되지 않음. 모킹된 응답을 반환합니다.");
      return {
        message: "카테고리 조회 완료 (모킹)",
        data: [],
      };
    }

    throw new Error(error.message || "카테고리 조회 실패");
  }
}

// 위시리스트 추가/제거 (토글)
export async function toggleWishlist(cafeId: string, category: string) {
  try {
    const response = await apiClient.post(
      `/api/my/wishlist/${cafeId}?category=${category}`
    );
    return response.data;
  } catch (error: any) {
    console.error("위시리스트 토글 API 호출 실패:", error);

    // 백엔드 서버가 실행되지 않은 경우 모킹된 응답 반환
    if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error")
    ) {
      console.log("백엔드 서버가 실행되지 않음. 모킹된 응답을 반환합니다.");
      return {
        message: "위시리스트가 반영되었습니다. (모킹)",
        data: {
          cafeId: parseInt(cafeId),
          wished: true,
        },
      };
    }

    throw new Error(error.message || "위시리스트 처리 실패");
  }
}

// ==================== Admin API ====================

// 관리자 회원 목록 조회
export async function getAdminMembers(params?: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}) {
  try {
    const response = await apiClient.get("/api/admin/users", { params });
    return response.data;
  } catch (error: any) {
    console.error("Admin 회원 목록 API 호출 실패:", error);

    if (error.response?.status === 403) {
      throw new Error("관리자 권한이 필요합니다.");
    }

    throw new Error(
      error.message ||
        `회원 목록 조회 실패 (${error.response?.status || "unknown"})`
    );
  }
}

// 관리자 회원 상세 조회
export async function getAdminMemberDetail(userId: string) {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Admin 회원 상세 API 호출 실패:", error);
    throw new Error(error.message || "회원 상세 조회 실패");
  }
}

// 관리자 페널티 부여
export async function addAdminPenalty(
  userId: string,
  data: {
    reason: string;
    reasonCode?: string;
  }
) {
  try {
    const response = await apiClient.post(
      `/api/admin/users/${userId}/penalty`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Admin 페널티 부여 API 호출 실패:", error);
    throw new Error(error.message || "페널티 부여 실패");
  }
}

// 관리자 회원 정지
export async function suspendAdminUser(
  userId: string,
  data: {
    duration: string;
    reason: string;
    reasonCode?: string;
  }
) {
  try {
    const response = await apiClient.post(
      `/api/admin/users/${userId}/suspend`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Admin 회원 정지 API 호출 실패:", error);
    throw new Error(error.message || "회원 정지 실패");
  }
}

// 회원 패널티 내역 조회
export async function getUserPenalties(userId: string) {
  try {
    const response = await apiClient.get(
      `/api/admin/users/${userId}/penalties`
    );
    return response.data;
  } catch (error: any) {
    console.error("Admin 회원 패널티 조회 API 호출 실패:", error);
    throw new Error(error.message || "패널티 조회 실패");
  }
}

// ==================== Admin Reports API ====================

// 관리자 신고 목록 조회
export async function getAdminReports(status?: string) {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get("/api/admin/reports", { params });
    return response.data;
  } catch (error: any) {
    console.error("Admin 신고 목록 API 호출 실패:", error);
    throw new Error(error.message || "신고 목록 조회 실패");
  }
}

// 관리자 신고 상세 조회
export async function getAdminReportDetail(id: number) {
  try {
    const response = await apiClient.get(`/api/admin/reports/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Admin 신고 상세 API 호출 실패:", error);
    throw new Error(error.message || "신고 상세 조회 실패");
  }
}

// 관리자 신고 처리
export async function updateAdminReport(id: number, data: { status: string }) {
  try {
    const response = await apiClient.put(`/api/admin/reports/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Admin 신고 처리 API 호출 실패:", error);
    throw new Error(error.message || "신고 처리 실패");
  }
}

// ==================== User API ====================

// 회원 정보 조회
export async function getUserProfile() {
  try {
    const response = await apiClient.get("/api/users/me");
    return response.data;
  } catch (error: any) {
    console.error("회원 정보 조회 실패:", error);
    throw new Error(error.message || "회원 정보 조회 실패");
  }
}

// 회원 정보 수정 (닉네임)
export async function updateUserProfile(nickname: string) {
  try {
    const response = await apiClient.put("/api/users/me", { nickname });
    return response.data;
  } catch (error: any) {
    console.error("회원 정보 수정 실패:", error);
    throw new Error(error.message || "회원 정보 수정 실패");
  }
}

// 프로필 이미지 변경
export async function updateProfileImage(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.put(
      "/api/users/me/profile-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("프로필 이미지 변경 실패:", error);
    throw new Error(error.message || "프로필 이미지 변경 실패");
  }
}

// 회원 탈퇴
export async function deleteUser() {
  try {
    const response = await apiClient.delete("/api/users/me");
    return response.data;
  } catch (error: any) {
    console.error("회원 탈퇴 실패:", error);
    throw new Error(error.message || "회원 탈퇴 실패");
  }
}

// 비밀번호 변경
export async function changePassword(passwordData: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const response = await apiClient.put(
      "/api/users/me/password",
      passwordData
    );
    return response.data;
  } catch (error: any) {
    console.error("비밀번호 변경 실패:", error);

    // 상태 코드별 에러 메시지
    if (error.response?.status === 400) {
      throw new Error("현재 비밀번호가 일치하지 않습니다.");
    } else if (error.response?.status === 401) {
      throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
    } else if (error.response?.status === 403) {
      throw new Error("접근 권한이 없습니다.");
    }

    throw new Error(error.message || "비밀번호 변경에 실패했습니다.");
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
    const response = await apiClient.get("/api/admin/inquiries", { params });
    return response.data;
  } catch (error: any) {
    console.error("Admin 문의 목록 API 호출 실패:", error);

    if (error.response?.status === 403) {
      throw new Error("관리자 권한이 필요합니다.");
    }

    throw new Error(
      error.message ||
        `문의 목록 조회 실패 (${error.response?.status || "unknown"})`
    );
  }
}

// 관리자 문의 상세 조회
export async function getAdminInquiryDetail(id: number) {
  try {
    const response = await apiClient.get(`/api/admin/inquiries/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Admin 문의 상세 API 호출 실패:", error);
    throw new Error(error.message || "문의 상세 조회 실패");
  }
}

// 관리자 답변 목록 조회
export async function getAdminInquiryAnswers(inquiryId: number) {
  try {
    const response = await apiClient.get(
      `/api/admin/inquiries/${inquiryId}/answers`
    );
    return response.data;
  } catch (error: any) {
    console.error("Admin 답변 목록 API 호출 실패:", error);
    throw new Error(error.message || "답변 목록 조회 실패");
  }
}

// 관리자 답변 작성
export async function createAdminInquiryAnswer(
  inquiryId: number,
  content: string
) {
  try {
    const response = await apiClient.post(
      `/api/admin/inquiries/${inquiryId}/answers`,
      { content }
    );
    return response.data;
  } catch (error: any) {
    console.error("Admin 답변 작성 API 호출 실패:", error);
    throw new Error(error.message || "답변 작성 실패");
  }
}

// ==================== Wishlist API ====================

// 위시리스트 타입 정의
export interface WishlistResponse {
  data: {
    content: Array<{
      id: number;
      cafeId: number;
      name: string;
      category: string;
    }>;
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
  };
}

// (중복 정의 제거됨 - getWishlist/toggleWishlist는 상단 apiClient 버전 사용)

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
// (중복 정의 제거됨 - getWishlistCategories는 상단 apiClient 버전 사용)

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

// 채팅방 이미지 전송
export interface SendChatImageResponse {
  message: string;
  chatId: number;
  roomId: number;
  senderId: string;
  content: string;
  createdAt: string;
  timeLabel: string;
  senderNickname: string;
  messageType: string;
  othersUnreadUsers: any[];
  images: Array<{
    imageId: number;
    originalFileName: string;
    imageUrl: string;
  }>;
}

export async function sendChatImage(
  roomId: string | number,
  files: File[],
  caption?: string
): Promise<SendChatImageResponse> {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!files || files.length === 0) {
      throw new Error("전송할 파일을 선택해주세요.");
    }

    // FormData 생성
    const formData = new FormData();

    // 파일 추가 (key: 'files')
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    // 캡션 추가 (key: 'caption', 선택사항)
    if (caption) {
      formData.append("caption", caption);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/rooms/${roomId}/messages/image`,
      {
        method: "POST",
        headers: {
          // FormData를 사용할 경우 Content-Type 헤더를 수동으로 설정하지 않아야 함
          // 브라우저가 boundary 정보까지 포함하여 자동으로 생성
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `이미지 전송 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("채팅 이미지 전송 API 호출 실패:", error);
    throw error;
  }
}

// ==================== Review API ====================

// 리뷰 이미지 타입
export interface ReviewImage {
  imageId: number;
  originalFileName: string;
  imageUrl: string;
}

// 내가 작성한 리뷰 타입
export interface MyReview {
  reviewId: number;
  rating: number;
  content: string;
  createdAt: string;
  reported: boolean;
  cafeId: number;
  cafeName: string;
  reviewerId: string;
  reviewerNickname: string;
  reviewerProfileImageUrl: string | null;
  images: ReviewImage[];
}

// 내가 작성한 리뷰 목록 조회 응답 타입
export interface MyReviewsResponse {
  message: string;
  data: {
    content: MyReview[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    totalElements: number;
    last: boolean;
    totalPages: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

// 리뷰 수정 요청 타입
export interface UpdateReviewRequest {
  content: string;
  rating: number;
  images?: number[]; // 이미지 ID 배열 (기존 이미지 유지 시)
}

// 리뷰 수정 응답 타입
export interface UpdateReviewResponse {
  message: string;
  data: {
    reviewId: number;
    rating: number;
    content: string;
    createdAt: string;
    reported: boolean;
    cafeId: number;
    cafeName: string;
    reviewerId: string;
    reviewerNickname: string;
    reviewerProfileImageUrl: string | null;
    images: ReviewImage[];
  };
}

// 내가 작성한 리뷰 목록 조회
export async function getMyReviews(params?: {
  page?: number;
  size?: number;
}): Promise<MyReviewsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());

    const url = `${API_BASE_URL}/api/my/reviews${
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
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `리뷰 목록 조회 실패 (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("내가 작성한 리뷰 조회 API 호출 실패:", error);
    throw error;
  }
}

// 리뷰 수정
// (중복 정의 제거됨 - updateReview는 상단 apiClient 버전 사용)

// 리뷰 삭제
// (중복 정의 제거됨 - deleteReview는 상단 apiClient 버전 사용)
