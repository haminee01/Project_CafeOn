"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Map from "@/components/map/Map";
import SearchBar from "@/components/common/SearchBar";
import CafeCarousel from "@/components/cafes/CafeCarousel";
import { mockCafes } from "@/data/mockCafes";
import { getRandomCafes } from "@/lib/api";
import Footer from "@/components/common/Footer";

const searchPlaceholders = [
  "어떤 카페를 찾아볼까요?",
  "강남구 근처 카페 어때요?",
  "서초구에서 브런치 먹을까요?",
  "성동구 감성 카페 찾아볼까요?",
  "마포구 루프탑 카페는 어떠세요?",
  "용산구 뷰 맛집 궁금하지 않으세요?",
  "오늘 브런치 카페 어디 갈까요?",
  "디저트 맛있는 카페 찾아볼까요?",
  "조용하게 작업할 수 있는 카페 어때요?",
  "반려동물과 함께 갈 수 있는 카페는?",
  "밤늦게까지 공부할 24시간 카페 찾으세요?",
  "탁 트인 루프탑 카페 어떠세요?",
  "뷰가 예쁜 카페에서 커피 한 잔?",
  "분위기 좋은 카페에서 데이트 어때요?",
];

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
    <div className="min-h-screen px-4 md:px-8 lg:px-12 xl:px-20">
      <Header />
      <SearchBar placeholders={searchPlaceholders} animatePlaceholder={true} />

      <Map className="mb-10" cafes={randomCafes} />

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(0, 4)}
          title="요즘 뜨고 있는 카페"
          description="최근 사람들이 많이 찾는 카페를 엄선했습니다."
          showAllButton={true}
        />
      </div>

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(4, 8)}
          title="찜 많은 카페"
          description="다른 사람들이 찜해둔 카페들 입니다."
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
