"use client";

import { useState } from "react";
import { mockCafes } from "@/data/mockCafes";
import CafeCard from "@/components/cafes/CafeCard";
import ShareModal from "./components/ShareModal";
import ChatRoomModal from "./components/ChatRoomModal";
import ReportModal from "./components/ReportModal";
import ReviewModal from "./components/ReviewModal";

interface CafeDetailPageProps {
  params: {
    cafeId: string;
  };
}

// 라스트오더 정보가 있는 카페들의 ID 목록
const cafesWithLastOrder = [
  "1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31", "33", "34", "36", "38"
];

// 카페별 영업시간 상세 정보 생성 함수
function getHoursDetail(cafe: any) {
  const hasLastOrder = cafesWithLastOrder.includes(cafe.cafe_id);
  
  // 라스트오더 시간 매핑 (영업 종료 30분 전)
  const lastOrderTimes: { [key: string]: string } = {
    "07:00 - 22:00": "21:30",
    "08:00 - 23:00": "22:30", 
    "07:30 - 22:30": "22:00",
    "09:00 - 22:00": "21:30",
    "07:00 - 23:00": "22:30",
    "07:30 - 22:00": "21:30",
    "08:00 - 22:30": "22:00",
    "07:00 - 24:00": "23:30",
    "06:00 - 23:00": "22:30",
    "10:00 - 21:30": "21:00",
    "08:00 - 20:00": "19:30",
    "10:00 - 23:00": "22:30",
    "08:00 - 24:00": "23:30",
    "10:00 - 21:00": "20:30"
  };

  const lastOrderTime = hasLastOrder ? lastOrderTimes[cafe.open_hours] || "22:00" : null;
  const hoursDisplay = hasLastOrder && lastOrderTime ? `${cafe.open_hours} (라스트오더 ${lastOrderTime})` : cafe.open_hours;

  return {
    status: "영업 중",
    lastOrder: lastOrderTime,
    fullHours: hoursDisplay,
    breakTime: cafe.cafe_id === "33" ? "브레이크타임 없음" : "15:00 - 16:00",
    closedDays: getClosedDays(cafe.cafe_id)
  };
}

// 카페별 휴무일 정보
function getClosedDays(cafeId: string): string {
  const closedDaysMap: { [key: string]: string } = {
    "1": "연중무휴",
    "3": "매주 월요일 휴무", 
    "5": "연중무휴",
    "7": "매주 일요일 휴무",
    "9": "연중무휴",
    "11": "매주 화요일 휴무",
    "13": "연중무휴",
    "15": "연중무휴", 
    "17": "매주 수요일 휴무",
    "19": "연중무휴",
    "21": "매주 목요일 휴무",
    "23": "연중무휴",
    "25": "매주 금요일 휴무",
    "27": "연중무휴",
    "29": "매주 토요일 휴무",
    "31": "연중무휴",
    "33": "매주 화요일 휴무",
    "34": "연중무휴",
    "36": "연중무휴",
    "38": "매주 일요일 휴무"
  };
  
  return closedDaysMap[cafeId] || "연중무휴";
}

export default function CafeDetailPage({ params }: CafeDetailPageProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSimilarIndex, setCurrentSimilarIndex] = useState(0);
  const [showHoursDetail, setShowHoursDetail] = useState<boolean>(false);

  // mockCafes에서 카페 데이터 찾기
  const cafeData = mockCafes.find(c => c.cafe_id === params.cafeId);
  
  // 기본값으로 문래 마이스페이스 사용 (cafe_id: "33")
  const defaultCafe = mockCafes.find(c => c.cafe_id === "33") || mockCafes[0];
  const selectedCafe = cafeData || defaultCafe;

  const cafe = {
    id: selectedCafe.cafe_id,
    name: selectedCafe.name,
    slogan: selectedCafe.name === "문래 마이스페이스" ? "소중한 사람을 위한 선물 디저트" : "완벽한 커피 한 잔을 위해",
    description: selectedCafe.description,
    address: selectedCafe.address,
    subway: selectedCafe.name === "문래 마이스페이스" ? "2호선 문래역 1번 출구에서 471m" : "가장 가까운 지하철역에서 도보 5분",
    phone: selectedCafe.name === "문래 마이스페이스" ? "0507-1366-0535" : "02-1234-5678",
    hours: getHoursDetail(selectedCafe).lastOrder 
      ? `${selectedCafe.open_hours}`
      : selectedCafe.open_hours,
    hoursDetail: getHoursDetail(selectedCafe),
    images: [
      "/api/placeholder/400/300",
      "/api/placeholder/400/300", 
      "/api/placeholder/400/300"
    ],
    tags: selectedCafe.name === "문래 마이스페이스" 
      ? ["분위기", "포토스팟", "공부", "데이트", "혼자", "반려동물", "디저트 맛집"]
      : ["분위기", "커피", "디저트", "휴식"],
    reviews: [
      {
        id: 1,
        user: "미운오리9214",
        content: selectedCafe.name === "문래 마이스페이스" 
          ? "동네 맛집이라고 해서 하트 눌러놨는데 드디어 와봤습니다. 일단 인테리어부터 엄청 낭만있고, 2층에는 히든 공간이 있어요, 디저트 종류가 정말 다양하고 맛도 좋아요. 특히 딥 더티 초콜릿은 진짜 비주얼이 끝내주네요! 초코 음료랑 상큼한 치즈케이크 같이 먹으니까 완전 극락이었어요. 친구들이랑 또 가고 싶은 곳이에요!"
          : `${selectedCafe.name} 정말 좋아요! 분위기가 편안하고 커피 맛도 훌륭해요. 또 가고 싶은 카페입니다.`,
        date: "2024.01.15",
        likes: 12
      },
      {
        id: 2,
        user: "카페러버123",
        content: "분위기가 정말 좋아요! 조용하고 아늑해서 혼자 와도 좋고 친구들이랑 와도 좋을 것 같아요.",
        date: "2024.01.10",
        likes: 8
      }
    ]
  };

  // 유사 카페 추천 (현재 카페와 유사한 카페들)
  const similarCafes = selectedCafe.name === "문래 마이스페이스" 
    ? mockCafes.filter(c => ["36", "37", "38", "39"].includes(c.cafe_id)) // 데이트/로맨틱 카페들
    : mockCafes.filter(c => c.cafe_id !== selectedCafe.cafe_id).slice(0, 4); // 현재 카페 제외하고 4개

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cafe.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + cafe.images.length) % cafe.images.length);
  };

  const nextSimilar = () => {
    setCurrentSimilarIndex((prev) => (prev + 1) % similarCafes.length);
  };

  const prevSimilar = () => {
    setCurrentSimilarIndex((prev) => (prev - 1 + similarCafes.length) % similarCafes.length);
  };

    return (
    <div className="min-h-screen bg-white">
      {/* 카페 메인 정보 섹션 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측 이미지 영역 */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden relative">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                카페 이미지
              </div>
              {/* 이미지 네비게이션 */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
              >
                ←
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
              >
                →
              </button>
            </div>
          </div>

          {/* 우측 상세 정보 */}
          <div className="space-y-6">
            {/* 카페 이름 */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{cafe.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{cafe.slogan}</p>
              <p className="text-gray-700 leading-relaxed">{cafe.description}</p>
            </div>

            {/* 위치 정보 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">주소:</span>
                <span className="text-gray-600">{cafe.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">지하철:</span>
                <span className="text-gray-600">{cafe.subway}</span>
                <button className="text-primary text-sm hover:underline">길찾기</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">연락처:</span>
                <span className="text-gray-600">{cafe.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">영업시간:</span>
                <span className="text-gray-600">{cafe.hours}</span>
                <button
                  onClick={() => {
                    console.log('토글 클릭됨, 현재 상태:', showHoursDetail);
                    setShowHoursDetail(prev => !prev);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                  type="button"
                >
                  <span className={`inline-block transform transition-transform duration-200 ${showHoursDetail ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                  </span>
                </button>
              </div>
              
              {/* 영업시간 상세 정보 토글 */}
              {showHoursDetail && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상태:</span>
                      <span className={`font-medium ${cafe.hoursDetail.status === '영업 중' ? 'text-green-600' : 'text-red-600'}`}>
                        {cafe.hoursDetail.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">운영시간:</span>
                      <span className="text-gray-900">{cafe.hoursDetail.fullHours}</span>
                    </div>
                    {cafe.hoursDetail.lastOrder && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">라스트오더:</span>
                        <span className="text-gray-900 font-medium">{cafe.hoursDetail.lastOrder}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">브레이크타임:</span>
                      <span className="text-gray-900">{cafe.hoursDetail.breakTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">휴무일:</span>
                      <span className="text-gray-900">{cafe.hoursDetail.closedDays}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowChatModal(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                채팅방 참여
              </button>
              <button className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>

            {/* 리뷰 작성 필드 */}
            <div>
              <input
                type="text"
                placeholder="리뷰 작성"
                onClick={() => setShowReviewModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* 카페 특징/태그 및 이미지 갤러리 섹션 */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{cafe.name}는 이런 카페에요!</h2>
          <p className="text-gray-600 mb-8">리뷰 요약을 통해 빠르게 카페에 대한 정보를 파악하세요.</p>
          
          {/* 카테고리 필터/태그 */}
          <div className="flex flex-wrap gap-3 mb-8">
            {cafe.tags.map((tag, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 이미지 갤러리 */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {cafe.images.map((image, index) => (
                <div key={index} className="flex-shrink-0 w-80 h-48 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                  카페 이미지 {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">리뷰 모아보기</h2>
          
          <div className="space-y-6">
            {cafe.reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{review.user}</span>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div 
                      className="text-gray-700 cursor-pointer"
                      onClick={() => toggleReview(review.id)}
                    >
                      {expandedReviews.includes(review.id) ? (
                        <p>{review.content}</p>
                      ) : (
                        <p>
                          {review.content.length > 100 
                            ? `${review.content.substring(0, 100)}...` 
                            : review.content
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        좋아요 {review.likes}
                      </button>
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="text-sm text-gray-500 hover:text-red-600"
                      >
                        신고하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="text-primary hover:underline">리뷰 더보기</button>
          </div>
        </div>
      </div>

      {/* 유사 카페 추천 섹션 */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">이 카페들은 어떤가요?</h2>
          <p className="text-gray-600 mb-8">{cafe.name}와 비슷한 카페들 입니다.</p>
          
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto scrollbar-hide">
              {similarCafes.map((similarCafe, index) => (
                <div key={similarCafe.cafe_id} className="flex-shrink-0 w-80">
                  <CafeCard cafe={similarCafe} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} cafe={cafe} />}
      {showChatModal && <ChatRoomModal onClose={() => setShowChatModal(false)} cafe={cafe} />}
      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} />}
      {showReviewModal && <ReviewModal onClose={() => setShowReviewModal(false)} cafe={cafe} />}
    </div>
    );
  }