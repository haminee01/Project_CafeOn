import { isAxiosError } from "axios";
import {
  AppError,
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  UnknownError,
} from "@/errors/AppError";

/**
 * 에러 타입 가드
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 알 수 없는 에러를 AppError로 변환
 */
export function normalizeError(
  error: unknown,
  context?: Record<string, unknown>
): AppError {
  // 이미 AppError인 경우 그대로 반환
  if (isAppError(error)) {
    return error;
  }

  // Axios 에러 처리
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "API 요청에 실패했습니다.";

    // 네트워크 에러 (연결 실패, 타임아웃 등)
    if (
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message.includes("Network Error") ||
        error.message.includes("timeout"))
    ) {
      return new NetworkError(
        error.message || "네트워크 연결에 실패했습니다.",
        error,
        { ...context, axiosCode: error.code }
      );
    }

    // HTTP 상태 코드별 에러 처리
    if (status) {
      if (status === 401) {
        return new AuthenticationError(message, {
          ...context,
          originalError: error,
        });
      }

      if (status === 403) {
        return new AuthorizationError(message, {
          ...context,
          originalError: error,
        });
      }

      if (status === 400 || status === 422) {
        const fields =
          error.response?.data?.fields || error.response?.data?.errors;
        return new ValidationError(message, fields, {
          ...context,
          originalError: error,
        });
      }

      return new ApiError(message, status, error, {
        ...context,
        originalError: error,
      });
    }

    // 응답이 없는 경우 네트워크 에러로 처리
    return new NetworkError(
      error.message || "네트워크 연결에 실패했습니다.",
      error,
      { ...context, axiosCode: error.code }
    );
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    // 이미 정의된 에러 메시지 패턴 확인
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return new NetworkError(error.message, error, context);
    }

    if (
      errorMessage.includes("validation") ||
      errorMessage.includes("invalid")
    ) {
      return new ValidationError(error.message, undefined, context);
    }

    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("인증")
    ) {
      return new AuthenticationError(error.message, context);
    }

    if (errorMessage.includes("forbidden") || errorMessage.includes("권한")) {
      return new AuthorizationError(error.message, context);
    }

    // 일반 Error를 UnknownError로 래핑
    return new UnknownError(error.message, error, context);
  }

  // 문자열 에러
  if (typeof error === "string") {
    return new UnknownError(error, undefined, context);
  }

  // 알 수 없는 타입의 에러
  return new UnknownError("예상치 못한 오류가 발생했습니다.", error, context);
}

/**
 * 에러를 로깅 (개발 환경에서만 상세 로그)
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const normalizedError = normalizeError(error, context);

  if (process.env.NODE_ENV === "development") {
    console.error("🚨 Error occurred:", {
      error: normalizedError,
      context,
      stack:
        normalizedError instanceof Error ? normalizedError.stack : undefined,
    });
  } else {
    // 프로덕션에서는 간단한 로그만
    console.error("Error:", normalizedError.getUserMessage());
  }

  // TODO: 에러 리포팅 서비스 연동 (Sentry, LogRocket 등)
  // if (process.env.NODE_ENV === "production") {
  //   reportError(normalizedError, context);
  // }

  return normalizedError;
}

/**
 * 에러를 안전하게 처리하고 사용자 메시지 반환
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): string {
  const normalizedError = logError(error, context);
  return normalizedError.getUserMessage();
}

/**
 * 에러가 특정 타입인지 확인
 */
export function isErrorType<T extends AppError>(
  error: unknown,
  ErrorClass: new (...args: any[]) => T
): error is T {
  return error instanceof ErrorClass;
}

/**
 * 에러가 특정 상태 코드인지 확인
 */
export function isErrorStatus(error: unknown, statusCode: number): boolean {
  if (isAppError(error)) {
    return error.statusCode === statusCode;
  }
  return false;
}
