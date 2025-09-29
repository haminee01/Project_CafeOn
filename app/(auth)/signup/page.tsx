"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 입력 시 자동으로 하이픈 추가
    if (name === "phone") {
      const phoneNumber = value.replace(/[^0-9]/g, ""); // 숫자만 추출
      let formattedPhone = phoneNumber;
      
      if (phoneNumber.length > 11) {
        // 11자리 초과 시 11자리까지만 허용
        formattedPhone = phoneNumber.slice(0, 11);
      }
      
      if (formattedPhone.length >= 7) {
        // 010-1234-5678 형식
        formattedPhone = formattedPhone.slice(0, 3) + "-" + 
                        formattedPhone.slice(3, 7) + "-" + 
                        formattedPhone.slice(7, 11);
      } else if (formattedPhone.length >= 3) {
        // 010-1234 형식
        formattedPhone = formattedPhone.slice(0, 3) + "-" + formattedPhone.slice(3);
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("이용약관에 동의해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    // 회원가입 로직 구현
    console.log("회원가입 데이터:", formData);
    router.push("/");
  };

  const handleSocialSignup = (provider: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    
    // 실제 OAuth URL로 리다이렉트 (콜백 페이지를 통해 처리)
    switch (provider) {
      case 'naver':
        window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=test&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/naver/callback`)}&state=random_state`;
        break;
      case 'kakao':
        window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=test&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/kakao/callback`)}`;
        break;
      case 'google':
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=test&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/google/callback`)}&scope=openid email profile`;
        break;
      default:
        console.log(`${provider} 회원가입 시도`);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* 헤더 */}
        <div className="text-center my-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600 text-base leading-relaxed mb-2">
            가입하고 무드에 맞는 완벽한 카페를 쉽고 빠르게 발견해보세요.
          </p>
          <p className="text-gray-600 text-base leading-relaxed">
            간단한 절차로 회원 가입을 통해 다양한 혜택을 누리실 수 있습니다.
          </p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              name="nickname"
              placeholder="닉네임을 입력하세요. (1자 이상 10자 이하)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.nickname}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="전화번호를 입력하세요. (예: 010-1234-5678)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              name="email"
              placeholder="이메일 주소를 입력하세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요. (최소 8자)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={8}
            />
          </div>

          {/* 비밀번호 재입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 재입력
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 이용약관 동의 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-600">
              이용약관에 동의합니다.
            </label>
          </div>

          {/* 가입하기 버튼 */}
          <div className="flex justify-end">          
            <Button type="submit" color="primary" size="md" className="w-1/5">
            가입하기
          </Button></div>
        </form>
      </div>
    </div>
  );
}