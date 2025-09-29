// import { User, MessageSquare, BookOpen, Clock, Settings } from 'lucide-react'; // 미리보기 환경 오류로 인해 이모지 또는 SVG로 대체
// import Link from 'next/link'; // Next.js 환경 오류로 인해 표준 a 태그로 대체
// import { usePathname } from 'next/navigation'; // Next.js 환경 오류로 인해 임시 주석 처리

// 아이콘을 이모지로 대체합니다.
const iconMap = {
  Settings: "⚙️", // 회원정보
  BookOpen: "✍️", // 내가 작성한 리뷰
  User: "🔖", // 북마크 (북마크 아이콘으로 변경)
  MessageSquare: "💬", // 채팅방
  Clock: "⏳", // 히스토리
};

// 마이페이지 사이드바 메뉴 아이템 정의
const navItems = [
  { name: "회원정보", href: "/mypage", iconKey: "Settings" },
  { name: "내가 작성한 리뷰", href: "/mypage/reviews", iconKey: "BookOpen" },
  { name: "북마크", href: "/mypage/bookmarks", iconKey: "User" },
  { name: "채팅방", href: "/mypage/chatrooms", iconKey: "MessageSquare" },
  { name: "히스토리", href: "/mypage/history", iconKey: "Clock" },
];

/**
 * 마이페이지 좌측 사이드바 컴포넌트
 * Tailwind CSS를 사용하여 시안과 유사하게 디자인합니다.
 */
export default function MypageSidebar() {
  // const pathname = usePathname(); // Next.js 전용 Hook. 미리보기 환경에서는 사용할 수 없습니다.
  const currentPathMock = "/mypage"; // 임시로 현재 경로를 '/mypage'로 가정하여 '회원정보'를 활성화

  return (
    <nav className="w-64 flex-shrink-0 p-6 border-r border-gray-100 bg-white">
      <ul className="space-y-1">
        {navItems.map((item) => {
          // 실제 Next.js 환경에서는 아래 주석 처리된 코드를 사용해야 합니다.
          // const isActive = pathname === item.href;
          const isActive = item.href === currentPathMock;

          return (
            <li key={item.name}>
              {/* Link 대신 표준 a 태그 사용. 실제 프로젝트에서는 Link를 사용하세요. */}
              <a
                href={item.href}
                className={`
                  flex items-center p-3 rounded-xl transition-colors duration-200 
                  ${
                    isActive
                      ? "bg-amber-100 text-amber-700 font-semibold"
                      : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                  }
                `}
              >
                {/* 이모지 아이콘 사용. tailwind text-xl을 사용하여 크기 조정 */}
                <span className="text-xl w-5 h-5 mr-3 flex items-center justify-center">
                  {iconMap[item.iconKey as keyof typeof iconMap]}
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
