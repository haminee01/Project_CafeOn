"use client";

import { useState, useRef, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  isNew?: boolean;
}

const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "새로운 댓글이 달렸어요: '좋은 정보 감사합니다!'",
    time: "3분 전",
    isNew: true,
  },
  {
    id: 2,
    title: "김민수님이 채팅방 '프로젝트 A'에 새로운 메시지를 보냈어요.",
    time: "15분 전",
    isNew: true,
  },
  {
    id: 3,
    title: "작성하신 글에 5개의 새로운 댓글이 달렸어요.",
    time: "1시간 전",
    isNew: true,
  },
  {
    id: 4,
    title: "채팅방 '스터디 그룹'에서 읽지 않은 메시지가 10개 있어요.",
    time: "어제 오후 5:00",
    isNew: false,
  },
  {
    id: 5,
    title: "김철수님의 댓글에 '좋아요'가 눌렸습니다.",
    time: "2023.10.01",
    isNew: false,
  },
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown = ({
  isOpen,
  onClose,
}: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        {DUMMY_NOTIFICATIONS.map((notification) => (
          <div
            key={notification.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <IoNotificationsOutline className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 leading-relaxed">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;
