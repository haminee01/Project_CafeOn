// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

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

// 위시리스트 조회
export async function getWishlist(params: {
  category: string;
  page: number;
  size: number;
  sort?: string;
}): Promise<WishlistResponse> {
  try {
    const queryParams = new URLSearchParams({
      category: params.category, // 대문자 그대로 사용 (HIDEOUT, WORK, etc.)
      page: params.page.toString(),
      size: params.size.toString(),
    });

    if (params.sort) {
      queryParams.append("sort", params.sort);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/my/wishlist?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`위시리스트 조회 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("위시리스트 조회 API 호출 실패:", error);
    throw error;
  }
}

// 위시리스트 삭제
export async function deleteWishlist(
  cafeId: number,
  category: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my/wishlist/${cafeId}?category=${category}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`위시리스트 삭제 실패: ${response.statusText}`);
    }
  } catch (error) {
    console.error("위시리스트 삭제 API 호출 실패:", error);
    throw error;
  }
}
