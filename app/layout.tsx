import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GoogleMapsLoader from "@/components/map/GoogleMapsLoader";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Google Maps API 키 (환경 변수에서 가져오거나 기본값 사용)
  const API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyDC7KBOscL2BuX2h9iy9XrRBVmxi9q1GQU";

  return (
    <html lang="ko">
      <head>
        {/* Font Awesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>

        {/* Google Maps API 스크립트 */}
        <GoogleMapsLoader apiKey={API_KEY} />
      </body>
    </html>
  );
}
