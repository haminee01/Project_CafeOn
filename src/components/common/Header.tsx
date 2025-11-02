"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadNotifications } from "@/api/chat";

interface HeaderProps {
  className?: string;
}

const Header = ({ className = "" }: HeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = async () => {
    setIsNotificationOpen(false);
    // 드롭다운이 닫힐 때 알림 개수 다시 확인
    if (isAuthenticated) {
      try {
        const notifications = await getUnreadNotifications();
        const unreadNotifications = notifications.filter((n) => !n.read);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error("알림 개수 조회 실패:", error);
      }
    }
  };

  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // 알림 개수 조회 및 실시간 업데이트
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchNotificationCount = async () => {
      try {
        const notifications = await getUnreadNotifications();
        const unreadNotifications = notifications.filter((n) => !n.read);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error("알림 개수 조회 실패:", error);
      }
    };

    // 초기 로드
    fetchNotificationCount();

    // 주기적으로 알림 개수 확인 (10초마다) - 더 빠른 업데이트
    const intervalId = setInterval(fetchNotificationCount, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  return (
    <header className={`header-component ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleNotification}
                className="text-gray-800 font-normal text-base hover:text-primary transition-colors relative"
              >
                <IoNotificationsOutline className="w-6 h-6 text-gray-600" />
                {/* 읽지 않은 알림이 있으면 빨간 점 표시 */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={closeNotification}
                onNotificationCountChange={setUnreadCount}
              />
            </div>

            <Link href="/qna" className="text-gray-800 font-normal text-lg">
              QnA
            </Link>
            <Link
              href="/community"
              className="text-gray-800 font-normal text-base"
            >
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
            {isLoading ? (
              // 초기 로딩 중일 때는 기본적으로 로그인 버튼 표시 (토큰 확인 중)
              <Link
                href="/login"
                className="text-gray-800 font-normal text-base hover:text-primary transition-colors"
              >
                로그인
              </Link>
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/mypage"
                  className="text-gray-800 font-normal text-base"
                >
                  마이페이지
                </Link>
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
                  className="text-gray-800 font-normal text-base hover:text-primary transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-gray-800 font-normal text-base hover:text-primary transition-colors"
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
