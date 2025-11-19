/**
 * 애플리케이션 표준 에러 클래스
 * 모든 커스텀 에러의 기본 클래스
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;

    // Error 클래스의 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 사용자에게 표시할 친화적인 메시지 반환
   */
  abstract getUserMessage(): string;

  /**
   * 에러를 JSON 형태로 직렬화
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

/**
 * API 에러 클래스
 * HTTP 요청/응답 관련 에러
 */
export class ApiError extends AppError {
  readonly code = "API_ERROR";
  readonly statusCode: number;
  readonly originalError?: unknown;

  constructor(
    message: string,
    statusCode: number,
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, context);
    this.statusCode = statusCode;
    this.originalError = originalError;
  }

  getUserMessage(): string {
    switch (this.statusCode) {
      case 400:
        return "잘못된 요청입니다. 입력 정보를 확인해주세요.";
      case 401:
        return "로그인이 필요합니다. 다시 로그인해주세요.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청한 리소스를 찾을 수 없습니다.";
      case 409:
        return "이미 존재하는 데이터입니다.";
      case 422:
        return "입력 데이터가 올바르지 않습니다.";
      case 429:
        return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      case 500:
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      case 502:
        return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
      case 503:
        return "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
      default:
        return this.message || "요청 처리 중 오류가 발생했습니다.";
    }
  }
}

/**
 * 네트워크 에러 클래스
 * 네트워크 연결 관련 에러
 */
export class NetworkError extends AppError {
  readonly code = "NETWORK_ERROR";
  readonly statusCode = 0;
  readonly originalError?: unknown;

  constructor(
    message: string = "네트워크 연결에 실패했습니다.",
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, context);
    this.originalError = originalError;
  }

  getUserMessage(): string {
    if (this.message.includes("timeout") || this.message.includes("타임아웃")) {
      return "요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.";
    }
    if (
      this.message.includes("Failed to fetch") ||
      this.message.includes("ERR_NETWORK")
    ) {
      return "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.";
    }
    return "네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
  }
}

/**
 * 검증 에러 클래스
 * 입력 데이터 검증 실패
 */
export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
  readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    fields?: Record<string, string[]>,
    context?: Record<string, unknown>
  ) {
    super(message, context);
    this.fields = fields;
  }

  getUserMessage(): string {
    if (this.fields && Object.keys(this.fields).length > 0) {
      const fieldMessages = Object.entries(this.fields)
        .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
        .join("\n");
      return `입력 정보를 확인해주세요:\n${fieldMessages}`;
    }
    return this.message || "입력 정보가 올바르지 않습니다.";
  }
}

/**
 * 인증 에러 클래스
 * 인증/인가 관련 에러
 */
export class AuthenticationError extends AppError {
  readonly code = "AUTHENTICATION_ERROR";
  readonly statusCode = 401;

  constructor(
    message: string = "인증이 필요합니다.",
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }

  getUserMessage(): string {
    return "로그인이 필요합니다. 다시 로그인해주세요.";
  }
}

/**
 * 권한 에러 클래스
 * 권한 부족 관련 에러
 */
export class AuthorizationError extends AppError {
  readonly code = "AUTHORIZATION_ERROR";
  readonly statusCode = 403;

  constructor(
    message: string = "접근 권한이 없습니다.",
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }

  getUserMessage(): string {
    return "이 작업을 수행할 권한이 없습니다.";
  }
}

/**
 * 알 수 없는 에러 클래스
 * 예상치 못한 에러를 래핑
 */
export class UnknownError extends AppError {
  readonly code = "UNKNOWN_ERROR";
  readonly statusCode = 500;
  readonly originalError?: unknown;

  constructor(
    message: string = "예상치 못한 오류가 발생했습니다.",
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, context);
    this.originalError = originalError;
  }

  getUserMessage(): string {
    return "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}
