import { useEffect } from "react";

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

export const useKakaoInit = () => {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).Kakao &&
      KAKAO_APP_KEY &&
      KAKAO_APP_KEY !== "YOUR_KAKAO_APP_KEY"
    ) {
      const kakao = (window as any).Kakao;
      if (!kakao.isInitialized()) {
        try {
          kakao.init(KAKAO_APP_KEY);
          console.log("카카오 SDK 초기화 성공:", kakao.isInitialized());
        } catch (error) {
          console.error("카카오 SDK 초기화 실패:", error);
        }
      }
    } else if (!KAKAO_APP_KEY || KAKAO_APP_KEY === "YOUR_KAKAO_APP_KEY") {
      console.warn(
        "카카오 앱 키가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_KAKAO_APP_KEY를 설정해주세요."
      );
    }
  }, []); // 마운트 시 한 번만 실행
};
