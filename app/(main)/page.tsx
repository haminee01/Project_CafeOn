"use client";

import { useState, useEffect } from "react";
import Map from "@/components/map/Map";
import SearchBar from "@/components/common/SearchBar";
import CafeCarousel from "@/components/cafes/CafeCarousel";
import { getRandomCafes, getHotCafes, getWishlistTopCafes, getNearbyCafes } from "@/lib/api";

export default function HomePage() {
  const [randomCafes, setRandomCafes] = useState<any[]>([]);
  const [hotCafes, setHotCafes] = useState<any[]>([]);
  const [wishlistTopCafes, setWishlistTopCafes] = useState<any[]>([]);
  const [nearbyCafes, setNearbyCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 현재 위치 기반 근처 카페 조회
  useEffect(() => {
    // 이미지가 있는 카페만 필터링하는 함수
    const filterCafesWithImages = (cafes: any[]) => {
      return cafes.filter(cafe => {
        const hasImage = cafe.photoUrl || (cafe.images && cafe.images.length > 0);
        return hasImage;
      });
    };

    if (!navigator.geolocation) {
      console.log("Geolocation을 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const cafes = await getNearbyCafes({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: 2000, // 2km 반경
          });
          
          console.log("근처 카페 API 응답:", cafes);
          setNearbyCafes(filterCafesWithImages(Array.isArray(cafes) ? cafes : []));
        } catch (error: any) {
          console.error("근처 카페 조회 실패:", error);
          setNearbyCafes([]);
        }
      },
      (error) => {
        console.error("위치 정보 획득 실패:", error);
        // 위치 정보를 못 얻으면 빈 배열로 처리
        setNearbyCafes([]);
      }
    );
  }, []);

  // 카페 데이터 조회
  useEffect(() => {
    // 이미지가 있는 카페만 필터링하는 함수
    const filterCafesWithImages = (cafes: any[]) => {
      return cafes.filter(cafe => {
        const hasImage = cafe.photoUrl || (cafe.images && cafe.images.length > 0);
        return hasImage;
      });
    };

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
        
        setRandomCafes(filterCafesWithImages(Array.isArray(random) ? random : []));
        setHotCafes(filterCafesWithImages(Array.isArray(hot) ? hot : []));
        setWishlistTopCafes(filterCafesWithImages(Array.isArray(wishlist) ? wishlist : []));
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

      <Map className="mb-10" cafes={nearbyCafes.length > 0 ? nearbyCafes : randomCafes} />

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
