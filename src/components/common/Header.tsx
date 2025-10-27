"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
  className?: string;
}

const Header = ({ className = "" }: HeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // 중복 헤더 감지 및 숨기기
  useEffect(() => {
    if (headerRef.current) {
      const headers = document.querySelectorAll("header");
      if (headers.length > 1) {
        // 첫 번째 헤더 이후의 모든 헤더 숨기기
        for (let i = 1; i < headers.length; i++) {
          (headers[i] as HTMLElement).style.display = "none";
        }
      }
    }
  }, []);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  return (
    <header ref={headerRef} className={`header-component ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleNotification}
                className="text-gray-800 font-normal text-base hover:text-primary transition-colors"
              >
                <IoNotificationsOutline className="w-6 h-6 text-gray-600" />
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={closeNotification}
              />
            </div>

            <Link href="/qna" className="text-gray-800 font-medium text-lg">
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
            <Link href="/mypage" className="text-gray-800 font-medium text-lg">
              마이페이지
            </Link>
            <Link href="/login" className="text-gray-800 font-medium text-lg">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
