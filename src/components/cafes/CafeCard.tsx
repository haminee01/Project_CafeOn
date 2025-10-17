"use client";

import type { Cafe } from "@/types/cafe";
import { useRouter } from "next/navigation";

interface CafeCardProps {
  cafe: Cafe;
  className?: string;
}

const CafeCard: React.FC<CafeCardProps> = ({ cafe, className = "" }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/cafes/${cafe.cafe_id}`);
  };

  return (
    <div className={`cursor-pointer ${className}`} onClick={handleCardClick}>
      <div className="relative aspect-square bg-gray-200 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
          <div className="text-6xl">☕</div>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className="text-sm font-semibold text-gray-700">
              {cafe.avg_rating || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col items-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 w-full text-center">
          {cafe.name}
        </h3>

        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-600 line-clamp-1">description</p>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
