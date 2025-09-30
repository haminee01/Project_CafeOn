// 모달 관련 데이터 및 설정

// 공유 모달 데이터
export interface ShareData {
  cafeName: string;
  cafeAddress: string;
  shareUrl: string;
}

export const defaultShareData: ShareData = {
  cafeName: "카페 이름",
  cafeAddress: "카페 주소",
  shareUrl: "https://maps.app.goo.gl/WVyWeMFKACJHDn3x6"
};

// 채팅방 모달 데이터
export interface ChatRoomData {
  cafeName: string;
  description: string;
  currentUsers: number;
  defaultNickname: string;
}

export const defaultChatRoomData: ChatRoomData = {
  cafeName: "카페 채팅방",
  description: "해당 카페와 관련된 정보를 나누는 오픈 채팅방 입니다.",
  currentUsers: 6,
  defaultNickname: "Sunwon903"
};

// 신고 모달 데이터
export interface ReportData {
  reporterId: string;
  reportReason: string;
}

export const defaultReportData: ReportData = {
  reporterId: "미운오리9214",
  reportReason: ""
};

// 리뷰 모달 데이터
export interface ReviewData {
  userId: string;
  userName: string;
  reviewContent: string;
  images: string[];
}

export const defaultReviewData: ReviewData = {
  userId: "sunwon903",
  userName: "Sunwon903",
  reviewContent: "",
  images: []
};

// 소셜 공유 플랫폼 정보
export interface SocialSharePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl?: string;
}

export const socialSharePlatforms: SocialSharePlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    color: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
  },
  {
    id: "kakao",
    name: "KakaoTalk",
    icon: "kakao",
    color: "#FEE500"
  },
  {
    id: "blog",
    name: "Blog",
    icon: "blog",
    color: "#03C75A"
  }
];

// 모달 애니메이션 설정
export const modalAnimations = {
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-bottom-2 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200"
};

// 모달 크기 설정
export const modalSizes = {
  small: "max-w-sm",
  medium: "max-w-md",
  large: "max-w-lg",
  xlarge: "max-w-2xl",
  full: "max-w-full"
};

// 버튼 스타일 설정
export const buttonStyles = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  danger: "bg-red-500 text-white hover:bg-red-600",
  success: "bg-green-500 text-white hover:bg-green-600"
};
