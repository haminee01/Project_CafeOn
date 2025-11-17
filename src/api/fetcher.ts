interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

if (!API_BASE_URL) {
  console.error(
    "NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다. API 호출에 실패할 수 있습니다."
  );
}

export const buildFullUrl = (url: string): string => {
  if (!API_BASE_URL) {
    return url;
  }

  try {
    return new URL(url, API_BASE_URL).toString();
  } catch (e) {
    console.error("Invalid API Base URL:", API_BASE_URL, "Error:", e);
    return url;
  }
};

export const fetcher = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = buildFullUrl(url);

  const authToken = localStorage.getItem("accessToken");
  const method = options?.method || "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options?.headers as Record<string, string> | undefined) || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    method: method,
    headers: headers,
  });

  if (!response.ok) {
    let errorMessage = `API 요청 실패 (${response.status}): 응답을 파싱할 수 없습니다.`;
    let errorDetail: string;

    try {
      const errorData: ApiErrorResponse = await response.json();
      errorDetail = errorData.message || response.statusText;
    } catch {
      errorDetail = response.statusText || "응답을 파싱할 수 없습니다.";
    }

    if (response.status === 401) {
      errorMessage = `인증 필요 (401): 로그인이 필요한 서비스입니다.`;
    } else if (response.status === 403) {
      errorMessage = `권한 없음 (403): ${fullUrl} 요청에 실패했습니다. 이 API는 인증이 필요할 수 있습니다.`;
    } else {
      errorMessage = `API 요청 실패 (${response.status}): ${errorDetail}`;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const mutationFetcher = async <T>(
  url: string,
  { arg }: { arg: any }
): Promise<T> => {
  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify(arg),
  };

  return fetcher<T>(url, options);
};
