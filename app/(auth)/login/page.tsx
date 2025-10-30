"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import { useEscapeKey } from "../../../src/hooks/useEscapeKey";
import Header from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";
import { login as loginAPI, requestPasswordReset } from "@/lib/api";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showPasswordReset) {
      setShowPasswordReset(false);
    }
    if (showSuccessModal) {
      setShowSuccessModal(false);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 로그인 API 호출
      const response = await loginAPI({ email, password });
      console.log("로그인 성공:", response);
      console.log("사용자 역할:", response.data?.role);

      if (response.data && response.data.token) {
        const { token, refreshToken } = response.data;
        // 임시로 이메일 기반으로 role 판단
        const userRole =
          email === "reum01060106@gmail.com"
            ? "ADMIN"
            : response.data.role || "USER";

        console.log("최종 사용자 역할:", userRole);

        // AuthContext에 로그인 정보 저장
        authLogin(token, refreshToken, {
          userId: response.data.userId || "",
          email: email,
          nickname: response.data.nickname || email,
          role: userRole,
        });

        // 사용자 역할에 따라 리다이렉트
        if (userRole === "ADMIN") {
          console.log("ADMIN으로 리다이렉트");
          router.push("/admin");
        } else {
          console.log("일반 사용자로 리다이렉트");
          // redirect 파라미터가 있으면 그 경로로, 없으면 홈으로
          router.push(redirectPath || "/");
        }
      }
    } catch (err: any) {
      console.error("로그인 실패:", err);
      setError(err.message || "로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = () => {
    setResetEmail(email); // 현재 입력된 이메일로 초기화
    setResetError("");
    setShowPasswordReset(true);
  };

  const handlePasswordResetSubmit = async () => {
    if (!resetEmail.trim()) {
      setResetError("이메일을 입력해주세요.");
      return;
    }

    setIsResetLoading(true);
    setResetError("");

    try {
      await requestPasswordReset(resetEmail);
      setShowPasswordReset(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("비밀번호 재설정 실패:", err);
      setResetError(err.message || "비밀번호 재설정 요청에 실패했습니다.");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setResetEmail("");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {/* 로그인 카드 */}

          {/* 헤더 */}
          <div className="text-center my-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              카페 OFF 상태, 로그인
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              당신의 무드에 맞는 완벽한 카페를 쉽고 빠르게 발견하기 위해
              로그인하세요.
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {/* 비밀번호 보기/숨기기 버튼 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                  {/* 비밀번호 재설정 버튼 */}
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                    disabled={isLoading}
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              disabled={isLoading}
              color="primary"
              size="md"
              className="w-full"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>

            {/* 회원가입 버튼 */}
            <Button
              type="button"
              color="secondary"
              size="md"
              onClick={handleSignup}
              className="w-full"
            >
              회원가입
            </Button>
          </form>
        </div>
      </div>

      {/* 비밀번호 재설정 모달 */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              비밀번호 재설정
            </h2>
            <p className="text-gray-600 mb-6">
              가입하신 이메일 주소를 입력하시면 임시 비밀번호를 보내드립니다.
            </p>

            <div className="space-y-4">
              {resetError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {resetError}
                </div>
              )}

              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                disabled={isResetLoading}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  color="gray"
                  size="md"
                  onClick={() => setShowPasswordReset(false)}
                  className="flex-1"
                  disabled={isResetLoading}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  color="primary"
                  size="md"
                  onClick={handlePasswordResetSubmit}
                  className="flex-1"
                  disabled={isResetLoading}
                >
                  {isResetLoading ? "전송 중..." : "전송"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                전송 완료!
              </h2>
              <p className="text-gray-600 mb-6">
                임시 비밀번호가 <strong>{resetEmail}</strong>로 발송되었습니다.
                <br />
                메일함을 확인해주세요.
              </p>
              <Button
                type="button"
                color="primary"
                size="md"
                onClick={handleSuccessModalClose}
                className="w-full"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
