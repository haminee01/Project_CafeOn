"use client";

import Map from "@/components/Map";
import SearchBar from "@/components/SearchBar";
import CafeCarousel from "@/components/CafeCarousel";
import { mockCafes } from "@/data/mockCafes";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen px-6">
      <SearchBar />

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
          description="찜이 많은 카페입니다."
          showAllButton={true}
        />
      </div>

      <div>
        <CafeCarousel
          cafes={mockCafes.slice(8, 16)}
          title="새로 생긴 카페"
          description="따끈따끈한 신상 카페예요."
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
