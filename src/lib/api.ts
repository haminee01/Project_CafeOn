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

// 사용자 위치를 백엔드로 전송하고 거리 계산 결과를 받아오는 함수
export async function sendUserLocation(
  cafeId: string,
  latitude: number,
  longitude: number
) {
  try {
    const response = await apiClient.post(`/api/cafes/${cafeId}/distance`, {
      userLatitude: latitude,
      userLongitude: longitude,
    });
    return response.data;
  } catch (error: any) {
    console.error("거리 계산 API 호출 실패:", error);
    throw new Error(error.message || "거리 계산 요청 실패");
  }
}

// 카페 상세 정보 조회 시 사용자 위치 전송
export async function getCafeDetailWithLocation(
  cafeId: string,
  userLatitude?: number,
  userLongitude?: number
) {
  try {
    const params: any = {};
    if (userLatitude !== undefined && userLongitude !== undefined) {
      params.userLatitude = userLatitude.toString();
      params.userLongitude = userLongitude.toString();
    }

    const response = await apiClient.get(`/api/cafes/${cafeId}`, { params });
    return response.data;
  } catch (error: any) {
    console.error("카페 상세 정보 API 호출 실패:", error);
    throw new Error(error.message || "카페 상세 정보 조회 실패");
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
