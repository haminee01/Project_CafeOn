"use client";

import { useState } from "react";
import { mockCafes } from "@/data/mockCafes";

export default function AdminCafesPage() {
  const [cafes] = useState(mockCafes.slice(0, 9)); // 처음 9개 카페만 표시
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">카페 관리</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          등록
        </button>
      </div>

      {/* 카페 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cafes.map((cafe) => (
          <div key={cafe.cafe_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* 카페 이미지 */}
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">카페 이미지</p>
              </div>
            </div>

            {/* 카페 정보 */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{cafe.name}</h3>
              
              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                  수정
                </button>
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
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
