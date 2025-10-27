"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadNotifications } from "@/api/chat";

const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  const { isAuthenticated, user, logout } = useAuth();

  // 알림 개수 로드
  useEffect(() => {
    const loadNotificationCount = async () => {
      if (isAuthenticated) {
        try {
          const notifications = await getUnreadNotifications();
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error("알림 개수 로드 실패:", error);
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };

    // 컴포넌트 마운트 시 즉시 로드
    loadNotificationCount();

    // 주기적으로 알림 개수 업데이트 (30초마다)
    const interval = setInterval(loadNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 컴포넌트 마운트 시 즉시 알림 개수 확인 (인증 상태와 관계없이)
  useEffect(() => {
    const checkInitialNotifications = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const notifications = await getUnreadNotifications();
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error("초기 알림 개수 로드 실패:", error);
          setUnreadCount(0);
        }
      }
    };

    // 약간의 지연을 두고 실행 (AuthContext 초기화 후)
    const timeoutId = setTimeout(checkInitialNotifications, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // 페이지 포커스 시 알림 개수 확인
  useEffect(() => {
    const handleFocus = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const notifications = await getUnreadNotifications();
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error("포커스 시 알림 개수 로드 실패:", error);
        }
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 알림 드롭다운이 열릴 때마다 개수 업데이트
  useEffect(() => {
    if (isNotificationOpen) {
      const updateCount = async () => {
        try {
          const notifications = await getUnreadNotifications();
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error("알림 개수 업데이트 실패:", error);
        }
      };
      updateCount();
    }
  }, [isNotificationOpen]);

  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleNotification}
                className="text-gray-800 font-normal text-base hover:text-primary transition-colors relative"
              >
                <IoNotificationsOutline className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={closeNotification}
                onNotificationCountChange={setUnreadCount}
              />
            </div>
            <Link href="/qna" className="text-gray-800 font-medium text-lg">
              QnA
            </Link>
            <Link
              href="/community"
              className="text-gray-800 font-medium text-lg"
            >
              ToCafe
            </Link>
          </div>

          <div className="flex-shrink-0">
            <Link href="/" className="block">
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
                  href="/mypage"
                  className="text-gray-800 font-normal text-base"
                >
                  마이페이지
                </Link>
                <Link
                  href="/login"
                  className="text-gray-800 font-normal text-base"
                >
                  로그인
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
