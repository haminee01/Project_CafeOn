"use client";

import { useState, useRef, useEffect } from "react";
import { Cafe } from "@/types/cafe";
import CafeCard from "./CafeCard";

interface CafeCarouselProps {
  cafes: Cafe[];
  className?: string;
  title?: string;
  description?: string;
  showAllButton?: boolean;
}

const CafeCarousel: React.FC<CafeCarouselProps> = ({
  cafes,
  className = "",
  title = "추천 카페",
  description = "추천드리는 카페예요.",
  showAllButton = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const cardsPerView = 5;
  const maxIndex = Math.max(0, cafes.length - cardsPerView);

  // 터치/마우스 드래그 이벤트 처리
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    if (carouselRef.current) {
      setScrollLeft(carouselRef.current.scrollLeft);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - startX;
    carouselRef.current.scrollLeft = scrollLeft - x;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.children[0]?.clientWidth || 0;
      const gap = 16;
      const scrollPosition = currentIndex * (cardWidth + gap);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  if (cafes.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600">표시할 카페가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="relative">

        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {cafes.map((cafe) => (
            <div
              key={cafe.cafe_id}
              className="flex-shrink-0 w-64"
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              <CafeCard cafe={cafe} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CafeCarousel;
