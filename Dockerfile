# --- Build Stage ---
    FROM node:20 AS build
    WORKDIR /app
    
    # 빌드 인자(도커 컴포즈에서 주입)
    ARG NEXT_PUBLIC_API_URL
    ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ARG NEXT_PUBLIC_KAKAO_APP_KEY
    
    # Next 빌드 시 주입될 환경변수
    ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
    ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ENV NEXT_PUBLIC_KAKAO_APP_KEY=$NEXT_PUBLIC_KAKAO_APP_KEY
    
    # 의존성 설치
    COPY package*.json ./
    RUN npm ci
    
    # 소스 복사 및 빌드
    COPY . .
    RUN npm run build
    
    # --- Run Stage (standalone runtime) ---
    FROM node:20
    WORKDIR /app
    ENV NODE_ENV=production
    
    # standalone 결과물 복사
    COPY --from=build /app/.next/standalone ./
    COPY --from=build /app/.next/static ./.next/static
    COPY --from=build /app/public ./public
    
    EXPOSE 3000
    CMD ["node", "server.js"]