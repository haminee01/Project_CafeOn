"use client";

import Link from "next/link";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link
              href="/notification"
              className="text-gray-800 font-normal text-base"
            >
              <IoNotificationsOutline className="w-6 h-6 text-gray-600" />
            </Link>
            <Link href="/faq" className="text-gray-800 font-normal text-base">
              FAQ
            </Link>
            <Link href="/" className="text-gray-800 font-normal text-base">
              ToCafe
            </Link>
          </div>

          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-4xl font-bold text-primary cursor-pointer">
                CafeOn.
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/mypage"
                  className="text-gray-800 font-normal text-base"
                >
                  마이페이지
                </Link>
                <span className="text-gray-600 text-sm">
                  안녕하세요, {user?.nickname}님!
                </span>
                <button
                  onClick={logout}
                  className="text-gray-800 font-normal text-base hover:text-primary transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-800 font-normal text-base"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-gray-800 font-normal text-base"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
