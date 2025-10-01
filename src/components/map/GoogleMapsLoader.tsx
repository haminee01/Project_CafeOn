"use client";

import Script from "next/script";

interface GoogleMapsLoaderProps {
  apiKey: string;
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ apiKey }) => {
  return (
    <Script
      id="google-maps-api-loader"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`}
      onLoad={() => {
        console.log("Google Maps API loaded successfully");
        // API 로딩 완료를 알리는 커스텀 이벤트 발생
        window.dispatchEvent(new CustomEvent("googleMapsLoaded"));
      }}
      onError={(e) => {
        console.error("Failed to load Google Maps API:", e);
        // API 로딩 실패를 알리는 커스텀 이벤트 발생
        window.dispatchEvent(new CustomEvent("googleMapsError", { detail: e }));
      }}
    />
  );
};

export default GoogleMapsLoader;
