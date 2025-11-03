/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone 빌드로 server.js가 포함된 런타임 산출
  output: "standalone",
  reactStrictMode: true,
  // 필요 시 여기에 추가 옵션을 넣으셔도 됩니다.
  // images: { domains: ['...'] },
  // experimental: { ... },
};

module.exports = nextConfig;
