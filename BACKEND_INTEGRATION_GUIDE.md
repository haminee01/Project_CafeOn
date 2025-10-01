# 🔗 백엔드 연동 완료 가이드

## ✅ 완료된 작업들

### 1. API 클라이언트 업데이트

- 백엔드 스펙에 맞춰 API 응답 형식 수정 (`{ success, data, error }`)
- 인증 API 엔드포인트 수정 (`/api/auth/*`)
- 새로운 카페 API 추가 (`cafeApi`)

### 2. 소셜 로그인 연동

- OAuth2 리다이렉트 URI 수정: `/oauth2/authorization/{provider}`
- Google, Kakao, Naver 소셜 로그인 지원

### 3. 거리 계산 API

- `POST /api/cafes/{cafeId}/distance` 엔드포인트 연동
- 사용자 현재 위치 기반 실시간 거리 계산

## 🔧 필요한 환경 설정

### 1. 프론트엔드 환경 변수 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDC7KBOscL2BuX2h9iy9XrRBVmxi9q1GQU
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=bbcdb0f0e8375bb0c51c120c02096458
```

### 2. 백엔드 환경 변수 (.env)

```env
# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=local

# DB
DB_URL=jdbc:mysql://localhost:3306/cafeOn
DB_USERNAME=app
DB_PASSWORD=secret

# JPA
JPA_HBM2DDL=update
JPA_SHOW_SQL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ISSUER=cafeOn
JWT_SECRET=please_change_this_in_prod
JWT_ACCESS_TTL_MIN=30
JWT_REFRESH_TTL_DAY=14

# OAuth2
OAUTH2_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH2_GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH2_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google

OAUTH2_KAKAO_CLIENT_ID=your_kakao_client_id
OAUTH_KAKAO_CLIENT_SECRET=your_kakao_client_secret
OAUTH2_KAKAO_REDIRECT_URI=http://localhost:8080/login/oauth2/code/kakao

# Mail (비밀번호 재설정용)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# S3 (이미지 업로드용)
AWS_REGION=ap-northeast-2
S3_BUCKET=cafeon-images
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## 🚀 실행 방법

### 1. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

### 2. 프론트엔드 실행

```bash
cd frontend
npm run dev
```

### 3. 헬스 체크

```bash
curl -i http://localhost:8080/actuator/health
```

## 📡 주요 API 엔드포인트

### 인증

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃
- `GET /oauth2/authorization/google` - Google 소셜 로그인
- `GET /oauth2/authorization/kakao` - Kakao 소셜 로그인

### 사용자

- `GET /api/users/me` - 프로필 조회
- `PUT /api/users/me` - 프로필 수정
- `DELETE /api/users/me` - 회원 탈퇴

### 카페

- `GET /api/cafes` - 카페 검색
- `GET /api/cafes/nearby` - 주변 카페 조회
- `GET /api/cafes/{id}` - 카페 상세 조회
- `POST /api/cafes/{id}/distance` - 거리 계산
- `GET /api/cafes/{id}/related` - 관련 카페 추천

### 위시리스트

- `GET /api/users/me/wishlist` - 위시리스트 조회
- `PUT /api/wishlist/{cafeId}` - 위시리스트 추가/수정
- `DELETE /api/wishlist/{cafeId}` - 위시리스트 삭제

### 리뷰

- `GET /api/cafes/{id}/reviews` - 리뷰 조회
- `POST /api/cafes/{id}/reviews` - 리뷰 작성
- `PUT /api/reviews/{reviewId}` - 리뷰 수정
- `DELETE /api/reviews/{reviewId}` - 리뷰 삭제

## 🔐 OAuth2 설정

### Google OAuth2

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI 추가: `http://localhost:8080/login/oauth2/code/google`

### Kakao OAuth2

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. 플랫폼 설정에서 Web 플랫폼 추가
4. 리디렉션 URI 추가: `http://localhost:8080/login/oauth2/code/kakao`

## 🗄️ 데이터베이스 설정

### MySQL 설정

```sql
CREATE DATABASE cafeOn;
CREATE USER 'app'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON cafeOn.* TO 'app'@'localhost';
FLUSH PRIVILEGES;
```

### Redis 설정

```bash
# Redis 서버 시작
redis-server
```

## 🧪 테스트 방법

### 1. 회원가입 테스트

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"테스트유저"}'
```

### 2. 로그인 테스트

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. 거리 계산 테스트

```bash
curl -X POST http://localhost:8080/api/cafes/1/distance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"userLat":37.5665,"userLng":126.9780,"cafeId":"1"}'
```

## 🎯 다음 단계

1. **백엔드 서버 실행** 확인
2. **데이터베이스 연결** 확인
3. **OAuth2 설정** 완료
4. **프론트엔드-백엔드 연동** 테스트
5. **거리 계산 API** 백엔드 구현 확인

모든 설정이 완료되면 프론트엔드와 백엔드가 완전히 연동됩니다! 🚀
