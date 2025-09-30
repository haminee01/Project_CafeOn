import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GoogleMapsLoader from "@/components/map/GoogleMapsLoader";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const API_KEY = "AIzaSyDC7KBOscL2BuX2h9iy9XrRBVmxi9q1GQU";

  return (
    <html lang="ko">
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <main>
          {children}
        </main>

        {/* Google Maps API 스크립트 */}
        <GoogleMapsLoader apiKey={API_KEY} />
      </body>
    </html>
  );
}
