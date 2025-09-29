"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { mockCafes } from "@/data/mockCafes";
import { Cafe } from "@/types/cafe";
import SearchBar from "@/components/common/SearchBar";
import CategoryFilter from "app/(main)/search/components/CategoryFilter";
import CafeGrid from "@/components/cafes/CafeGrid";
import Pagination from "@/components/common/Pagination";
import Footer from "@/components/common/Footer";


const categories = [
  "분위기",
  "포토스팟",
  "공부",
  "데이트",
  "혼자",
  "반려동물",
  "디저트 맛집",
  "브런치",
  "야경",
  "테라스",
  "북카페",
  "원두 로스터리",
];

// 반응형 아이템 수 설정
const getItemsPerPage = () => {
  if (typeof window === "undefined") return 8; // SSR 시 기본값

  const width = window.innerWidth;
  if (width >= 1536) return 16; // 2xl: 4x4 그리드
  if (width >= 1280) return 12; // xl: 4x3 그리드
  if (width >= 1024) return 8; // lg: 4x2 그리드
  if (width >= 768) return 6; // md: 3x2 그리드
  if (width >= 640) return 4; // sm: 2x2 그리드
  return 2; // 기본: 2x1 그리드
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(8); // 반응형 아이템 수

  // URL 파라미터에서 검색어 가져오기
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // 화면 크기 변화 감지하여 아이템 수 업데이트
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(getItemsPerPage());
    };

    // 초기 설정
    updateItemsPerPage();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", updateItemsPerPage);

    // 클린업
    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  // 필터링된 카페 목록
  const filteredCafes = useMemo(() => {
    let filtered = [...mockCafes];

    // 1. 검색어 필터링 (검색어가 있으면)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cafe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. 카테고리 필터링 (카테고리가 선택되어 있으면)
    if (selectedCategory) {
      const categoryIndex = categories.indexOf(selectedCategory);
      filtered = filtered.filter(
        (_, index) => index % categories.length === categoryIndex
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredCafes.length / itemsPerPage);

  // 현재 페이지가 총 페이지 수를 초과하면 첫 페이지로 조정
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // 아이템 수가 변경되면 현재 페이지도 조정
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [itemsPerPage, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCafes = filteredCafes.slice(startIndex, endIndex);

  const handleCategoryChange = (category: string) => {
    // 같은 카테고리를 클릭하면 해제, 다른 카테고리를 클릭하면 선택
    if (selectedCategory === category) {
      setSelectedCategory(""); // 카테고리 해제
    } else {
      setSelectedCategory(category); // 카테고리 선택
    }
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // 검색 시 첫 페이지로
    // URL 업데이트
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div>
      
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        placeholder="어떤 카페를 찾아볼까요?"
      />

      <div className="container mx-auto px-4">
        {/* 카테고리 필터 - 항상 표시 */}
        <div className="mb-8 flex justify-center">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        {/* 카페 그리드 */}
        <div>
          <CafeGrid
            cafes={paginatedCafes}
            columns={
              itemsPerPage >= 16
                ? 4
                : itemsPerPage >= 12
                ? 4
                : itemsPerPage >= 8
                ? 4
                : itemsPerPage >= 6
                ? 3
                : itemsPerPage >= 4
                ? 2
                : 2
            }
            className="mb-2"
          />
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
