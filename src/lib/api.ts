// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
