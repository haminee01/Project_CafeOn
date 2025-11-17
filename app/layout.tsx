import Script from "next/script";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GoogleMapsLoader from "@/components/map/GoogleMapsLoader";
import ToastProvider from "@/components/common/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <html lang="ko">
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <ReactQueryProvider>
          <AuthProvider>
            <ToastProvider>
              <main>{children}</main>
            </ToastProvider>
          </AuthProvider>
        </ReactQueryProvider>

        {/* Kakao SDK for sharing */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/v1/kakao.min.js"
          strategy="lazyOnload"
        />

        {/* Google Maps API 스크립트 */}
        <GoogleMapsLoader apiKey={API_KEY} />
      </body>
    </html>
  );
}
