"use client";

import { useState, useEffect } from "react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface SnsShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeData: {
    name: string;
    address: string;
    description?: string;
    imageUrl?: string;
    id?: string;
  };
}

export default function SnsShareModal({
  isOpen,
  onClose,
  cafeData,
}: SnsShareModalProps) {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEscapeKey(onClose);

  // 카카오 SDK 로드
  useEffect(() => {
    if (!isOpen) return;

    // 이미 SDK가 로드되어 있는지 확인
    if ((window as any).Kakao) {
      if (!(window as any).Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        if (kakaoKey && kakaoKey !== "YOUR_KAKAO_JAVASCRIPT_KEY") {
          try {
            (window as any).Kakao.init(kakaoKey);
            console.log(
              "✅ Kakao SDK initialized with key:",
              kakaoKey.substring(0, 8) + "..."
            );
          } catch (error) {
            console.error("❌ Kakao SDK initialization failed:", error);
            setIsKakaoLoaded(false);
            return;
          }
        }
      }
      setIsKakaoLoaded(true);
      return;
    }

    // SDK가 없으면 로드
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.async = true;
    script.onload = () => {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (kakaoKey && kakaoKey !== "YOUR_KAKAO_JAVASCRIPT_KEY") {
        try {
          (window as any).Kakao.init(kakaoKey);
          console.log(
            "✅ Kakao SDK loaded and initialized with key:",
            kakaoKey.substring(0, 8) + "..."
          );
          setIsKakaoLoaded(true);
        } catch (error) {
          console.error("❌ Kakao SDK initialization failed:", error);
          setIsKakaoLoaded(false);
        }
      } else {
        console.warn("⚠️ Kakao JavaScript key not configured");
        setIsKakaoLoaded(false);
      }
    };
    script.onerror = () => {
      console.error("❌ Failed to load Kakao SDK script");
      setIsKakaoLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isOpen]);

  // 네이버 공유 위젯 로드
  useEffect(() => {
    if (!isOpen) return;

    // 네이버 공유 위젯이 이미 로드되었는지 확인
    if ((window as any).ShareNaver) {
      console.log("네이버 공유 위젯 이미 로드됨");
      return;
    }

    console.log("네이버 공유 위젯 로드 시작...");

    const naverScript = document.createElement("script");
    naverScript.src = "https://ssl.pstatic.net/share/js/naver_sharebutton.js";
    naverScript.async = true;

    naverScript.onload = () => {
      console.log("네이버 공유 위젯 로드 완료");
    };

    naverScript.onerror = () => {
      console.error("네이버 공유 위젯 로드 실패");
    };

    document.head.appendChild(naverScript);

    return () => {
      if (naverScript.parentNode) {
        naverScript.parentNode.removeChild(naverScript);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = `${cafeData.name} - CafeOn에서 발견한 맛있는 카페`;
  const shareDescription = `${cafeData.address}에 위치한 ${cafeData.name}을(를) CafeOn에서 확인해보세요!`;

  // 로컬 환경 확인 (네이버 공유용)
  const isLocalhost =
    currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1");

  // 카카오톡 공유
  const shareKakao = () => {
    // isKakaoLoaded 상태를 활용하여 로드 여부 확인
    if (!isKakaoLoaded) {
      alert("카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // 이미 isKakaoLoaded를 확인했으니, 이제 초기화 여부만 확인해도 됩니다.
    if (!(window as any).Kakao || !(window as any).Kakao.isInitialized()) {
      // 혹시 모를 상황에 대비한 추가 방어 코드입니다.
      alert("카카오 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    try {
      (window as any).Kakao.Link.sendDefault({
        objectType: "feed",
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl:
            cafeData.imageUrl ||
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop&crop=center",
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
        buttons: [
          {
            title: "카페 보기",
            link: {
              mobileWebUrl: currentUrl,
              webUrl: currentUrl,
            },
          },
        ],
      });
    } catch (error) {
      console.error("카카오톡 공유 실패:", error);
      alert("카카오톡 공유 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  // 네이버 공유 (공식 위젯 사용)
  const shareNaver = () => {
    // 네이버 공유는 로컬 경로에서 작동하지 않음
    if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
      alert(
        "네이버 공유는 로컬 환경에서 작동하지 않습니다.\n실제 도메인으로 배포된 후 사용해주세요."
      );
      return;
    }

    // 네이버 공식 공유 위젯 사용
    if (typeof window !== "undefined" && (window as any).ShareNaver) {
      (window as any).ShareNaver.makeButton({
        type: "e",
        url: currentUrl,
        title: shareTitle,
      });
    } else {
      // 위젯이 로드되지 않은 경우 대체 방법
      const url = encodeURI(encodeURIComponent(currentUrl));
      const title = encodeURI(shareTitle);

      window.open(
        `https://share.naver.com/web/shareView?url=${url}&title=${title}`,
        "_blank",
        "width=600,height=400"
      );
    }
  };

  // 트위터 공유
  const shareTwitter = () => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    const url = encodeURIComponent(currentUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full mx-4 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">카페 공유하기</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 카페 정보 미리보기 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">☕</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{cafeData.name}</h4>
              <p className="text-sm text-gray-600">{cafeData.address}</p>
            </div>
          </div>
        </div>

        {/* SNS 공유 버튼들 */}
        <div className="flex justify-center gap-6">
          {/* 카카오톡 */}
          <button
            onClick={shareKakao}
            disabled={!isKakaoLoaded}
            className={`w-16 h-16 rounded-full transition-all duration-200 hover:scale-110 ${
              isKakaoLoaded
                ? "hover:shadow-lg"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              isKakaoLoaded ? "카카오톡으로 공유" : "카카오톡 (로딩 중...)"
            }
          >
            <img
              src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
              alt="카카오톡 공유"
              className="w-full h-full rounded-full object-cover"
            />
          </button>

          {/* 네이버 */}
          <button
            onClick={shareNaver}
            disabled={isLocalhost}
            className={`w-16 h-16 rounded-full transition-all duration-200 hover:scale-110 ${
              isLocalhost ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
            }`}
            title={isLocalhost ? "네이버 (배포 필요)" : "네이버로 공유"}
          >
            <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">N</span>
            </div>
          </button>

          {/* X (트위터) */}
          <button
            onClick={shareTwitter}
            className="w-16 h-16 rounded-full bg-black hover:bg-gray-800 transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center"
            title="X(트위터)로 공유"
          >
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
        </div>

        {/* URL 복사 버튼 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              navigator.clipboard.writeText(currentUrl);
              alert("URL이 클립보드에 복사되었습니다!");
            }}
            className="w-full flex items-center justify-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">URL 복사</span>
          </button>
        </div>

        {/* 취소 버튼 */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
