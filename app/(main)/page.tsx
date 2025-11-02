"use client";

import { useState, useEffect } from "react";
import Map from "@/components/map/Map";
import SearchBar from "@/components/common/SearchBar";
import CafeCarousel from "@/components/cafes/CafeCarousel";
import { getRandomCafes, getHotCafes, getWishlistTopCafes } from "@/lib/api";

export default function HomePage() {
  const [randomCafes, setRandomCafes] = useState<any[]>([]);
  const [hotCafes, setHotCafes] = useState<any[]>([]);
  const [wishlistTopCafes, setWishlistTopCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 이미지가 있는 카페만 필터링하는 함수
  const hasValidImage = (cafe: any) => {
    const imageUrl = cafe.photoUrl || cafe.photo_url || 
                    (cafe.images && Array.isArray(cafe.images) && cafe.images.length > 0 ? cafe.images[0] : null);
    return imageUrl && imageUrl.trim() !== '';
  };

  // 카페 데이터 조회
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        // 병렬로 모든 카페 데이터 조회
        const [random, hot, wishlist] = await Promise.all([
          getRandomCafes(),
          getHotCafes(),
          getWishlistTopCafes(),
        ]);
        
        console.log("랜덤 카페 API 응답:", random);
        console.log("인기 카페 API 응답:", hot);
        console.log("찜 많은 카페 API 응답:", wishlist);
        
        // "이런 카페는 어때요?" 섹션에서만 이미지가 있는 카페만 필터링
        setRandomCafes(Array.isArray(random) ? random.filter(hasValidImage) : []);
        setHotCafes(Array.isArray(hot) ? hot : []);
        setWishlistTopCafes(Array.isArray(wishlist) ? wishlist : []);
      } catch (error: any) {
        console.error("카페 조회 실패:", error);
        // 에러 시 빈 배열로 초기화
        setRandomCafes([]);
        setHotCafes([]);
        setWishlistTopCafes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);
  return (
    <div className="min-h-screen px-20">
      <SearchBar />

      <Map className="mb-10" cafes={randomCafes} />

      {hotCafes.length > 0 && (
        <div>
          <CafeCarousel
            cafes={hotCafes}
            title="요즘 뜨고 있는 카페"
            description="최근 사람들이 많이 찾는 카페를 엄선했어요."
            showAllButton={true}
          />
        </div>
      )}

      {wishlistTopCafes.length > 0 && (
        <div className="mt-10">
          <CafeCarousel
            cafes={wishlistTopCafes}
            title="찜 많은 카페"
            description="찜이 많은 카페를 만나보세요."
            showAllButton={true}
          />
        </div>
      )}

      <div className="mt-10">
        <CafeCarousel
          cafes={randomCafes}
          title="이런 카페는 어때요?"
          description="추천 드리는 카페입니다."
          showAllButton={true}
        />
      </div>
    </div>
  );
}
