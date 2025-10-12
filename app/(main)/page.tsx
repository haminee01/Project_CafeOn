"use client";

import Header from "@/components/common/Header";
import Map from "@/components/map/Map";
import SearchBar from "@/components/common/SearchBar";
import CafeCarousel from "@/components/cafes/CafeCarousel";
import { mockCafes } from "@/data/mockCafes";
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
  return (
    <div className="min-h-screen px-20">
      <Header />
      <SearchBar 
        placeholders={searchPlaceholders}
        animatePlaceholder={true}
      />

      <Map className="mb-10" />

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(8, 16)}
          title="요즘 뜨고 있는 카페"
          description="최근 사람들이 많이 찾는 카페를 엄선했어요."
          showAllButton={true}
        />
      </div>

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(8, 16)}
          title="찜 많은 카페"
          description="찜이 많은 카페를 만나보세요."
          showAllButton={true}
        />
      </div>

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(8, 16)}
          title="회원님 맞춤 카페"
          description="회원님, 이런 카페들은 어떤가요? 회원님의 취향을 반영한 카페들입니다."
          showAllButton={true}
        />
      </div>
      <Footer />
    </div>
  );
}
