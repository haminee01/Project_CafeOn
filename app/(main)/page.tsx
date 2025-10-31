"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Map from "@/components/map/Map";
import SearchBar from "@/components/common/SearchBar";
import CafeCarousel from "@/components/cafes/CafeCarousel";
import { mockCafes } from "@/data/mockCafes";
import { getRandomCafes } from "@/lib/api";
import Footer from "@/components/common/Footer";

export default function HomePage() {
  const [randomCafes, setRandomCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 랜덤 카페 조회
  useEffect(() => {
    const fetchRandomCafes = async () => {
      try {
        const cafes = await getRandomCafes();
        console.log("랜덤 카페 API 응답:", cafes);
        setRandomCafes(Array.isArray(cafes) ? cafes : []);
      } catch (error: any) {
        console.error("랜덤 카페 조회 실패:", error);
        setRandomCafes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomCafes();
  }, []);
  return (
    <div className="min-h-screen px-20">
      <Header />
      <SearchBar />

      <Map className="mb-10" cafes={randomCafes} />

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(0, 4)}
          title="요즘 뜨고 있는 카페"
          description="최근 사람들이 많이 찾는 카페를 엄선했어요."
          showAllButton={true}
        />
      </div>

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(4, 8)}
          title="찜 많은 카페"
          description="찜이 많은 카페를 만나보세요."
          showAllButton={true}
        />
      </div>

      <div>
        <CafeCarousel
          cafes={randomCafes}
          title="이런 카페는 어때요?"
          description="추천 드리는 카페입니다."
          showAllButton={true}
        />
      </div>
      <Footer />
    </div>
  );
}
