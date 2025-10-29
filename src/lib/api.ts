import apiClient from "./axios";

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
    const data = response.data?.data || response.data;
    
    // 배열인지 확인
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("근처 카페 조회 실패:", error);
    // API 실패 시 빈 배열 반환 (에러를 throw하지 않음)
    console.warn("근처 카페 API 실패, 빈 배열 반환");
    return [];
  }
}

// 랜덤 카페 10개 조회
export async function getRandomCafes() {
  try {
    const response = await apiClient.get("/api/cafes/random10");
    
    // 백엔드 응답 형식에 따라 처리
    // 만약 { data: [...] } 형태면 data를 반환, 아니면 직접 배열 반환
    const data = response.data?.data || response.data;
    
    // 배열인지 확인
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("랜덤 카페 조회 실패:", error);
    // API 실패 시 빈 배열 반환 (에러를 throw하지 않음)
    console.warn("랜덤 카페 API 실패, 빈 배열 반환");
    return [];
  }
}

// ==================== MyPage API ====================

// ==================== Review API ====================

// 카페별 리뷰 목록 조회 (현재는 카페 상세 정보에 포함되어 있음)
export async function getCafeReviews(cafeId: string) {
  try {
    const response = await apiClient.get(`/api/cafes/${cafeId}/reviews`);
    return response.data || [];
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
    reason_code: string;
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
