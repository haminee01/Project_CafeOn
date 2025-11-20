"use client";

import MypageSidebar from "../../src/components/mypage/MypageSidebar";
import Header from "../../src/components/common/Header";
import Footer from "../../src/components/common/Footer";

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 로직(로그인 여부 확인) 추가

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)] max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        {/* 1. 사이드바 영역 */}
        <MypageSidebar />

        {/* 2. 메인 컨텐츠 영역 */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>

      <Footer />
    </div>
  );
}
