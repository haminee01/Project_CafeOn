"use client";

import Script from "next/script";

interface GoogleMapsLoaderProps {
  apiKey: string;
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ apiKey }) => {
  // 더미 키인지 확인
  const isDummyKey =
    apiKey === "AIzaSyDummyKeyForDevelopment" || !apiKey || apiKey.length < 10;

  if (isDummyKey) {
    // 더미 키인 경우 가짜 Google Maps 객체를 생성
    setTimeout(() => {
      (window as any).google = {
        maps: {
          Map: class DummyMap {
            constructor(element: HTMLElement, options: any) {
              console.log("Dummy Google Maps loaded for development");
              // 가짜 지도 DOM 생성
              element.innerHTML = `
                <div style="
                  width: 100%; 
                  height: 100%; 
                  background: #F4EDE5;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  border-radius: 8px;
                  position: relative;
                  overflow: hidden;
                ">
                  <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  ">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
                      🗺️ 지도 미리보기
                    </h3>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                      Google Maps API 키를 설정하면<br/>
                      실제 지도를 볼 수 있습니다
                    </p>
                  </div>
                  <div style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                  ">
                    개발 모드
                  </div>
                </div>
              `;
            }
          },
          Marker: class DummyMarker {
            constructor(options: any) {
              console.log("Dummy marker created");
            }
          },
          InfoWindow: class DummyInfoWindow {
            constructor(options: any) {
              console.log("Dummy info window created");
            }
            open() {
              console.log("Dummy info window opened");
            }
            close() {
              console.log("Dummy info window closed");
            }
          },
          Size: class DummySize {
            constructor(width: number, height: number) {
              console.log(`Dummy size: ${width}x${height}`);
            }
          },
          Point: class DummyPoint {
            constructor(x: number, y: number) {
              console.log(`Dummy point: ${x}, ${y}`);
            }
          },
          event: {
            trigger: (map: any, event: string) => {
              console.log(`Dummy event triggered: ${event}`);
            },
          },
        },
      };
      window.dispatchEvent(new CustomEvent("googleMapsLoaded"));
    }, 100);

    return null;
  }

  return (
    <Script
      id="google-maps-api-loader"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`}
      onLoad={() => {
        console.log("Google Maps API script loaded successfully");

        // API가 완전히 초기화될 때까지 대기
        const checkApiReady = () => {
          if (
            (window as any).google?.maps?.Map &&
            (window as any).google?.maps?.Marker
          ) {
            console.log("Google Maps API fully initialized");
            // API 로딩 완료를 알리는 커스텀 이벤트 발생
            window.dispatchEvent(new CustomEvent("googleMapsLoaded"));
          } else {
            console.log("Waiting for Google Maps API to initialize...");
            setTimeout(checkApiReady, 50);
          }
        };

        // 즉시 확인
        checkApiReady();
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
