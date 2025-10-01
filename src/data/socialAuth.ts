// 소셜 로그인 제공자 정보
export interface SocialProvider {
  id: string;
  name: string;
  color: string;
  icon: string;
  authUrl: string;
  callbackPath: string;
}

export const socialProviders: SocialProvider[] = [
  {
    id: "naver",
    name: "네이버",
    color: "#03C75A",
    icon: "N",
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
    callbackPath: "/api/auth/naver/callback",
  },
  {
    id: "kakao",
    name: "카카오톡",
    color: "#FEE500",
    icon: "TALK",
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    callbackPath: "/api/auth/kakao/callback",
  },
  {
    id: "google",
    name: "Google",
    color: "#FFFFFF",
    icon: "google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    callbackPath: "/api/auth/google/callback",
  },
];

// OAuth 스코프 정보
export const oauthScopes = {
  naver: ["name", "email", "nickname"],
  kakao: ["profile", "account_email"],
  google: ["openid", "email", "profile"],
};

// 소셜 로그인 버튼 스타일
export const socialButtonStyles = {
  naver: "bg-[#03C75A] hover:bg-[#02B34A] text-white",
  kakao: "bg-[#FEE500] hover:bg-[#E6CF00] text-[#3C1E1E]",
  google: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
};

// 소셜 로그인 아이콘 SVG (문자열로 저장)
export const socialIcons = {
  google: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.47 12.27c0-.79-.07-1.54-.2-2.28H12v4.31h5.87c-.26 1.37-1.04 2.54-2.21 3.32v3.01h3.87c2.26-2.09 3.56-5.17 3.56-8.36z"
      fill="#4285F4"
    />
    <path
      d="M12 23c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.01c-1.07.72-2.45 1.14-4.06 1.14-3.13 0-5.78-2.11-6.73-4.96H1.44v3.09C3.43 20.5 7.3 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.27 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H1.44c-.75 1.48-1.18 3.15-1.18 4.93s.43 3.45 1.18 4.93l3.83-2.98z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>`,
  kakao: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L6.526 21.83c-.434.434-.75.434-1.184 0-.434-.434-.434-.75 0-1.184l3.747-3.747c-2.436-1.436-4.085-3.664-4.085-6.184C5.004 6.664 9.201 3 12 3z"/>
  </svg>`,
};

// 소셜 로그인 URL 생성 함수
export function generateSocialAuthUrl(
  provider: SocialProvider,
  baseUrl: string
): string {
  const params = new URLSearchParams();

  switch (provider.id) {
    case "naver":
      params.append("response_type", "code");
      params.append("client_id", process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "");
      params.append("redirect_uri", `${baseUrl}${provider.callbackPath}`);
      params.append("state", "random_state");
      break;

    case "kakao":
      params.append("response_type", "code");
      params.append("client_id", process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "");
      params.append("redirect_uri", `${baseUrl}${provider.callbackPath}`);
      break;

    case "google":
      params.append("response_type", "code");
      params.append(
        "client_id",
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
      );
      params.append("redirect_uri", `${baseUrl}${provider.callbackPath}`);
      params.append("scope", oauthScopes.google.join(" "));
      break;
  }

  return `${provider.authUrl}?${params.toString()}`;
}
