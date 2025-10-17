import Link from "next/link";
import { useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationDropdown from "./NotificationDropdown";

const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  return (
    <header>
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
              className="text-gray-800 font-medium text-lg"
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
