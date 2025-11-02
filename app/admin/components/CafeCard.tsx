"use client";

import Button from "@/components/common/Button";

interface CafeCardProps {
  cafe: {
    cafe_id: number;
    name: string;
    address: string;
    description: string;
    photoUrl?: string | null;
    photo_url?: string | null;
    images?: string[];
  };
  onEdit: (cafe: any) => void;
  onDelete: (cafe: any) => void;
}

export default function CafeCard({ cafe, onEdit, onDelete }: CafeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 카페 이미지 */}
      <div className="h-48 bg-gray-200 overflow-hidden relative">
        {(() => {
          const imageUrl = cafe.photoUrl || cafe.photo_url || 
                          (cafe.images && Array.isArray(cafe.images) && cafe.images.length > 0 ? cafe.images[0] : null);
          
          if (imageUrl) {
            return (
              <>
                <img
                  src={imageUrl}
                  alt={cafe.name || "카페 이미지"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 플레이스홀더 표시
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* 플레이스홀더 (이미지 로드 실패 시) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 -z-10">
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">카페 이미지</p>
                  </div>
                </div>
              </>
            );
          }
          
          // 이미지가 없을 때 플레이스홀더
          return (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">카페 이미지</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 카페 정보 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">{cafe.name}</h3>
        
        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <Button color="secondary" size="sm" className="flex-1" onClick={() => onEdit(cafe)}>
            수정
          </Button>
          <Button 
            color="gray" 
            size="sm" 
            className="flex-1"
            onClick={() => onDelete(cafe)}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
