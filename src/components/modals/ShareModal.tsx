"use client";

import { useState } from "react";
import { socialSharePlatforms } from "@/data/modalData";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface ShareModalProps {
  onClose: () => void;
  cafe: {
    name: string;
    address: string;
  };
}

export default function ShareModal({ onClose, cafe }: ShareModalProps) {
  useEscapeKey(onClose);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://maps.app.goo.gl/WVyWeMFKACJHDn3x6");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  };

  const handleSocialShare = (platformId: string) => {
    const text = `${cafe.name} (${cafe.address})`;
    const url = "https://maps.app.goo.gl/WVyWeMFKACJHDn3x6";
    
    switch (platformId) {
      case 'instagram':
        // Instagram은 직접 공유 API가 제한적이므로 클립보드에 복사
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('링크가 클립보드에 복사되었습니다. Instagram에 붙여넣기 해주세요.');
        break;
      case 'kakao':
        // Kakao Talk 공유 (실제로는 Kakao SDK 필요)
        console.log('Kakao Talk 공유:', text, url);
        break;
      case 'blog':
        // 네이버 블로그 공유
        const blogUrl = `https://blog.naver.com/PostWriteForm.naver?title=${encodeURIComponent(text)}&content=${encodeURIComponent(url)}`;
        window.open(blogUrl, '_blank');
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                value="https://maps.app.goo.gl/WVyWeMFKACJHDn3x6"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                readOnly
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? '복사됨!' : '링크 복사'}
              </button>
            </div>
          </div>

          {/* 소셜 미디어 공유 */}
          <div className="flex justify-center gap-6">
            {/* Instagram */}
            <button
              onClick={() => handleSocialShare('instagram')}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
              }}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>

            {/* KakaoTalk */}
            <button
              onClick={() => handleSocialShare('kakao')}
              className="w-12 h-12 bg-[#FEE500] rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              <svg className="w-6 h-6 text-[#3C1E1E]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L6.526 21.83c-.434.434-.75.434-1.184 0-.434-.434-.434-.75 0-1.184l3.747-3.747c-2.436-1.436-4.085-3.664-4.085-6.184C5.004 6.664 9.201 3 12 3z"/>
              </svg>
            </button>

            {/* Blog */}
            <button
              onClick={() => handleSocialShare('blog')}
              className="w-12 h-12 bg-[#03C75A] rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="text-white font-bold text-sm">blog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
