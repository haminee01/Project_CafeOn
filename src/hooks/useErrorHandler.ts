"use client";

import { useCallback, useState } from "react";
import { AppError, UnknownError } from "@/errors/AppError";
import { normalizeError, handleError, logError } from "@/utils/errorHandler";

/**
 * 에러 처리 훅의 반환 타입
 */
export interface UseErrorHandlerReturn {
  /**
   * 현재 에러 상태
   */
  error: AppError | null;
  /**
   * 에러가 발생했는지 여부
   */
  hasError: boolean;
  /**
   * 에러를 처리하는 함수
   */
  handleError: (error: unknown, context?: Record<string, unknown>) => string;
  /**
   * 에러를 설정하는 함수
   */
  setError: (error: AppError | null) => void;
  /**
   * 에러를 초기화하는 함수
   */
  clearError: () => void;
  /**
   * 비동기 함수를 실행하고 에러를 자동으로 처리하는 래퍼
   */
  execute: <T>(
    asyncFn: () => Promise<T>,
    context?: Record<string, unknown>
  ) => Promise<T | null>;
  /**
   * 사용자에게 표시할 에러 메시지
   */
  errorMessage: string | null;
}

/**
 * 에러 처리를 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * const { error, handleError, execute, clearError } = useErrorHandler();
 *
 * // 방법 1: execute 사용
 * const result = await execute(async () => {
 *   return await fetchData();
 * });
 *
 * // 방법 2: 직접 처리
 * try {
 *   await fetchData();
 * } catch (err) {
 *   const message = handleError(err, { action: "fetchData" });
 *   toast.error(message);
 * }
 * ```
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);

  /**
   * 에러를 처리하고 사용자 메시지 반환
   */
  const handleErrorWrapper = useCallback(
    (err: unknown, context?: Record<string, unknown>): string => {
      const normalizedError = normalizeError(err, context);
      setError(normalizedError);
      logError(normalizedError, context);
      return normalizedError.getUserMessage();
    },
    []
  );

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 비동기 함수를 실행하고 에러를 자동으로 처리
   */
  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: Record<string, unknown>
    ): Promise<T | null> => {
      try {
        clearError();
        const result = await asyncFn();
        return result;
      } catch (err) {
        handleErrorWrapper(err, context);
        return null;
      }
    },
    [handleErrorWrapper, clearError]
  );

  return {
    error,
    hasError: error !== null,
    handleError: handleErrorWrapper,
    setError,
    clearError,
    execute,
    errorMessage: error ? error.getUserMessage() : null,
  };
}

/**
 * 특정 에러 타입만 처리하는 훅
 */
export function useErrorHandlerWithFilter<T extends AppError>(
  ErrorClass: new (...args: any[]) => T
) {
  const [error, setError] = useState<T | null>(null);

  const handleError = useCallback(
    (err: unknown, context?: Record<string, unknown>) => {
      const normalizedError = normalizeError(err, context);
      if (normalizedError instanceof ErrorClass) {
        setError(normalizedError);
        logError(normalizedError, context);
        return normalizedError.getUserMessage();
      }
      // 필터링되지 않은 에러는 그대로 throw
      throw normalizedError;
    },
    [ErrorClass]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    errorMessage: error ? error.getUserMessage() : null,
  };
}
