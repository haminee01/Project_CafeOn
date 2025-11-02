"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { socialSharePlatforms } from "@/data/modalData";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useKakaoInit } from "../../hooks/useKakaoInit";
import { useToastContext } from "@/components/common/ToastProvider";

interface ShareModalProps {
  onClose: () => void;
  cafe: {
    name: string;
    address: string;
    photoUrl?: string | null;
    images?: string[];
  };
  cafeId?: string | number;
}

export default function ShareModal({ onClose, cafe, cafeId }: ShareModalProps) {
  useEscapeKey(onClose);
  useKakaoInit(); // 카카오 SDK 초기화
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isLocalhost, setIsLocalhost] = useState(false);
  const { showToast } = useToastContext();

  useEffect(() => {
    // 현재 페이지 URL 가져오기
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      // cafeId가 있으면 해당 카페 상세 페이지 URL, 없으면 현재 URL 사용
      if (cafeId && !currentUrl.includes(`/cafes/${cafeId}`)) {
        setShareUrl(`${window.location.origin}/cafes/${cafeId}`);
      } else {
        setShareUrl(currentUrl);
      }

      // 로컬 환경 체크 (localhost, 127.0.0.1, 또는 file://)
      setIsLocalhost(
        window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.protocol === "file:"
      );
    }
  }, [cafeId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("링크 복사 실패:", err);
      showToast("링크 복사에 실패했습니다.", "error");
    }
  };

  const handleSocialShare = (platformId: string) => {
    const text = `${cafe.name} - ${cafe.address}`;
    const url = shareUrl;
    
    // 카페 이미지 URL 가져오기 (photoUrl 우선, 없으면 images 첫 번째)
    const cafeImageUrl = cafe.photoUrl || (cafe.images && cafe.images.length > 0 ? cafe.images[0] : null) 
      || "https://mud-kage.kakao.com/dn/Q2iNx/btqgeRgV54P/VLdBs9cvyn8BJXB3o7N8UK/kakaolink40_original.png";

    switch (platformId) {
      case "instagram":
        // Instagram은 직접 공유 API가 제한적이므로 클립보드에 복사
        navigator.clipboard.writeText(`${text}\n${url}`);
        showToast(
          "링크가 클립보드에 복사되었습니다. Instagram에 붙여넣기 해주세요.",
          "success"
        );
        break;
      case "kakao":
        // Kakao Talk 공유
        if (typeof window !== "undefined" && (window as any).Kakao) {
          const kakao = (window as any).Kakao;

          // 초기화 확인 및 재시도
          if (!kakao.isInitialized()) {
            const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
            if (appKey && appKey !== "YOUR_KAKAO_APP_KEY") {
              try {
                kakao.init(appKey);
                console.log("카카오 SDK 재초기화 완료");
              } catch (error) {
                console.error("카카오 SDK 초기화 실패:", error);
                showToast(
                  "카카오톡 공유 초기화에 실패했습니다. 링크가 클립보드에 복사됩니다.",
                  "error"
                );
                navigator.clipboard.writeText(`${text}\n${url}`);
                return;
              }
            } else {
              console.error("카카오 앱 키가 설정되지 않았습니다.");
              showToast(
                "카카오톡 공유를 위해 앱 키를 설정해주세요. 링크가 클립보드에 복사되었습니다.",
                "error"
              );
              navigator.clipboard.writeText(`${text}\n${url}`);
              return;
            }
          }

          try {
            kakao.Share.sendDefault({
              objectType: "feed",
              content: {
                title: cafe.name,
                description: cafe.address,
                imageUrl: cafeImageUrl, // 카페 이미지 URL 사용
                link: {
                  mobileWebUrl: url,
                  webUrl: url,
                },
              },
              buttons: [
                {
                  title: "웹으로 보기",
                  link: {
                    mobileWebUrl: url,
                    webUrl: url,
                  },
                },
              ],
            });
            console.log("카카오톡 공유 성공");
          } catch (error) {
            console.error("카카오톡 공유 실패:", error);
            showToast(
              "카카오톡 공유에 실패했습니다. 링크가 클립보드에 복사됩니다.",
              "error"
            );
            navigator.clipboard.writeText(`${text}\n${url}`);
          }
        } else {
          // Kakao SDK가 로드되지 않았으면 클립보드에 복사
          console.warn("Kakao SDK가 로드되지 않았습니다.");
          navigator.clipboard.writeText(`${text}\n${url}`);
          showToast(
            "카카오톡 SDK가 로드되지 않았습니다. 링크가 클립보드에 복사되었습니다.",
            "error"
          );
        }
        break;
      case "naver":
        // 네이버 공유하기
        const naverUrl = `https://share.naver.com/web/shareView?url=${encodeURI(
          encodeURIComponent(url)
        )}&title=${encodeURI(cafe.name)}`;
        window.open(naverUrl, "_blank", "noopener,noreferrer");
        break;
      case "blog":
        // 네이버 블로그 공유
        const blogUrl = `https://blog.naver.com/PostWriteForm.naver?title=${encodeURIComponent(
          cafe.name
        )}&content=${encodeURIComponent(`${cafe.address}\n\n${url}`)}`;
        window.open(blogUrl, "_blank", "noopener,noreferrer");
        break;
      case "twitter":
        // 트위터 공유
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
        break;
      case "facebook":
        // 페이스북 공유
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        window.open(facebookUrl, "_blank", "noopener,noreferrer");
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">공유하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

        <div className="space-y-6">
          {/* 링크 보내기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 보내기
            </label>
            <input
              type="text"
              value={`${cafe.name} (${cafe.address})`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              readOnly
            />
          </div>

          {/* 공유할 링크 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공유할 링크
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl || "URL을 불러오는 중..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                readOnly
              />
              <button
                onClick={handleCopyLink}
                disabled={!shareUrl}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : shareUrl
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {copied ? "복사됨!" : "링크 복사"}
              </button>
            </div>
          </div>

          {/* 소셜 미디어 공유 */}
          <div className="flex justify-center gap-4 flex-wrap">
            {/* KakaoTalk */}
            <button
              onClick={() => handleSocialShare("kakao")}
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-white"
              title="카카오톡"
            >
              <Image
                src="/images/social/kakao.jpg"
                alt="카카오톡"
                width={48}
                height={48}
                className="object-cover"
              />
            </button>

            {/* 네이버 공유하기 */}
            <button
              onClick={() => !isLocalhost && handleSocialShare("naver")}
              disabled={isLocalhost}
              className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-shadow relative overflow-hidden bg-white ${
                isLocalhost
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg"
              }`}
              title={
                isLocalhost
                  ? "네이버 공유하기 (배포 후 사용 가능)"
                  : "네이버 공유하기"
              }
            >
              <Image
                src="/images/social/naver.jpg"
                alt="네이버"
                width={48}
                height={48}
                className="object-cover"
              />
              {isLocalhost && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs z-10">
                  !
                </span>
              )}
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() => handleSocialShare("twitter")}
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-white"
              title="X (Twitter)"
            >
              <Image
                src="/images/social/twitter.jpg"
                alt="X (Twitter)"
                width={48}
                height={48}
                className="object-cover"
              />
            </button>
          </div>

          {isLocalhost && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 네이버 공유하기는 배포 환경에서만 사용 가능합니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
