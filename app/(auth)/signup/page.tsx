"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { socialProviders, generateSocialAuthUrl } from "@/data/socialAuth";
import Header from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";
import { signup, login } from "@/lib/api";

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SignupStep {
  id: string;
  question: string;
  field:
    | "name"
    | "nickname"
    | "phone"
    | "email"
    | "password"
    | "confirmPassword"
    | "profileImage"
    | "agreeTerms";
  type: "text" | "email" | "tel" | "password" | "file" | "checkbox";
  placeholder?: string;
  validation?: (value: any) => boolean;
  errorMessage?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  // 채팅 관련 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [currentError, setCurrentError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const previousPhoneValue = useRef<string>("");

  // 회원가입 단계 정의
  const signupSteps: SignupStep[] = [
    {
      id: "welcome",
      question:
        "안녕하세요! 👋\n CafeOn.에 오신 것을 환영합니다.\n먼저 이름을 알려주세요!",
      field: "name",
      type: "text",
      placeholder: "이름을 입력하세요",
      validation: (value) => {
        const trimmed = value.trim();
        // 2자 이상이고, 한글, 영문, 숫자만 허용 (기호만으로는 불가)
        const hasValidChars = /^[가-힣a-zA-Z0-9\s]+$/.test(trimmed);
        const hasNonSymbolChars = /[가-힣a-zA-Z0-9]/.test(trimmed);
        return trimmed.length >= 2 && hasValidChars && hasNonSymbolChars;
      },
      errorMessage: "이름은 2자 이상의 한글, 영문으로만 입력해주세요.",
    },
    {
      id: "nickname",
      question:
        "좋은 이름이네요! 😊\n이제 다른 사용자들이 부를 닉네임을 정해주세요.",
      field: "nickname",
      type: "text",
      placeholder: "닉네임을 입력하세요 (1-10자)",
      validation: (value) => {
        const trimmed = value.trim();
        // 1-10자이고, 한글, 영문, 숫자만 허용 (기호만으로는 불가)
        const hasValidChars = /^[가-힣a-zA-Z0-9\s]+$/.test(trimmed);
        const hasKoreanOrEnglish = /[가-힣a-zA-Z]/.test(trimmed);
        return (
          trimmed.length >= 1 &&
          trimmed.length <= 10 &&
          hasValidChars &&
          hasKoreanOrEnglish
        );
      },
      errorMessage: "닉네임은 1-10자이며, 한글 또는 영문을 포함해야 합니다.",
    },
    {
      id: "phone",
      question: "연락처를 알려주시면 더 나은 서비스를 제공할 수 있어요! 📱",
      field: "phone",
      type: "tel",
      placeholder: "010-1234-5678",
      validation: (value) => /^010-\d{4}-\d{4}$/.test(value),
      errorMessage: "올바른 전화번호 형식으로 입력해주세요. (010-1234-5678)",
    },
    {
      id: "email",
      question: "로그인 시 사용할 이메일 주소도 알려주세요! 📧",
      field: "email",
      type: "email",
      placeholder: "example@email.com",
      validation: (value) => {
        const trimmed = value.trim();
        // 기본 이메일 형식 검증
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // 도메인 부분이 최소 2글자 이상인지 확인
        const hasValidDomain =
          trimmed.includes("@") &&
          trimmed.split("@")[1] &&
          trimmed.split("@")[1].split(".")[1] &&
          trimmed.split("@")[1].split(".")[1].length >= 2;
        return emailRegex.test(trimmed) && hasValidDomain;
      },
      errorMessage:
        "올바른 이메일 형식으로 입력해주세요. (예: user@example.com)",
    },
    {
      id: "password",
      question:
        "보안을 위해 비밀번호를 설정해주세요! 🔒\n최소 8자 이상, 영문과 숫자를 포함해주세요.",
      field: "password",
      type: "password",
      placeholder: "비밀번호를 입력하세요 (최소 8자)",
      validation: (value) => {
        const trimmed = value.trim();
        // 8자 이상, 영문과 숫자 포함
        const hasMinLength = trimmed.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(trimmed);
        const hasNumber = /[0-9]/.test(trimmed);
        return hasMinLength && hasLetter && hasNumber;
      },
      errorMessage: "비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.",
    },
    {
      id: "confirmPassword",
      question: "비밀번호를 한 번 더 입력해주세요! ✨",
      field: "confirmPassword",
      type: "password",
      placeholder: "비밀번호를 다시 입력하세요",
      validation: (value) => true, // 입력 처리 함수에서 별도 검증
      errorMessage: "비밀번호가 일치하지 않습니다.",
    },
    {
      id: "profileImage",
      question: "프로필 사진을 업로드하시겠어요? 📸\n(선택사항이에요!)",
      field: "profileImage",
      type: "file",
      validation: () => true,
    },
    {
      id: "agreeTerms",
      question: "마지막으로 이용약관에 동의해주세요! 📋",
      field: "agreeTerms",
      type: "checkbox",
      validation: (value) => value === true,
      errorMessage: "이용약관에 동의해주세요.",
    },
  ];

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string, previousValue: string = "") => {
    // 숫자만 추출
    const phoneNumber = value.replace(/[^0-9]/g, "");
    const prevPhoneNumber = previousValue.replace(/[^0-9]/g, "");

    // 삭제 동작 감지 (숫자 개수가 줄어든 경우)
    const isDeleting = phoneNumber.length < prevPhoneNumber.length;

    // 11자리 초과 시 11자리까지만 허용
    const limitedPhone = phoneNumber.slice(0, 11);

    // 삭제 중이고 하이픈 직후 위치라면 추가 포맷팅 없이 현재 상태 유지
    if (
      isDeleting &&
      (limitedPhone.length === 3 || limitedPhone.length === 7)
    ) {
      // 하이픈 직후 위치에서는 숫자만 반환
      return limitedPhone;
    }

    // 길이에 따라 하이픈 추가
    if (limitedPhone.length > 7) {
      // 010-1234-5678 형식
      return (
        limitedPhone.slice(0, 3) +
        "-" +
        limitedPhone.slice(3, 7) +
        "-" +
        limitedPhone.slice(7)
      );
    } else if (limitedPhone.length > 3) {
      // 010-1234 형식
      return limitedPhone.slice(0, 3) + "-" + limitedPhone.slice(3);
    } else {
      // 010 형식
      return limitedPhone;
    }
  };

  // 채팅 메시지 추가 함수
  const addMessage = (
    content: string,
    type: "bot" | "user" = "bot",
    isTyping = false
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isTyping,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // 타이핑 애니메이션 함수
  const showTyping = () => {
    setIsTyping(true);
    addMessage("", "bot", true);
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    // 에러 초기화
    setCurrentError("");
    // 전화번호 이전 값 초기화
    previousPhoneValue.current = "";
    // 비밀번호 표시 상태 초기화
    setShowPassword(false);

    if (currentStep < signupSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      const nextStep = signupSteps[currentStep + 1];
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => prev.filter((msg) => !msg.isTyping));
          addMessage(nextStep.question);
        }, 500);
      }, 500);
    } else {
      // 회원가입 완료
      setIsComplete(true);
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => prev.filter((msg) => !msg.isTyping));
          addMessage("🎉 회원가입이 완료되었습니다!\n잠시만 기다려주세요...");
          setTimeout(() => {
            handleSignup();
          }, 2000);
        }, 1500);
      }, 500);
    }
  };

  // 입력 처리 함수
  const handleInputSubmit = () => {
    const currentStepData = signupSteps[currentStep];
    if (!currentStepData) return;

    let value = currentInput.trim();

    // 비밀번호 확인 단계에서 별도 검증
    if (
      currentStepData.field === "confirmPassword" &&
      value !== formData.password
    ) {
      const errorMsg =
        currentStepData.errorMessage || "비밀번호가 일치하지 않습니다.";
      setCurrentError(errorMsg);
      return;
    }

    // 유효성 검사
    if (currentStepData.validation && !currentStepData.validation(value)) {
      const errorMsg =
        currentStepData.errorMessage || "올바른 값을 입력해주세요.";
      setCurrentError(errorMsg);
      return;
    }

    // 검증 통과 시 에러 초기화
    setCurrentError("");

    // 폼 데이터 업데이트
    if (currentStepData.field === "profileImage") {
      // 프로필 이미지는 별도 처리
      return;
    } else if (currentStepData.field === "agreeTerms") {
      setAgreeTerms(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        [currentStepData.field]: value,
      }));
    }

    // 사용자 메시지 추가 (비밀번호는 마스킹 처리)
    const displayValue =
      currentStepData.field === "password" ||
      currentStepData.field === "confirmPassword"
        ? "•".repeat(value.length)
        : value;
    addMessage(displayValue, "user");
    setCurrentInput("");

    // 다음 단계로 이동
    setTimeout(() => {
      goToNextStep();
    }, 800);
  };

  // 회원가입 처리
  const handleSignup = async () => {
    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      };

      // 회원가입 API 호출
      const signupResponse = await signup(signupData);
      console.log("회원가입 성공:", signupResponse);

      // 회원가입 성공 후 자동 로그인
      const loginResponse = await login({
        email: formData.email,
        password: formData.password,
      });

      // 로그인 성공 시 토큰 저장 및 홈으로 리다이렉트
      if (loginResponse.data && loginResponse.data.token) {
        const { token, refreshToken } = loginResponse.data;
        const userData = {
          userId: signupResponse.data?.userId || "",
          email: formData.email,
          nickname: formData.nickname,
        };

        // AuthContext의 login 함수 호출
        authLogin(token, refreshToken, userData);

        // 홈으로 리다이렉트
        router.push("/");
      }
    } catch (error: any) {
      console.error("회원가입/로그인 실패:", error);
      // 에러 메시지 표시
      addMessage(
        `오류가 발생했습니다: ${error.message || "다시 시도해주세요."}`,
        "bot"
      );
      setIsComplete(false);
    }
  };

  // 프로필 이미지 업로드 처리
  const handleProfileImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setCurrentError("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        setCurrentError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);

      addMessage("📸 프로필 사진이 업로드되었습니다!", "user");
      setTimeout(() => {
        goToNextStep();
      }, 800);
    }
  };

  // 프로필 이미지 건너뛰기
  const skipProfileImage = () => {
    addMessage("건너뛰기", "user");
    setTimeout(() => {
      goToNextStep();
    }, 800);
  };

  // 이용약관 동의 처리
  const handleAgreeTerms = () => {
    setAgreeTerms(true);
    addMessage("✅ 이용약관에 동의합니다", "user");
    setTimeout(() => {
      goToNextStep();
    }, 800);
  };

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  // 초기화 및 첫 메시지
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      addMessage(signupSteps[0].question);
    }
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSocialSignup = (providerId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const provider = socialProviders.find((p) => p.id === providerId);

    if (provider) {
      const authUrl = generateSocialAuthUrl(provider, baseUrl);
      window.location.href = authUrl;
    } else {
      console.log(`${providerId} 회원가입 시도`);
    }
  };

  const currentStepData = signupSteps[currentStep];
  const isLastStep = currentStep === signupSteps.length - 1;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="h-[calc(100vh-80px)]">
        <div className="w-full h-full bg-white overflow-hidden flex flex-col">
          {/* 뒤로가기 버튼 */}
          <div className="px-4 pt-4 pb-2 bg-[#F4EDE5]">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#6E4213] transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          {/* 채팅 메시지 영역 */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4"
            style={{ backgroundColor: "#F4EDE5" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end space-x-2 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* 봇 아바타 */}
                {message.type === "bot" && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg sm:text-2xl">☕️</span>
                  </div>
                )}

                {/* 메시지 버블 */}
                <div
                  className={`max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl px-4 py-3 sm:px-6 sm:py-4 rounded-2xl relative ${
                    message.type === "user"
                      ? "bg-[#6E4213] text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                  style={{
                    borderRadius:
                      message.type === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                  }}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  ) : (
                    <p className="text-lg md:text-xl whitespace-pre-line leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>

                {/* 사용자 아바타 */}
                {message.type === "user" && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-lg sm:text-2xl">
                      👤
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 진행률 표시 */}
          {!isComplete && (
            <div className="px-6 py-6">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>진행률</span>
                <span>
                  {currentStep + 1} / {signupSteps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#6E4213] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / signupSteps.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* 입력 영역 */}
          {!isComplete && currentStepData && (
            <div className="p-6 bg-white border-t">
              {currentStepData.field === "profileImage" ? (
                <div className="space-y-3">
                  {/* 에러 메시지 표시 */}
                  {currentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <p className="text-red-600 text-sm font-medium flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {currentError}
                      </p>
                    </div>
                  )}

                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setCurrentError("");
                        document
                          .getElementById("profile-image-upload")
                          ?.click();
                      }}
                      className="flex-1 bg-[#6E4213] text-white px-6 py-3 rounded-lg hover:bg-[#C19B6C] transition-colors text-base font-medium"
                    >
                      📸 사진 업로드
                    </button>
                    <button
                      onClick={skipProfileImage}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors text-base font-medium"
                    >
                      건너뛰기
                    </button>
                  </div>
                  {profileImagePreview && (
                    <div className="text-center">
                      <img
                        src={profileImagePreview}
                        alt="프로필 미리보기"
                        className="w-16 h-16 rounded-full mx-auto object-cover"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        업로드된 사진
                      </p>
                    </div>
                  )}
                </div>
              ) : currentStepData.field === "agreeTerms" ? (
                <div className="space-y-3">
                  <button
                    onClick={handleAgreeTerms}
                    className="w-full bg-[#6E4213] text-white px-6 py-4 rounded-lg hover:bg-[#C19B6C] transition-colors text-base font-medium"
                  >
                    ✅ 이용약관에 동의합니다
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    동의하시면 회원가입이 완료됩니다
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* 에러 메시지 표시 */}
                  {currentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <p className="text-red-600 text-sm font-medium flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {currentError}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2 sm:space-x-3">
                    {/* 비밀번호 필드일 때는 눈 아이콘 포함 */}
                    {currentStepData.field === "password" ||
                    currentStepData.field === "confirmPassword" ? (
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={currentStepData.placeholder}
                          value={currentInput}
                          onChange={(e) => {
                            setCurrentInput(e.target.value);
                            if (currentError) {
                              setCurrentError("");
                            }
                          }}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleInputSubmit()
                          }
                          className="w-full px-4 py-3 sm:px-6 sm:py-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E4213] focus:border-transparent outline-none text-base sm:text-lg"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            // 눈 감기 아이콘 (비밀번호 숨기기)
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            // 눈 뜨기 아이콘 (비밀번호 보기)
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
                      </div>
                    ) : (
                      // 일반 입력 필드
                      <input
                        type={currentStepData.type}
                        placeholder={currentStepData.placeholder}
                        value={currentInput}
                        onChange={(e) => {
                          let value = e.target.value;
                          // 전화번호 필드인 경우 실시간으로 하이픈 추가
                          if (currentStepData.field === "phone") {
                            value = formatPhoneNumber(
                              value,
                              previousPhoneValue.current
                            );
                            previousPhoneValue.current = value;
                          }
                          setCurrentInput(value);
                          // 입력 시 에러 메시지 초기화
                          if (currentError) {
                            setCurrentError("");
                          }
                        }}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleInputSubmit()
                        }
                        className="flex-1 px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E4213] focus:border-transparent outline-none text-base sm:text-lg"
                        autoFocus
                      />
                    )}
                    <button
                      onClick={handleInputSubmit}
                      disabled={!currentInput.trim()}
                      className="bg-[#6E4213] text-white px-4 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-[#C19B6C] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                    >
                      전송
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
