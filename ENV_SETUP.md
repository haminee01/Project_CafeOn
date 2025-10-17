# 🔧 환경 변수 설정 가이드

## 📁 파일 위치

- `.env.local` - 실제 개발용 환경 변수 (Git에 커밋하지 않음)
- `.env.example` - 환경 변수 템플릿 (Git에 커밋됨)

## ⚙️ 필요한 환경 변수들

### 1. API 설정

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

- 백엔드 서버 URL
- 개발: `http://localhost:8080`
- 프로덕션: 실제 서버 URL

### 2. 소셜 로그인 설정

#### 카카오 로그인

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. 플랫폼 설정에서 Web 플랫폼 추가
4. Redirect URI 설정: `http://localhost:3001/api/auth/kakao/callback`

```bash
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
```

#### 네이버 로그인

1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 애플리케이션 생성
3. 서비스 URL 설정: `http://localhost:3001`
4. Callback URL 설정: `http://localhost:3001/api/auth/naver/callback`

```bash
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_NAVER_CLIENT_SECRET=your_naver_client_secret
```

#### 구글 로그인

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI 추가: `http://localhost:3001/api/auth/google/callback`

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Google Maps API

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Maps JavaScript API 활성화
3. API 키 생성

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🚀 설정 방법

1. `.env.local` 파일을 열어서 위의 값들을 실제 값으로 교체
2. 프론트엔드 재시작:
   ```bash
   npm run dev
   ```

## 🔒 보안 주의사항

- `.env.local` 파일은 **절대 Git에 커밋하지 마세요**
- API 키는 프로덕션에서는 환경 변수로 관리
- 클라이언트 ID는 공개되어도 상관없지만, 클라이언트 시크릿은 절대 노출하지 마세요

## 🐛 문제 해결

### API 연결 안됨

- 백엔드가 실행 중인지 확인
- `NEXT_PUBLIC_API_URL`이 올바른지 확인

### 소셜 로그인 안됨

- 각 플랫폼의 Redirect URI가 정확한지 확인
- 클라이언트 ID가 올바른지 확인

### Google Maps 로드 안됨

- Maps JavaScript API가 활성화되어 있는지 확인
- API 키가 올바른지 확인
- 도메인 제한이 설정되어 있다면 localhost가 허용되어 있는지 확인
