// src/components/MypageSidebar.jsx

import { usePathname } from "next/navigation";

import {
  HiOutlineUser,
  HiOutlinePencilSquare,
  HiOutlineBookmark,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";

// 아이콘 컴포넌트 정의
const icons = {
  Settings: () => <HiOutlineUser className="w-5 h-5" />, // 회원정보
  BookOpen: () => <HiOutlinePencilSquare className="w-5 h-5" />, // 내가 작성한 리뷰
  User: () => <HiOutlineBookmark className="w-5 h-5" />, // 북마크
  MessageSquare: () => <HiOutlineChatBubbleLeftRight className="w-5 h-5" />, // 채팅방
  Clock: () => <HiOutlineClock className="w-5 h-5" />, // 히스토리
  QuestionRegular: () => <HiOutlineQuestionMarkCircle className="w-5 h-5" />, // 나의 문의 내역
};

const navItems = [
  { name: "회원정보", href: "/mypage", iconKey: "Settings" },
  { name: "내가 작성한 리뷰", href: "/mypage/reviews", iconKey: "BookOpen" },
  { name: "북마크", href: "/mypage/bookmarks", iconKey: "User" },
  { name: "채팅방", href: "/mypage/chats", iconKey: "MessageSquare" },
  { name: "히스토리", href: "/mypage/history", iconKey: "Clock" },
  { name: "나의 문의 내역", href: "/mypage/qna", iconKey: "QuestionRegular" },
];

export default function MypageSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full lg:w-64 flex-shrink-0 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#CDCDCD] bg-white mb-4 lg:mb-0">
      <ul className="flex lg:flex-col flex-wrap lg:space-y-1 gap-2 lg:gap-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = icons[item.iconKey as keyof typeof icons];

          return (
            <li
              key={item.name}
              className="flex-1 lg:flex-none min-w-[calc(50%-0.25rem)] lg:min-w-0"
            >
              <a
                href={item.href}
                className={`
                  flex items-center justify-center lg:justify-start p-2 sm:p-3 rounded-xl transition-colors duration-200 
                  ${
                    isActive
                      ? "text-[#6E4213] font-semibold bg-[#6E4213]/10"
                      : "text-gray-600 hover:text-[#C19B6C] hover:bg-gray-50"
                  }
                `}
              >
                <span className="w-4 h-4 sm:w-5 sm:h-5 lg:mr-3 flex items-center justify-center flex-shrink-0">
                  {IconComponent && <IconComponent />}
                </span>
                <span className="text-xs sm:text-sm lg:text-base text-center lg:text-left hidden sm:inline">
                  {item.name}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
