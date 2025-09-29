"use client";

import React, { useState } from "react";

export default function MypageMainPage() {
  const [profile, setProfile] = useState({
    name: "김이름",
    email: "test@test.com",
    keywords: "#데이트 #우중카페 #카공",
  });

  const ProfileIcon = () => (
    <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-4 border-amber-300 overflow-hidden">
      <span className="text-6xl">👤</span>
    </div>
  );

  const KeywordBadge = ({ keyword }: { keyword: string }) => (
    <span className="inline-block bg-amber-100 text-amber-800 text-sm font-medium mr-2 px-3 py-1 rounded-full">
      {keyword}
    </span>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">회원정보</h1>

      {/* 전체 컨테이너 */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* 1. 프로필 카드 (좌측 상단) */}
        <div className="flex flex-col items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm lg:w-1/3 min-w-[250px] max-w-sm mx-auto lg:mx-0">
          <ProfileIcon />
          <p className="mt-4 text-xl font-semibold text-gray-800">닉네임님</p>
          <button className="mt-3 text-sm text-gray-500 hover:text-amber-500 transition-colors">
            프로필 사진 변경
          </button>
        </div>

        {/* 2. 상세 정보 및 수정 폼 (우측) */}
        <div className="flex-1 space-y-8 p-0">
          {/* 2-1. 기본 정보 수정 */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">
                이름
              </span>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">
                이메일
              </span>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl cursor-not-allowed"
              />
            </label>
          </div>

          {/* 2-2. 선호 키워드 설정 */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              선호 키워드 설정
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-base font-medium text-gray-700">
                키워드
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.keywords.split(" ").map((keyword, index) => (
                  <KeywordBadge key={index} keyword={keyword} />
                ))}
              </div>
            </div>
            <button
              className="mt-3 px-4 py-2 text-sm text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors shadow-md"
              // 실제 Next.js 환경에서는 /mypage/keywords 경로로 이동
              onClick={() => console.log("선호 키워드 설정 페이지로 이동")}
            >
              선호 키워드 변경
            </button>
          </div>

          {/* 2-3. 비밀번호 변경 */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              비밀번호 변경
            </span>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="변경할 비밀번호"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
              <input
                type="password"
                placeholder="재입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="px-6 py-2 text-sm text-white bg-amber-700 rounded-xl hover:bg-amber-800 transition-colors shadow-md"
                onClick={() => console.log("비밀번호 변경 요청")}
              >
                변경하기
              </button>
            </div>
          </div>

          {/* 2-4. 회원 탈퇴 버튼 */}
          <div className="pt-8 text-right">
            <button className="text-sm text-gray-400 hover:text-red-500 transition-colors underline">
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
