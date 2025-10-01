// src/components/MypageSidebar.jsx

import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPenToSquare,
  faBookmark,
  faCommentDots,
  faClock,
} from "@fortawesome/free-regular-svg-icons";

// 아이콘 컴포넌트 정의
const icons = {
  Settings: () => <FontAwesomeIcon icon={faUser} className="w-5 h-5" />, // 회원정보
  BookOpen: () => <FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5" />, // 내가 작성한 리뷰
  User: () => <FontAwesomeIcon icon={faBookmark} className="w-5 h-5" />, // 북마크
  MessageSquare: () => (
    <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
  ), // 채팅방
  Clock: () => <FontAwesomeIcon icon={faClock} className="w-5 h-5" />, // 히스토리
};

const navItems = [
  { name: "회원정보", href: "/mypage", iconKey: "Settings" },
  { name: "내가 작성한 리뷰", href: "/mypage/reviews", iconKey: "BookOpen" },
  { name: "북마크", href: "/mypage/bookmarks", iconKey: "User" },
  { name: "채팅방", href: "/mypage/chats", iconKey: "MessageSquare" },
  { name: "히스토리", href: "/mypage/history", iconKey: "Clock" },
];

export default function MypageSidebar() {
  const pathname = usePathname(); // 현재 경로를 가져오는 훅 사용

  return (
    <nav className="w-64 flex-shrink-0 p-6 border-r border-[#CDCDCD] bg-white">
      <ul className="space-y-1">
        {navItems.map((item) => {
          // 현재 경로(pathname)와 메뉴 아이템의 href를 비교하여 활성화 여부 결정
          const isActive = pathname === item.href;
          const IconComponent = icons[item.iconKey as keyof typeof icons];

          return (
            <li key={item.name}>
              <a
                href={item.href}
                className={`
                  flex items-center p-3 rounded-xl transition-colors duration-200 
                  ${
                    isActive
                      ? "text-[#6E4213] font-semibold"
                      : "text-gray-600 hover:text-[#C19B6C]"
                  }
                `}
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">
                  {IconComponent && <IconComponent />}
                </span>
                <span className="text-base">{item.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
