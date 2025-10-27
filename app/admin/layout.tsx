"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToastContext } from "@/components/common/ToastProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { showToast } = useToastContext();

  const handleLogout = () => {
    showToast("로그아웃 되었습니다.", "success");
    // 실제 로그아웃 로직 구현
  };

  const menuItems = [
    {
      name: "카페 관리",
      href: "/admin/cafes",
      icon: "🏠",
    },
    {
      name: "신고 관리",
      href: "/admin/reports",
      icon: "📝",
    },
    {
      name: "회원 관리",
      href: "/admin/members",
      icon: "👥",
    },
    {
      name: "문의 내역",
      href: "/admin/inquiries",
      icon: "💬",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* 상단 헤더 - 로그인/로그아웃만 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">CafeOn.</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 text-base"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside
          className={`bg-white shadow-sm h-screen w-64 fixed left-0 top-16 transform transition-transform duration-300 z-30 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-md font-medium transition-colors ${
                    pathname === item.href
                      ? "text-primary font-bold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 모바일 메뉴 버튼 */}
      <button
        className="fixed top-4 left-4 z-40 lg:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
}
