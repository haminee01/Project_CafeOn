// API 응답 에러 구조를 위한 인터페이스 정의
interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

// 환경 변수에서 기본 URL을 가져옵니다.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

console.log("API_BASE_URL:", API_BASE_URL);

if (!API_BASE_URL) {
  console.error(
    "NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다. API 호출에 실패할 수 있습니다."
  );
}

/**
 * 상대 URL을 절대 URL로 변환
 * (예: "/api/posts" -> "http://localhost:8080/api/posts")
 */
export const buildFullUrl = (url: string): string => {
  // 1. API_BASE_URL이 비어 있으면 상대 URL을 그대로 반환 (상대 경로 호출 시 대비)
  if (!API_BASE_URL) {
    return url;
  }

  try {
    // 2. new URL(상대경로, 기준경로)를 사용하여 완벽한 URL을 생성합니다.
    return new URL(url, API_BASE_URL).toString();
  } catch (e) {
    console.error("Invalid API Base URL:", API_BASE_URL, "Error:", e);
    // URL 생성 실패 시 원본 URL 반환 (일반적으로 환경 설정 오류)
    return url;
  }
};

/**
 * 범용 API Fetcher 함수 (GET, POST, PUT, DELETE 모두 지원)
 * SWR의 기본 fetcher 함수 시그니처를 따릅니다: (url: string, options?: RequestInit) => Promise<Data>
 */
export const fetcher = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = buildFullUrl(url);
  console.log("Fetching URL:", fullUrl);

  // 1. 로컬 스토리지 등에서 저장된 인증 토큰을 가져옵니다.
  const authToken = localStorage.getItem("accessToken");
  const method = options?.method || "GET";

  // HeadersInit 대신 Record<string, string>을 사용하여 인덱스 접근 에러 해결
  const headers: Record<string, string> = {
    // options?.headers가 HeadersInit일 수 있으므로, JSON.stringify/JSON.parse를 통해 안전하게 객체로 변환
    // 단, 간단한 병합을 위해 Record 타입으로 정의하고, Content-Type을 기본값으로 설정
    "Content-Type": "application/json",
    ...(options?.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options?.headers as Record<string, string> | undefined) || {}),
  };

  // 2. Authorization 헤더 추가:
  // 토큰이 존재하면 Authorization 헤더에 Bearer 토큰 형식으로 추가합니다.
  if (authToken) {
    // TS2345 에러 해결: headers의 타입을 Record<string, string>으로 명시했으므로 안전하게 추가 가능
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // 3. API 호출
  const response = await fetch(fullUrl, {
    ...options,
    method: method,
    headers: headers, // Record<string, string> 타입은 HeadersInit으로 사용 가능
  });

  // 4. 에러 처리
  if (!response.ok) {
    let errorMessage = `API 요청 실패 (${response.status}): 응답을 파싱할 수 없습니다.`;
    let errorDetail: string;

    try {
      // 응답 본문을 JSON으로 파싱 시도
      const errorData: ApiErrorResponse = await response.json();
      errorDetail = errorData.message || response.statusText;
    } catch {
      // JSON 파싱 실패 시, 상태 코드를 기반으로 메시지 설정
      errorDetail = response.statusText || "응답을 파싱할 수 없습니다.";
    }

    // HTTP 401 (인증 필요) 에러 발생 시 구체적인 메시지 출력
    if (response.status === 401) {
      errorMessage = `인증 필요 (401): 로그인이 필요한 서비스입니다.`;
    }
    // HTTP 403 (권한 없음) 에러 발생 시 구체적인 메시지 출력
    else if (response.status === 403) {
      errorMessage = `권한 없음 (403): ${fullUrl} 요청에 실패했습니다. 이 API는 인증이 필요할 수 있습니다.`;
    } else {
      errorMessage = `API 요청 실패 (${response.status}): ${errorDetail}`;
    }

    // API 요청 실패 에러를 던져 SWR에서 처리하도록 합니다.
    // **수정된 부분: 'new' 키워드 하나만 사용**
    throw new Error(errorMessage);
  }

  // HTTP 204 No Content인 경우 (예: 삭제), 빈 객체를 반환합니다.
  if (response.status === 204) {
    return {} as T;
  }

  // 5. 성공 응답 반환
  return response.json();
};

/**
 * SWR Mutator 시그니처에 맞춘 POST 요청 전용 Fetcher 함수
 * MutatorOptions import 에러를 해결하기 위해 직접 타입을 정의하지 않고 간단하게 사용합니다.
 */
export const mutationFetcher = async <T>(
  url: string,
  { arg }: { arg: any } // SWR의 useSWRMutation에서 사용하는 arg 구조
): Promise<T> => {
  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify(arg),
    // headers는 fetcher 내부에서 처리
  };

  return fetcher<T>(url, options);
};
