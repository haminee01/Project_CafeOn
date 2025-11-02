# CafeOn Frontend

카페 검색 및 추천 서비스의 프론트엔드 애플리케이션입니다.

## 📋 목차

- [시작하기](#시작하기)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [환경 변수](#환경-변수)
- [스크립트](#스크립트)

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- 백엔드 서버가 실행 중이어야 함 (기본: http://localhost:8080)

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 모드로 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드 및 프로덕션 실행

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## ✨ 주요 기능

### 1. 홈페이지
- 랜덤 카페 추천
- 인기 카페 목록 (Hot Cafes)
- 찜 많은 카페 목록
- 지도에 카페 위치 표시

### 2. 카페 검색
- 키워드 검색 (카페 이름, 주소, 태그)
- 태그 필터링
- 카테고리별 검색
- 실시간 검색 결과 표시

### 3. 카페 상세 정보
- 카페 기본 정보 (이름, 주소, 전화번호, 영업시간)
- 카페 이미지 갤러리
- 태그 정보
- 평점 및 리뷰 요약

### 4. 리뷰 시스템
- 리뷰 작성, 수정, 삭제
- 리뷰 이미지 업로드
- 리뷰 정렬 기능:
  - 최신순
  - 평점 높은순
  - 평점 낮은순
- 리뷰 신고 기능

### 5. 지도 기능
- Google Maps API를 활용한 지도 표시
- 사용자 위치 기반 근처 카페 조회
- 인기 카페 목록 표시
- 찜한 카페 목록 표시
- 카페 마커 클릭 시 상세 정보 표시

### 6. 사용자 기능
- 소셜 로그인 (카카오, 네이버, 구글)
- 마이페이지
  - 작성한 리뷰 관리
  - 찜한 카페 관리
  - 문의 내역 확인
- 알림 기능
- 채팅 기능

### 7. 관리자 페이지
- 회원 관리
- 카페 관리
- 리뷰 신고 관리
- 문의 관리

### 8. 채팅 기능
- 카페별 그룹 채팅
- 실시간 메시지 전송 (STOMP)
- 개인 메시지

## 🛠 기술 스택

### 프레임워크 및 라이브러리
- **Next.js 15** - React 프레임워크 (App Router)
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

### 주요 의존성
- **Axios** - HTTP 클라이언트
- **@stomp/stompjs** - WebSocket 메시징 (채팅 기능)
- **React Icons** - 아이콘 라이브러리
- **Google Maps API** - 지도 기능

### 개발 도구
- **TypeScript** - 타입 체크
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 후처리

## 📁 프로젝트 구조

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 페이지
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── (main)/                   # 메인 페이지 그룹
│   │   ├── page.tsx              # 홈페이지
│   │   ├── map/                  # 지도 페이지
│   │   ├── search/               # 검색 페이지
│   │   ├── cafes/                # 카페 관련 페이지
│   │   │   ├── [cafeId]/        # 카페 상세 페이지
│   │   │   └── page.tsx          # 카페 목록
│   │   └── chats/                # 채팅 페이지
│   ├── (mypage)/                 # 마이페이지 그룹
│   │   └── mypage/
│   │       ├── page.tsx          # 마이페이지 홈
│   │       ├── reviews/           # 내 리뷰
│   │       ├── bookmarks/        # 찜한 카페
│   │       ├── history/          # 내 활동 내역
│   │       └── qna/              # 문의 내역
│   ├── admin/                    # 관리자 페이지
│   │   ├── members/              # 회원 관리
│   │   ├── cafes/                # 카페 관리
│   │   ├── reports/              # 신고 관리
│   │   └── inquiries/            # 문의 관리
│   ├── community/                # 커뮤니티
│   └── layout.tsx                # 루트 레이아웃
├── src/
│   ├── api/                      # API 클라이언트
│   │   ├── chat.ts               # 채팅 API
│   │   ├── community.ts          # 커뮤니티 API
│   │   └── fetcher.ts            # API fetcher
│   ├── components/               # 재사용 가능한 컴포넌트
│   │   ├── cafes/                # 카페 관련 컴포넌트
│   │   ├── chat/                 # 채팅 컴포넌트
│   │   ├── common/               # 공통 컴포넌트
│   │   ├── map/                  # 지도 컴포넌트
│   │   ├── modals/               # 모달 컴포넌트
│   │   └── mypage/               # 마이페이지 컴포넌트
│   ├── contexts/                 # React Context
│   │   ├── AuthContext.tsx       # 인증 컨텍스트
│   │   └── ChatContext.tsx       # 채팅 컨텍스트
│   ├── lib/                      # 유틸리티 라이브러리
│   │   ├── api.ts                # API 함수들
│   │   ├── axios.ts              # Axios 설정
│   │   └── stompClient.ts        # STOMP 클라이언트
│   ├── hooks/                    # Custom Hooks
│   ├── types/                    # TypeScript 타입 정의
│   └── utils/                    # 유틸리티 함수
├── public/                       # 정적 파일
└── package.json
```

## 🔧 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# 소셜 로그인 (선택사항)
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

> **참고**: `.env.local` 파일은 Git에 커밋하지 마세요. `.gitignore`에 포함되어 있습니다.

## 📜 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린터 실행
npm run lint
```

## 🔗 API 연동

프론트엔드는 백엔드 API와 통신합니다. 주요 API 엔드포인트:

- **카페 API**: `/api/cafes/*`
- **리뷰 API**: `/api/cafes/{cafeId}/reviews`
- **인증 API**: `/api/auth/*`
- **사용자 API**: `/api/my/*`
- **채팅 API**: `/api/chats/*`
- **관리자 API**: `/api/admin/*`

자세한 API 명세는 백엔드 문서를 참조하세요.

## 🎨 스타일링

프로젝트는 Tailwind CSS를 사용하여 스타일링됩니다. 커스텀 색상 및 설정은 `tailwind.config.js`에서 관리됩니다.

## 📝 주요 컴포넌트

### 공통 컴포넌트
- `Header` - 상단 네비게이션 바
- `Footer` - 하단 푸터
- `Button` - 재사용 가능한 버튼 컴포넌트
- `SearchBar` - 검색 바
- `Toast` - 토스트 알림

### 카페 컴포넌트
- `CafeCard` - 카페 카드 컴포넌트
- `CafeCarousel` - 카페 캐러셀
- `CafeGrid` - 카페 그리드 레이아웃

### 지도 컴포넌트
- `Map` - Google Maps 지도 컴포넌트
- `GoogleMapsLoader` - Google Maps 로더

## 🔐 인증

프로젝트는 JWT 토큰 기반 인증을 사용합니다. 인증 토큰은 `localStorage`에 저장됩니다.

## 🌐 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 📄 라이선스

이 프로젝트는 프라이빗 프로젝트입니다.

## 👥 개발팀

CafeOn 개발팀

---

문의사항이 있으시면 이슈를 등록해주세요.
