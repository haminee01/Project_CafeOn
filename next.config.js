/** @type {import('next').NextConfig} */
const nextConfig = {
  // 하이드레이션 경고 완화
  reactStrictMode: true,

  // 브라우저 확장 프로그램으로 인한 속성 불일치 무시
  experimental: {
    // 클라이언트 사이드 하이드레이션 최적화
    optimizeCss: true,
  },

  // 개발 모드에서 하이드레이션 경고 필터링
  ...(process.env.NODE_ENV === "development" && {
    webpack: (config, { dev }) => {
      if (dev) {
        // 개발 모드에서만 하이드레이션 경고 무시
        config.ignoreWarnings = [/hydration/, /suppressHydrationWarning/];
      }
      return config;
    },
  }),
};

module.exports = nextConfig;
