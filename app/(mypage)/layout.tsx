"use client";

import MypageSidebar from "../../src/components/mypage/MypageSidebar";

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 로직(로그인 여부 확인) 추가

  return (
    <>
      <div className="flex min-h-[calc(100vh-100px)] max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* 1. 사이드바 영역 */}
        <MypageSidebar />

        {/* 2. 메인 컨텐츠 영역 */}
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </>
  );
}
