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
    <div
      className={`cursor-pointer flex flex-col ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden rounded-lg">
        {/* 카페 이미지 */}
        {(() => {
          const imageUrl = (cafe as any).photoUrl || (cafe as any).photo_url || 
                          ((cafe as any).images && Array.isArray((cafe as any).images) && (cafe as any).images.length > 0 ? (cafe as any).images[0] : null);
          
          if (imageUrl) {
            return (
              <>
                <img
                  src={imageUrl}
                  alt={cafe.name || "카페 이미지"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 플레이스홀더로 대체
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* 플레이스홀더 (이미지 로드 실패 시) */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center -z-10">
                  <div className="text-4xl">☕</div>
                </div>
              </>
            );
          }
          
          // 이미지가 없을 때 플레이스홀더
          return (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <div className="text-4xl">☕</div>
            </div>
          );
        })()}

      </div>

      <div className="p-4 flex flex-col items-center text-center">
        <h3 className="text-lg font-normal text-gray-900 mb-2 line-clamp-1 w-full">
          {cafe.name}
        </h3>

        {/* 태그가 있으면 태그 표시, 없으면 주소 표시 */}
        {cafe.tags && Array.isArray(cafe.tags) && cafe.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center items-center min-h-[24px]">
            {cafe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {cafe.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{cafe.tags.length - 3}</span>
            )}
          </div>
        ) : (
          cafe.address && (
            <p className="text-xs text-gray-500 line-clamp-1 min-h-[24px]">{cafe.address}</p>
          )
        )}
      </div>
    </div>
  );
};

export default CafeCard;
