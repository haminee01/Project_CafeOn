"use client";

import { useState } from "react";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("unprocessed");
  const [currentPage, setCurrentPage] = useState(1);

  const reports = [
    "여기 맛있네요....",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구",
    "어쩌구 저쩌구"
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <h1 className="text-3xl font-bold text-gray-900">신고 관리</h1>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("unprocessed")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "unprocessed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            미처리 내역
          </button>
          <button
            onClick={() => setActiveTab("processed")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "processed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            처리 내역
          </button>
        </nav>
      </div>

      {/* 신고 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {reports.map((report, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{report}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    신고자: 사용자{index + 1} | 신고일: 2024.01.{15 + index}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded font-medium transition-colors">
                    처리
                  </button>
                  <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors">
                    상세보기
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