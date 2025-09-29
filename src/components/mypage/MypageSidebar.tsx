// src/components/MypageSidebar.jsx

import { usePathname } from "next/navigation"; // next/navigation에서 usePathname 훅 가져오기

// 아이콘 컴포넌트 정의
const icons = {
  Settings: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0ZM12 16.5c2.485 0 4.5-2.015 4.5-4.5S14.485 7.5 12 7.5 7.5 9.515 7.5 12s2.015 4.5 4.5 4.5Zm-1.875-5.625v1.125h1.125v-1.125h-1.125ZM12 21.75a9.75 9.75 0 1 1 0-19.5 9.75 9.75 0 0 1 0 19.5ZM4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0Z"
      />
    </svg>
  ),
  BookOpen: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 17.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
      />
    </svg>
  ),
  User: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5ZM18.75 19.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5ZM12 21a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75Z"
      />
    </svg>
  ),
  MessageSquare: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.75 9.75 0 1 0 0-19.5 9.75 9.75 0 0 0 0 19.5ZM12 12c-2.485 0-4.5-2.015-4.5-4.5S9.515 3 12 3s4.5 2.015 4.5 4.5S14.485 12 12 12ZM12 16.5c2.485 0 4.5-2.015 4.5-4.5S14.485 7.5 12 7.5 7.5 9.515 7.5 12s2.015 4.5 4.5 4.5Z"
      />
    </svg>
  ),
  Clock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
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
