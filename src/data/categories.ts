// 카테고리 데이터
export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export const categories: Category[] = [
  { id: "atmosphere", name: "분위기", icon: "🏠", description: "아늑하고 편안한 분위기" },
  { id: "photo", name: "포토스팟", icon: "📸", description: "인스타그램 포토스팟" },
  { id: "study", name: "공부", icon: "📚", description: "공부하기 좋은 조용한 공간" },
  { id: "date", name: "데이트", icon: "💕", description: "커플 데이트 장소" },
  { id: "alone", name: "혼자", icon: "🙋‍♀️", description: "혼자 방문하기 좋은 곳" },
  { id: "pet", name: "반려동물", icon: "🐕", description: "반려동물 동반 가능" },
  { id: "dessert", name: "디저트 맛집", icon: "🍰", description: "특별한 디저트와 케이크" },
  { id: "coffee", name: "커피 전문", icon: "☕", description: "고품질 커피 전문점" },
  { id: "brunch", name: "브런치", icon: "🥐", description: "브런치 메뉴가 풍부한 곳" },
  { id: "24hours", name: "24시간", icon: "🕐", description: "24시간 운영" },
  { id: "wifi", name: "와이파이", icon: "📶", description: "무료 와이파이 제공" },
  { id: "parking", name: "주차", icon: "🚗", description: "주차 공간 완비" }
];

// 카테고리별 카페 매핑
export const categoryCafesMap: { [key: string]: string[] } = {
  "atmosphere": ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31", "33", "34", "35", "36", "37", "38", "39"],
  "photo": ["4", "5", "33", "34", "36", "39"],
  "study": ["3", "7", "8", "11", "13", "19", "23", "26", "31", "33", "38"],
  "date": ["1", "9", "15", "17", "21", "33", "34", "36", "37", "39"],
  "alone": ["3", "11", "13", "19", "23", "26", "27", "31", "33", "34", "37", "38"],
  "pet": ["15", "17", "33", "34", "36"],
  "dessert": ["33", "34", "35", "36", "37", "39"],
  "coffee": ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31"],
  "brunch": ["1", "5", "9", "15", "21", "33", "35", "36", "37"],
  "24hours": ["4", "5", "16", "38"],
  "wifi": ["1", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"],
  "parking": ["1", "5", "9", "13", "15", "17", "21", "25", "31", "33", "36", "37"]
};

// 카테고리별 필터링 함수
export function getCafesByCategory(categoryId: string, allCafes: any[]): any[] {
  const cafeIds = categoryCafesMap[categoryId] || [];
  return allCafes.filter(cafe => cafeIds.includes(cafe.cafe_id));
}

// 카페별 카테고리 정보
export function getCafeCategories(cafeId: string): Category[] {
  const cafeCategories: Category[] = [];
  
  categories.forEach(category => {
    const cafeIds = categoryCafesMap[category.id] || [];
    if (cafeIds.includes(cafeId)) {
      cafeCategories.push(category);
    }
  });
  
  return cafeCategories;
}
