import { Metadata } from "next";
import { mockCafes } from "@/data/mockCafes";
import { createCafeDetail } from "@/data/cafeUtils";
import CafeDetailClient from "./CafeDetailClient";

// 동적 메타데이터 생성
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ cafeId: string }> 
}): Promise<Metadata> {
  const { cafeId } = await params;
  
  // mockCafes에서 카페 데이터 찾기
  const cafeData = mockCafes.find((c) => c.cafe_id === cafeId);
  
  // 기본값으로 문래 마이스페이스 사용 (cafe_id: "33")
  const defaultCafe = mockCafes.find((c) => c.cafe_id === "33") || mockCafes[0];
  const selectedCafe = cafeData || defaultCafe;
  
  // 카페 상세 정보 생성
  const cafe = createCafeDetail(selectedCafe);
  
  const title = `${cafe.name} - CafeOn에서 발견한 맛있는 카페`;
  const description = `${cafe.address}에 위치한 ${cafe.name}을(를) CafeOn에서 확인해보세요!`;
  const imageUrl = cafe.imageUrl || "https://via.placeholder.com/800x800/F4EDE5/6E4213?text=☕";
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://cafeon.com/cafes/${cafeId}`,
      siteName: "CafeOn",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: cafe.name,
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

interface CafeDetailPageProps {
  params: Promise<{
    cafeId: string;
  }>;
}

export default async function CafeDetailPage({ params }: CafeDetailPageProps) {
  const { cafeId } = await params;
  
  return <CafeDetailClient cafeId={cafeId} />;
}