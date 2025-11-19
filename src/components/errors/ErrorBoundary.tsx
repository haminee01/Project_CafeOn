"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AppError, UnknownError } from "@/errors/AppError";
import { normalizeError } from "@/utils/errorHandler";

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * 에러 발생 시 표시할 커스텀 Fallback UI
   */
  fallback?: (error: AppError, resetError: () => void) => ReactNode;
  /**
   * 에러 발생 시 호출되는 콜백
   */
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  /**
   * 특정 에러 타입은 무시하고 상위로 전파
   */
  ignoreErrors?: Array<new (...args: any[]) => AppError>;
}

interface ErrorBoundaryState {
  error: AppError | null;
  hasError: boolean;
}

/**
 * 전역 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하여 처리
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>{error.getUserMessage()}</p>
 *       <button onClick={reset}>다시 시도</button>
 *     </div>
 *   )}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    const normalizedError = normalizeError(error);
    return {
      error: normalizedError,
      hasError: true,
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    const normalizedError = normalizeError(error, {
      componentStack: errorInfo.componentStack,
    });

    // 에러 로깅
    console.error("ErrorBoundary caught an error:", {
      error: normalizedError,
      errorInfo,
    });

    // 콜백 호출
    if (this.props.onError) {
      this.props.onError(normalizedError, errorInfo);
    }

    // TODO: 에러 리포팅 서비스로 전송
    // reportError(normalizedError, { errorInfo });
  }

  resetError = () => {
    this.setState({
      error: null,
      hasError: false,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 무시할 에러인지 확인
      if (this.props.ignoreErrors) {
        const shouldIgnore = this.props.ignoreErrors.some(
          (ErrorClass) => this.state.error instanceof ErrorClass
        );
        if (shouldIgnore) {
          throw this.state.error;
        }
      }

      // 커스텀 Fallback UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // 기본 Fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 기본 에러 Fallback UI
 */
interface DefaultErrorFallbackProps {
  error: AppError;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6">{error.getUserMessage()}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onReset}
            className="w-full bg-[#6E4213] text-white py-2 px-4 rounded-lg hover:bg-[#8B5A2B] transition-colors font-medium"
          >
            다시 시도
          </button>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              개발자 정보 (개발 모드)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
              {JSON.stringify(error.toJSON(), null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * HOC: 컴포넌트를 ErrorBoundary로 감싸기
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
