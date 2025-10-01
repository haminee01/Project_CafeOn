/** @type {import('next').NextConfig} */
const nextConfig = {
  // workspace root 경고 해결
  outputFileTracingRoot: __dirname,

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 이미지 최적화 설정
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
  },

  // 실험적 기능
  experimental: {
    // 필요시 실험적 기능 활성화
  },
};

module.exports = nextConfig;
