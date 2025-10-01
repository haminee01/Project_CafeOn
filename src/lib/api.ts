// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// API 응답 타입 정의 (백엔드 스펙에 맞춤)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    traceId?: string;
  };
}

// 인증 관련 타입 정의
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    email: string;
    nickname: string;
    role: string;
  };
}

// 토큰 관리
export const tokenManager = {
  // 토큰 저장
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  // 액세스 토큰 가져오기
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  // 리프레시 토큰 가져오기
  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },

  // 토큰 삭제
  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  },
};

// HTTP 클라이언트
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 기본 요청 메서드
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // 기본 헤더 설정
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // 액세스 토큰이 있으면 Authorization 헤더 추가
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // 401 에러 시 토큰 갱신 시도
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // 토큰 갱신 성공 시 원래 요청 재시도
          return this.request(endpoint, options);
        } else {
          // 토큰 갱신 실패 시 로그아웃
          tokenManager.clearTokens();
          window.location.href = "/login";
        }
      }

      return data;
    } catch (error) {
      console.error("API 요청 실패:", error);
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "네트워크 오류가 발생했습니다.",
        },
      };
    }
  }

  // 토큰 갱신
  private async refreshToken(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          tokenManager.setTokens(
            data.data.accessToken,
            data.data.refreshToken || refreshToken
          );
          return true;
        }
      }
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
    }

    return false;
  }

  // 인증 관련 API
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request("/api/auth/logout", {
      method: "POST",
    });

    // 성공하든 실패하든 로컬 토큰은 삭제
    tokenManager.clearTokens();

    return result;
  }

  async refreshTokens(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      return {
        success: false,
        error: {
          code: "NO_REFRESH_TOKEN",
          message: "리프레시 토큰이 없습니다.",
        },
      };
    }

    return this.request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  // 사용자 프로필 API
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request("/api/user/profile");
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.request("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL);

// 편의 함수들
export const authApi = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  signup: (userData: SignupRequest) => apiClient.signup(userData),
  logout: () => apiClient.logout(),
  refreshTokens: () => apiClient.refreshTokens(),
};

export const userApi = {
  getProfile: () => apiClient.getProfile(),
  updateProfile: (profileData: any) => apiClient.updateProfile(profileData),
};

// 카페 관련 API
export const cafeApi = {
  // 거리 계산
  async calculateDistance(
    cafeId: string,
    userLat: number,
    userLng: number
  ): Promise<ApiResponse<{ distance: number }>> {
    return apiClient.request<{ distance: number }>(
      `/api/cafes/${cafeId}/distance`,
      {
        method: "POST",
        body: JSON.stringify({
          userLat,
          userLng,
          cafeId,
        }),
      }
    );
  },

  // 카페 상세 조회
  async getCafeDetail(cafeId: string): Promise<ApiResponse<any>> {
    return apiClient.request(`/api/cafes/${cafeId}`);
  },

  // 카페 검색
  async searchCafes(params: {
    query?: string;
    region?: string;
    tags?: string;
    sort?: "VIEW" | "WISHLIST" | "NEW";
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append("query", params.query);
    if (params.region) searchParams.append("region", params.region);
    if (params.tags) searchParams.append("tags", params.tags);
    if (params.sort) searchParams.append("sort", params.sort);

    return apiClient.request(`/api/cafes?${searchParams.toString()}`);
  },

  // 주변 카페 조회
  async getNearbyCafes(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) searchParams.append("radius", radius.toString());

    return apiClient.request(`/api/cafes/nearby?${searchParams.toString()}`);
  },
};
