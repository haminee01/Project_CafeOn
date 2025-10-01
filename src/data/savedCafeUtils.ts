import { SavedCafe, SAVE_CATEGORIES } from "../types/savedCafe";

// 로컬 스토리지에서 저장된 카페 데이터 가져오기
export function getSavedCafes(): SavedCafe[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("savedCafes");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return parsed.map((cafe: any) => ({
      ...cafe,
      savedAt: new Date(cafe.savedAt),
    }));
  } catch {
    return [];
  }
}

// 카페를 카테고리에 저장
export function saveCafeToCategories(
  cafe: { cafe_id: string; name: string; address: string },
  categoryIds: string[]
): void {
  if (typeof window === "undefined") return;

  const savedCafes = getSavedCafes();
  const existingIndex = savedCafes.findIndex((c) => c.cafe_id === cafe.cafe_id);

  if (existingIndex >= 0) {
    // 기존 카페가 있으면 카테고리 추가
    const existingCafe = savedCafes[existingIndex];
    const newCategories = [
      ...new Set([...existingCafe.categories, ...categoryIds]),
    ];
    savedCafes[existingIndex] = {
      ...existingCafe,
      categories: newCategories,
      savedAt: new Date(),
    };
  } else {
    // 새로운 카페 추가
    savedCafes.push({
      cafe_id: cafe.cafe_id,
      name: cafe.name,
      address: cafe.address,
      categories: categoryIds,
      savedAt: new Date(),
    });
  }

  localStorage.setItem("savedCafes", JSON.stringify(savedCafes));
}

// 카페를 특정 카테고리에서 제거
export function removeCafeFromCategory(
  cafeId: string,
  categoryId: string
): void {
  if (typeof window === "undefined") return;

  const savedCafes = getSavedCafes();
  const cafeIndex = savedCafes.findIndex((c) => c.cafe_id === cafeId);

  if (cafeIndex >= 0) {
    const cafe = savedCafes[cafeIndex];
    const newCategories = cafe.categories.filter((cat) => cat !== categoryId);

    if (newCategories.length === 0) {
      // 모든 카테고리에서 제거되면 카페 자체를 삭제
      savedCafes.splice(cafeIndex, 1);
    } else {
      // 해당 카테고리만 제거
      savedCafes[cafeIndex] = {
        ...cafe,
        categories: newCategories,
      };
    }

    localStorage.setItem("savedCafes", JSON.stringify(savedCafes));
  }
}

// 특정 카테고리의 저장된 카페들 가져오기
export function getCafesByCategory(categoryId: string): SavedCafe[] {
  const savedCafes = getSavedCafes();
  return savedCafes.filter((cafe) => cafe.categories.includes(categoryId));
}

// 카테고리별 카페 개수 가져오기
export function getCategoryCounts(): { [categoryId: string]: number } {
  const savedCafes = getSavedCafes();
  const counts: { [categoryId: string]: number } = {};

  SAVE_CATEGORIES.forEach((category) => {
    counts[category.id] = savedCafes.filter((cafe) =>
      cafe.categories.includes(category.id)
    ).length;
  });

  return counts;
}

// 카페가 저장되어 있는지 확인
export function isCafeSaved(cafeId: string): boolean {
  const savedCafes = getSavedCafes();
  return savedCafes.some((cafe) => cafe.cafe_id === cafeId);
}

// 카페가 특정 카테고리에 저장되어 있는지 확인
export function isCafeSavedInCategory(
  cafeId: string,
  categoryId: string
): boolean {
  const savedCafes = getSavedCafes();
  const cafe = savedCafes.find((c) => c.cafe_id === cafeId);
  return cafe ? cafe.categories.includes(categoryId) : false;
}
