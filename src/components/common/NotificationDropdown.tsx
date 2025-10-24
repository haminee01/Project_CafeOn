"use client";

import { useState, useRef, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { getUnreadNotifications, NotificationResponse } from "@/api/chat";

// 시간 포맷팅 함수
const formatTime = (createdAt: string): string => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInMinutes = Math.floor(
    (now.getTime() - notificationTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return notificationTime.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCountChange?: (count: number) => void;
}

const NotificationDropdown = ({
  isOpen,
  onClose,
  onNotificationCountChange,
}: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // 알림 데이터 로드
  useEffect(() => {
    const loadNotifications = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const data = await getUnreadNotifications();
          setNotifications(data);
          // 알림 개수 변경 콜백 호출
          if (onNotificationCountChange) {
            onNotificationCountChange(data.length);
          }
        } catch (error) {
          console.error("알림 로드 실패:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadNotifications();
  }, [isOpen, onNotificationCountChange]);

  // 알림 클릭 핸들러
  const handleNotificationClick = (deeplink: string) => {
    router.push(deeplink);
    onClose();
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">새로운 알림</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            알림을 불러오는 중...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            새로운 알림이 없습니다.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.notificationId}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => handleNotificationClick(notification.deeplink)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <IoNotificationsOutline className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {notification.preview}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
