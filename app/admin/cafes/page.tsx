"use client";

import { useState, useEffect } from "react";
import { mockCafes } from "@/data/mockCafes";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import { getAllCafes } from "@/lib/api";
export default function AdminCafesPage() {
  const [cafes, setCafes] = useState(mockCafes);
  const [filteredCafes, setFilteredCafes] = useState(mockCafes);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // API에서 전체 카페 데이터 조회
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        setLoading(true);
        const cafeData = await getAllCafes();
        
        // API 응답 변환 (백엔드 CafeDTO 형식에 맞춤)
        if (Array.isArray(cafeData) && cafeData.length > 0) {
          const transformedCafes = cafeData.map((cafe: any) => ({
            cafe_id: String(cafe.cafeId || ""),
            name: cafe.name || "",
            address: cafe.address || "",
            description: cafe.description || cafe.reviewsSummary || "",
            avg_rating: cafe.avgRating || 0,
            latitude: cafe.latitude || 0,
            longitude: cafe.longitude || 0,
          }));
          setCafes(transformedCafes);
          setFilteredCafes(transformedCafes);
        }
      } catch (error) {
        console.error("카페 데이터 로드 실패:", error);
        // API 실패 시 mock 데이터 유지
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);
  
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
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">카페 관리</h1>
        <Button color="primary" size="md">
          등록
        </Button>
      </div>

      {/* 검색바 */}
      
        <div className="w-full max-w-4/5">
          <SearchBar
            placeholder="카페명, 주소, 설명으로 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="text-sm text-gray-500">
          총 {filteredCafes.length}개 카페
        </div>

<<<<<<< HEAD
      {/* 카페 개수 */}
      {/* 카페 그리드 - 한 줄에 4개씩 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">카페 데이터를 불러오는 중...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  onClick={() => {}}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-8"
      />
    </div>
  );
}