# 에러 처리 표준화 가이드

이 문서는 CafeOn 프로젝트의 표준화된 에러 처리 시스템 사용 방법을 설명합니다.

## 개요

프로젝트는 일관성 있고 사용자 친화적인 에러 처리를 위해 다음 시스템을 제공합니다:

1. **표준화된 에러 클래스** - 타입 안전한 에러 처리
2. **전역 에러 바운더리** - React 컴포넌트 에러 자동 처리
3. **useErrorHandler 훅** - 컴포넌트에서 간편한 에러 처리
4. **에러 처리 유틸리티** - API 및 비동기 작업 에러 처리

## 에러 클래스

### AppError (기본 클래스)

모든 커스텀 에러의 기본 클래스입니다.

```typescript
import { AppError } from "@/errors";

// AppError는 직접 사용하지 않고, 하위 클래스를 사용합니다
```

### ApiError

HTTP API 요청/응답 관련 에러입니다.

```typescript
import { ApiError } from "@/errors";

// 상태 코드별로 자동으로 사용자 친화적인 메시지 제공
// 400: "잘못된 요청입니다. 입력 정보를 확인해주세요."
// 401: "로그인이 필요합니다. 다시 로그인해주세요."
// 403: "접근 권한이 없습니다."
// 404: "요청한 리소스를 찾을 수 없습니다."
// 500: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
```

### NetworkError

네트워크 연결 관련 에러입니다.

```typescript
import { NetworkError } from "@/errors";

// 네트워크 연결 실패, 타임아웃 등을 처리
// 사용자 메시지: "네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요."
```

### ValidationError

입력 데이터 검증 실패 에러입니다.

```typescript
import { ValidationError } from "@/errors";

// 필드별 검증 에러를 포함할 수 있음
const error = new ValidationError("입력 정보가 올바르지 않습니다.", {
  email: ["이메일 형식이 올바르지 않습니다."],
  password: ["비밀번호는 8자 이상이어야 합니다."],
});
```

### AuthenticationError / AuthorizationError

인증/인가 관련 에러입니다.

```typescript
import { AuthenticationError, AuthorizationError } from "@/errors";

// 401 에러 → AuthenticationError
// 403 에러 → AuthorizationError
```

## 에러 처리 유틸리티

### normalizeError

알 수 없는 에러를 표준화된 AppError로 변환합니다.

```typescript
import { normalizeError } from "@/utils/errorHandler";

try {
  await apiCall();
} catch (error) {
  const appError = normalizeError(error, { action: "apiCall" });
  // appError는 항상 AppError 타입
  console.log(appError.getUserMessage());
}
```

### handleError

에러를 처리하고 사용자 메시지를 반환합니다.

```typescript
import { handleError } from "@/utils/errorHandler";

try {
  await apiCall();
} catch (error) {
  const userMessage = handleError(error, { action: "apiCall" });
  toast.error(userMessage);
}
```

## useErrorHandler 훅

컴포넌트에서 에러를 쉽게 처리할 수 있는 훅입니다.

### 기본 사용법

```typescript
import { useErrorHandler } from "@/hooks/useErrorHandler";

function MyComponent() {
  const { error, handleError, execute, clearError, errorMessage } =
    useErrorHandler();

  // 방법 1: execute 사용 (권장)
  const handleSubmit = async () => {
    const result = await execute(
      async () => {
        return await signup(userData);
      },
      { action: "signup" }
    );

    if (result) {
      toast.success("회원가입 성공!");
    }
    // 에러는 자동으로 처리됨
  };

  // 방법 2: 직접 처리
  const handleSubmit2 = async () => {
    try {
      await signup(userData);
      toast.success("회원가입 성공!");
    } catch (err) {
      const message = handleError(err, { action: "signup" });
      toast.error(message);
    }
  };

  return (
    <div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      <button onClick={handleSubmit}>제출</button>
    </div>
  );
}
```

### execute 메서드

비동기 함수를 실행하고 에러를 자동으로 처리합니다.

```typescript
const { execute } = useErrorHandler();

// 성공 시 결과 반환, 실패 시 null 반환
const data = await execute(
  async () => {
    return await fetchData();
  },
  { action: "fetchData" }
);

if (data) {
  // 성공 처리
}
```

## ErrorBoundary 컴포넌트

React 컴포넌트 트리에서 발생하는 에러를 자동으로 캐치합니다.

### 전역 사용 (이미 적용됨)

`app/layout.tsx`에 이미 적용되어 있습니다:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 특정 컴포넌트에 적용

```typescript
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

function MyPage() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div>
          <p>{error.getUserMessage()}</p>
          <button onClick={reset}>다시 시도</button>
        </div>
      )}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### HOC 사용

```typescript
import { withErrorBoundary } from "@/components/errors/ErrorBoundary";

const MyComponent = () => {
  // ...
};

export default withErrorBoundary(MyComponent);
```

## API 함수에서 에러 처리

### 표준 패턴

```typescript
import { normalizeError } from "@/utils/errorHandler";

export async function myApiFunction(params: MyParams) {
  try {
    const response = await apiClient.get("/api/endpoint", { params });
    return response.data;
  } catch (error) {
    // 표준화된 에러로 변환하여 throw
    throw normalizeError(error, {
      action: "myApiFunction",
      params,
    });
  }
}
```

### 특수한 경우 처리

```typescript
export async function getNearbyCafes(params: NearbyParams) {
  try {
    const response = await apiClient.get("/api/cafes/nearby", { params });
    return response.data;
  } catch (error) {
    const normalizedError = normalizeError(error, {
      action: "getNearbyCafes",
      params,
    });

    // 타임아웃 등 특수한 경우 빈 배열 반환
    if (
      normalizedError.code === "NETWORK_ERROR" &&
      normalizedError.message.includes("timeout")
    ) {
      return [];
    }

    // 일반적인 경우 에러 throw
    throw normalizedError;
  }
}
```

## 컴포넌트에서 에러 처리

### React Query와 함께 사용

```typescript
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { getCafeDetail } from "@/lib/api";

function CafeDetail({ cafeId }: { cafeId: string }) {
  const { handleError } = useErrorHandler();

  const { data, error } = useQuery({
    queryKey: ["cafe", cafeId],
    queryFn: () => getCafeDetail(cafeId),
    onError: (error) => {
      const message = handleError(error, { action: "getCafeDetail", cafeId });
      toast.error(message);
    },
  });

  if (error) {
    return <div>에러가 발생했습니다.</div>;
  }

  return <div>{/* ... */}</div>;
}
```

### 직접 try-catch 사용

```typescript
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { signup } from "@/lib/api";

function SignupForm() {
  const { execute } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: SignupData) => {
    setIsLoading(true);

    const result = await execute(async () => await signup(formData), {
      action: "signup",
    });

    setIsLoading(false);

    if (result) {
      toast.success("회원가입 성공!");
      router.push("/login");
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## 에러 타입 확인

### 특정 에러 타입 확인

```typescript
import { isErrorType, ApiError, NetworkError } from "@/utils/errorHandler";

try {
  await apiCall();
} catch (error) {
  if (isErrorType(error, NetworkError)) {
    // 네트워크 에러 특별 처리
    console.log("네트워크 에러:", error.getUserMessage());
  } else if (isErrorType(error, ApiError)) {
    // API 에러 처리
    console.log("API 에러:", error.statusCode);
  }
}
```

### 상태 코드 확인

```typescript
import { isErrorStatus } from "@/utils/errorHandler";

try {
  await apiCall();
} catch (error) {
  if (isErrorStatus(error, 401)) {
    // 401 에러 특별 처리
    router.push("/login");
  }
}
```

## 모범 사례

1. **API 함수에서는 항상 normalizeError 사용**

   ```typescript
   catch (error) {
     throw normalizeError(error, { action: "functionName", context });
   }
   ```

2. **컴포넌트에서는 useErrorHandler 훅 사용**

   ```typescript
   const { execute, errorMessage } = useErrorHandler();
   ```

3. **사용자에게는 항상 getUserMessage() 사용**

   ```typescript
   toast.error(error.getUserMessage());
   ```

4. **에러 로깅은 자동으로 처리됨** (개발 환경에서만 상세 로그)

5. **특수한 경우만 빈 값 반환** (예: getNearbyCafes의 타임아웃)

## 마이그레이션 가이드

기존 코드를 새로운 에러 처리 시스템으로 마이그레이션하는 방법:

### Before

```typescript
try {
  const response = await apiClient.get("/api/endpoint");
  return response.data;
} catch (error) {
  console.error("API 호출 실패:", error);
  const { message } = normalizeError(error);
  throw new Error(message || "API 호출 실패");
}
```

### After

```typescript
try {
  const response = await apiClient.get("/api/endpoint");
  return response.data;
} catch (error) {
  throw normalizeError(error, { action: "getEndpoint" });
}
```

## 추가 리소스

- 에러 클래스 정의: `src/errors/AppError.ts`
- 에러 처리 유틸리티: `src/utils/errorHandler.ts`
- useErrorHandler 훅: `src/hooks/useErrorHandler.ts`
- ErrorBoundary 컴포넌트: `src/components/errors/ErrorBoundary.tsx`
