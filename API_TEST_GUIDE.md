# 🔐 Auth API 연결 테스트 가이드

## ✅ 현재 상태

### 백엔드 (Spring Boot)

- **상태**: ✅ 정상 실행 중
- **포트**: 8080
- **URL**: http://localhost:8080
- **데이터베이스**: H2 인메모리 (개발용)
- **Swagger UI**: http://localhost:8080/api-docs

### 프론트엔드 (Next.js)

- **상태**: 설치 중
- **예상 포트**: 3001
- **URL**: http://localhost:3001

---

## 🧪 API 테스트 방법

### 방법 1: HTML 테스트 페이지 사용 (추천)

1. **테스트 페이지 열기**:

   ```bash
   open /Users/sba/Desktop/pj/test-auth.html
   ```

   또는 브라우저에서 `file:///Users/sba/Desktop/pj/test-auth.html` 열기

2. **테스트 순서**:
   1. 서버 상태 확인 (자동 실행)
   2. 회원가입 테스트
   3. 로그인 테스트 (자동으로 refresh token 입력됨)
   4. 토큰 갱신 테스트

### 방법 2: curl 명령어 사용

#### 1. 회원가입

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "nickname": "테스트유저"
  }'
```

**예상 응답**:

```json
{
  "message": "회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.",
  "data": {
    "userId": "5fcff15b-e144-43a6-9788-3fdb5afa0096",
    "email": "test@example.com",
    "nickname": "테스트유저"
  }
}
```

#### 2. 로그인

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
  }'
```

**예상 응답**:

```json
{
  "message": "로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

#### 3. 토큰 갱신

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

---

## 📋 설정된 API 엔드포인트

### Auth 관련

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃
- `PUT /api/auth/password` - 비밀번호 변경

### 기타

- `GET /api-docs` - Swagger UI
- `GET /h2-console` - H2 데이터베이스 콘솔

---

## 🛠️ 백엔드 서버 관리

### 서버 시작

```bash
cd /Users/sba/Desktop/pj/backend
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 서버 중지

```bash
# 8080 포트를 사용하는 프로세스 종료
lsof -ti:8080 | xargs kill -9
```

### 서버 상태 확인

```bash
# 포트 사용 확인
lsof -i:8080

# 서버 응답 확인
curl http://localhost:8080/api-docs
```

---

## 🗄️ 데이터베이스 설정

### 현재 설정 (H2 인메모리)

- **URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: (없음)
- **콘솔**: http://localhost:8080/h2-console

### 특징

- ✅ 외부 DB 설치 불필요
- ✅ 개발/테스트에 최적화
- ✅ 서버 재시작 시 데이터 초기화
- ⚠️ 데이터 영구 저장 안 됨 (개발용)

### MySQL로 전환하려면

1. MySQL 설치 및 실행
2. `application-local.yml` 수정:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/cafeOn
       username: your_username
       password: your_password
       driver-class-name: com.mysql.cj.jdbc.Driver
     jpa:
       database-platform: org.hibernate.dialect.MySQLDialect
   ```
3. `schema.sql.bak`을 `schema.sql`로 복원

---

## 🚀 프론트엔드 연동

### 환경 변수 설정

파일: `/Users/sba/Desktop/pj/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### API 호출 예제

```typescript
// /Users/sba/Desktop/pj/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function signup(userData: {
  email: string;
  password: string;
  nickname: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
}
```

---

## ✅ 테스트 완료 확인사항

- [x] 백엔드 서버 정상 실행 (포트 8080)
- [x] H2 데이터베이스 연결 성공
- [x] 회원가입 API 작동 확인
- [x] 로그인 API 작동 확인
- [x] JWT 토큰 발급 확인
- [x] Swagger UI 접근 가능
- [ ] 프론트엔드 연동 테스트 (진행 중)

---

## 🐛 문제 해결

### "Port 8080 already in use"

```bash
lsof -ti:8080 | xargs kill -9
```

### "Failed to fetch" 에러

1. 백엔드 서버 실행 여부 확인
2. CORS 설정 확인 (SecurityConfig)
3. 브라우저 콘솔에서 네트워크 탭 확인

### "Unsupported class file major version 69"

```bash
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH
java -version  # Java 17 확인
```

---

## 📞 다음 단계

1. ✅ 백엔드 API 연결 확인 완료
2. 🔄 프론트엔드 개발 서버 실행 중
3. ⏭️ 프론트엔드에서 실제 회원가입/로그인 테스트
4. ⏭️ 추가 API 엔드포인트 개발 및 테스트

---

**작성일**: 2025-10-10  
**테스트 환경**: macOS, Java 17, Node.js, H2 Database
