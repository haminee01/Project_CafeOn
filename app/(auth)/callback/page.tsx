"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function CallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          setMessage("소셜 로그인에 실패했습니다.");
          return;
        }

        if (token) {
          // 토큰을 파싱하여 사용자 정보 추출
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userData = {
              userId: payload.sub || payload.userId,
              email: payload.email,
              nickname: payload.nickname || payload.name,
              role: payload.role || "USER",
            };

            // 토큰을 로컬스토리지에 저장
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", token); // 소셜 로그인의 경우 같은 토큰 사용

            setStatus("success");
            setMessage("로그인 성공! 메인 페이지로 이동합니다.");

            // 2초 후 메인 페이지로 리다이렉트
            setTimeout(() => {
              router.push("/");
            }, 2000);
          } catch (parseError) {
            console.error("토큰 파싱 오류:", parseError);
            setStatus("error");
            setMessage("로그인 처리 중 오류가 발생했습니다.");
          }
        } else {
          setStatus("error");
          setMessage("인증 정보를 받아올 수 없습니다.");
        }
      } catch (error) {
        console.error("콜백 처리 오류:", error);
        setStatus("error");
        setMessage("로그인 처리 중 오류가 발생했습니다.");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">로그인 처리 중...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-lg text-gray-600 mb-2">로그인 성공!</p>
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-lg text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
