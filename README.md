# CafeOn Frontend

카페 검색 및 추천 서비스의 프론트엔드 애플리케이션입니다.

## 시작하기

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수들을 설정합니다:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDC7KBOscL2BuX2h9iy9XrRBVmxi9q1GQU

# Kakao JavaScript Key (SNS 공유 기능용)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key

# 소셜 로그인 Client IDs (선택사항)
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# 소셜 로그인 Client Secrets (서버 측에서만 사용, 선택사항)
NAVER_CLIENT_SECRET=your_naver_client_secret
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Google Maps API 키 발급 방법

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"에서 "Maps JavaScript API" 활성화
4. "API 및 서비스" > "사용자 인증 정보"에서 API 키 생성
5. 생성된 API 키를 `.env.local` 파일의 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`에 입력

> **참고**: 현재 개발용 API 키가 기본값으로 설정되어 있어 별도 설정 없이도 지도 기능을 사용할 수 있습니다.

#### Kakao JavaScript 키 발급 방법 (SNS 공유 기능)

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 로그인 후 "내 애플리케이션" 메뉴 선택
3. 애플리케이션 추가 또는 기존 애플리케이션 선택
4. "앱 설정" > "플랫폼"에서 Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000` (개발용), `https://yourdomain.com` (운영용)
5. "앱 키" 메뉴에서 "JavaScript 키" 복사
6. 복사한 키를 `.env.local` 파일의 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`에 입력

> **참고**: 카카오 JavaScript 키가 설정되지 않으면 카카오톡 공유 기능만 비활성화되고, 다른 SNS 공유 기능은 정상 작동합니다.

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
