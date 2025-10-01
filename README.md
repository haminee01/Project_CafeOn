# CafeOn Frontend

카페 검색 및 추천 서비스의 프론트엔드 애플리케이션입니다.

## 시작하기

### 환경 변수 설정

1. `.env.example` 파일을 복사하여 `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

2. `.env.local` 파일을 열어 실제 API 키 값을 입력합니다:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# 소셜 로그인 Client IDs
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# 소셜 로그인 Client Secrets (서버 측에서만 사용)
NAVER_CLIENT_SECRET=your_naver_client_secret
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 설치 및 실행

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
npm run build
npm start
```

## 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Google Maps API** - 지도 기능
- **React Icons** - 아이콘 라이브러리
