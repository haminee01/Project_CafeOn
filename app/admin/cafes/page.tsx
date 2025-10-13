"use client";

import { useState } from "react";
import { mockCafes } from "@/data/mockCafes";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import { useEscapeKey } from "../../../src/hooks/useEscapeKey";

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState(mockCafes); // 모든 카페 표시
  const [filteredCafes, setFilteredCafes] = useState(mockCafes);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cafeToDelete, setCafeToDelete] = useState<any>(null);

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showDeleteModal) {
      setShowDeleteModal(false);
    }
  });
  
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredCafes.length / itemsPerPage);
  
  // 현재 페이지에 표시할 카페들
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCafes = filteredCafes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredCafes(cafes);
    } else {
      const filtered = cafes.filter(cafe => 
        cafe.name.toLowerCase().includes(term.toLowerCase()) ||
        cafe.address.toLowerCase().includes(term.toLowerCase()) ||
        cafe.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCafes(filtered);
    }
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleDeleteClick = (cafe: any) => {
    setCafeToDelete(cafe);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (cafeToDelete) {
      const updatedCafes = cafes.filter(cafe => cafe.cafe_id !== cafeToDelete.cafe_id);
      setCafes(updatedCafes);
      setFilteredCafes(updatedCafes);
      setShowDeleteModal(false);
      setCafeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCafeToDelete(null);
  };

  return (
    <div className="space-y-1">
      {/* 페이지 헤더 */}

      {/* 검색바 */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4/5">
          <SearchBar
            
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearchChange}
          />
        </div>
      </div>

      {/* 카페 개수 */}
      <div className="text-sm text-gray-500 mb-4">
        총 {filteredCafes.length}개 카페
      </div>

      {/* 카페 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCafes.map((cafe) => (
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
                <Button color="secondary" size="sm" className="flex-1">
                  수정
                </Button>
                <Button 
                  color="gray" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDeleteClick(cafe)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-8"
      />

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              카페 삭제 확인
            </h3>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">"{cafeToDelete?.name}"</span> 카페를 정말 삭제하시겠습니까?
              
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                color="gray" 
                size="md"
                onClick={handleDeleteCancel}
              >
                취소
              </Button>
              <Button 
                color="warning" 
                size="md"
                onClick={handleDeleteConfirm}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}