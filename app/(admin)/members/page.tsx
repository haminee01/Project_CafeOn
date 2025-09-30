"use client";

import { useState } from "react";

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const members = [
    { id: 1, name: "유저 1", penalty: 1, status: "normal" },
    { id: 2, name: "유저 2", penalty: 3, status: "suspended" },
    { id: 3, name: "유저 3", penalty: 0, status: "normal" },
    { id: 4, name: "유저 4", penalty: 2, status: "normal" },
    { id: 5, name: "유저 5", penalty: 5, status: "suspended" },
    { id: 6, name: "유저 6", penalty: 1, status: "normal" },
    { id: 7, name: "유저 7", penalty: 0, status: "normal" },
    { id: 8, name: "유저 8", penalty: 4, status: "suspended" },
    { id: 9, name: "유저 9", penalty: 1, status: "normal" },
    { id: 10, name: "유저 10", penalty: 2, status: "normal" }
  ];

  const filteredMembers = members.filter(member => {
    const matchesTab = activeTab === "all" || 
      (activeTab === "suspended" && member.status === "suspended") ||
      (activeTab === "normal" && member.status === "normal");
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            전체 회원
          </button>
          <button
            onClick={() => setActiveTab("suspended")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "suspended"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            정지 회원
          </button>
          <button
            onClick={() => setActiveTab("normal")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "normal"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            정상 회원
          </button>
        </nav>
      </div>

      {/* 검색 바 */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="유저 이름을 입력해주세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 프로필 이미지 */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">A</span>
                  </div>
                  
                  {/* 회원 정보 */}
                  <div>
                    <p className="text-gray-900 font-medium">
                      {member.name} 패널티 : {member.penalty}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors">
                    페널티
                  </button>
                  <button className={`px-4 py-2 text-white text-sm rounded font-medium transition-colors ${
                    member.status === "suspended"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}>
                    {member.status === "suspended" ? "정지 해제" : "정지"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
            disabled={currentPage === 1}
          >
            <
          </button>
          
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
            disabled={currentPage === 5}
          >
            >
          </button>
        </div>
      </div>
    </div>
  );
}
