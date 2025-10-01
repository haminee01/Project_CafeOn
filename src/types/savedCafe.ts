// 저장된 카페 타입 정의
export interface SavedCafe {
  cafe_id: string;
  name: string;
  address: string;
  image?: string;
  categories: string[]; // 저장된 카테고리 ID들
  savedAt: Date;
}

// 저장 카테고리 타입 정의
export interface SaveCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// 저장 카테고리 상수
export const SAVE_CATEGORIES: SaveCategory[] = [
  {
    id: "my-space",
    name: "나만의 아지트",
    description: "혼자만의 시간을 보내고 싶은 곳",
    icon: "🏠",
  },
  {
    id: "work-friendly",
    name: "작업하기 좋은",
    description: "공부나 업무에 집중할 수 있는 곳",
    icon: "💻",
  },
  {
    id: "atmosphere",
    name: "분위기",
    description: "특별한 분위기를 느끼고 싶을 때",
    icon: "✨",
  },
  {
    id: "food-quality",
    name: "커피, 디저트 맛집",
    description: "맛있는 음료와 디저트를 원할 때",
    icon: "☕",
  },
  {
    id: "wishlist",
    name: "방문예정, 찜",
    description: "나중에 꼭 가보고 싶은 곳",
    icon: "❤️",
  },
];
