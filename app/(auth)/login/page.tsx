"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { socialProviders, generateSocialAuthUrl } from "@/data/socialAuth";
import { useEscapeKey } from "../../../src/hooks/useEscapeKey";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isLoading } = useAuth();

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showPasswordReset) {
      setShowPasswordReset(false);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.message || "로그인에 실패했습니다.");
    }
  };

  const handleSocialLogin = (providerId: string) => {
    // 백엔드 OAuth2 소셜 로그인 엔드포인트로 리다이렉트 (백엔드 스펙에 맞춤)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const authUrl = `${baseUrl}/oauth2/authorization/${providerId}`;
    window.location.href = authUrl;
  };

  const handlePasswordReset = () => {
    setShowPasswordReset(true);
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              color="primary"
              size="md"
              className="w-full"
              disabled={isLoading}
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

          {/* 소셜 로그인 */}
          <div className="mt-8">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">SNS 계정으로 로그인</p>
              <p className="text-xs text-gray-500 mt-1">
                로그인하면 서비스 이용약관에 동의하는 것으로 간주됩니다.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {/* 네이버 로그인 */}
              <button
                onClick={() => handleSocialLogin("naver")}
                className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <span className="text-white font-bold text-lg">N</span>
              </button>

              {/* 카카오 로그인 */}
              <button
                onClick={() => handleSocialLogin("kakao")}
                className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors"
              >
                <span className="text-black font-bold text-xs">TALK</span>
              </button>

              {/* 구글 로그인 */}
              <button
                onClick={() => handleSocialLogin("google")}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
            </div>
          </div>
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
              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를
              보내드립니다.
            </p>

            <form className="space-y-4">
              <input
                type="email"
                placeholder="이메일 주소"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  color="gray"
                  size="md"
                  onClick={() => setShowPasswordReset(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="md"
                  className="flex-1"
                >
                  전송
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
