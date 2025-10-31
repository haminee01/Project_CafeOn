"use client";

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import CommunityList from "@/components/community/CommunityList";
import SearchBar from "@/components/common/SearchBar";
import { getPosts } from "@/api/community";
import { PostListResponse, PostType, PostListItem } from "@/types/Post";
import { useEffect, useState } from "react";
import Link from "next/link";

const POST_TYPE_OPTIONS: {
  value: PostType | "";
  label: string;
  color: string;
}[] = [
  { value: "", label: "전체", color: "bg-gray-500" },
  { value: "GENERAL", label: "일반", color: "bg-[#6E4213]" },
  { value: "QUESTION", label: "질문", color: "bg-[#C19B6C]" },
  { value: "INFO", label: "정보", color: "bg-yellow-500" },
];

export default function CommunityMainPage() {
  const [data, setData] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostListItem[]>([]);

  // 초기 데이터 로드 (한 번만)
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setLoading(true);
        console.log("모든 게시글 로드 중...");

        const response = await getPosts({
          page: 1,
          keyword: "",
          type: "" as any,
        });

        console.log("받은 모든 게시글:", response);
        setAllPosts(response.posts);
      } catch (err) {
        console.error("게시글 목록 조회 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "게시글을 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    if (allPosts.length === 0) {
      fetchAllPosts();
    }
  }, []);

  // 필터링 및 페이지네이션 적용
  useEffect(() => {
    if (allPosts.length > 0) {
      let filtered = [...allPosts];

      // 타입 필터링
      if (selectedType && selectedType !== "") {
        filtered = filtered.filter((post) => post.type === selectedType);
        console.log("타입 필터링 결과:", selectedType, filtered);
      }

      // 검색어 필터링
      if (searchQuery && searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log("검색어 필터링 결과:", searchQuery, filtered);
      }

      // 페이지네이션 적용 (페이지당 10개)
      const postsPerPage = 10;
      const startIndex = (currentPage - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const paginatedPosts = filtered.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filtered.length / postsPerPage);

      setData({
        posts: paginatedPosts,
        pages: totalPages,
      });
    }
  }, [allPosts, searchQuery, selectedType, currentPage]);

  // 검색어나 타입이 변경될 때 첫 페이지로 리셋
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedType]);

  // 페이지 변경 핸들러 (클라이언트 사이드 페이지네이션)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-4 pb-20">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E4213]"></div>
              <span className="ml-3 text-gray-600">
                게시글을 불러오는 중...
              </span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-4 pb-20">
          <div className="max-w-4xl mx-auto p-4">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                게시글을 불러올 수 없습니다
              </h2>
              <p className="text-gray-500">
                {error || "알 수 없는 오류가 발생했습니다."}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 데이터가 없을 때 기본값 설정
  const displayData = data || { posts: [], pages: 0 };

  return (
    <>
      <Header />

      <main className="min-h-screen pt-4 pb-20">
        {/* 검색바 */}
        <div className="max-w-4xl mx-auto p-4 mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setSearchQuery}
            placeholder="게시글을 검색해보세요..."
          />
        </div>

        {/* 카테고리 필터와 게시물 작성 버튼 */}
        <div className="max-w-4xl mx-auto p-4 mb-6">
          <div className="flex justify-between items-center">
            {/* 타입 필터 */}
            <div className="flex flex-wrap gap-2">
              {POST_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    console.log(
                      "카테고리 버튼 클릭:",
                      option.value,
                      option.label
                    );
                    setSelectedType(option.value);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === option.value
                      ? `${option.color} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* 게시물 작성 버튼 */}
            <Link href="/community/write">
              <button className="px-4 py-2 bg-[#6E4213] text-white rounded-md hover:bg-[#C19B6C] transition-colors">
                게시물 작성
              </button>
            </Link>
          </div>
        </div>

        <CommunityList
          posts={displayData.posts}
          initialPage={currentPage}
          totalPages={displayData.pages}
          onPageChange={handlePageChange}
        />
      </main>

      <Footer />
    </>
  );
}
