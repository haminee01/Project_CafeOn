"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { seoulDistricts } from "@/data/seoulDistricts";
import { Cafe } from "@/types/cafe";

interface MapProps {
  className?: string;
  cafes?: any[]; // 맵에 표시할 카페 목록
}

function Map({ className = "", cafes = [] }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const router = useRouter();

  // 지도 UI 및 로드 상태
  const [isMounted, setIsMounted] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  // UI에 표시될 지역 이름 상태 (초기값은 빈 문자열로 hydration 안전성 확보)
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // 지도 중심 데이터 객체 상태 (초기에는 null로 설정)
  const [randomDistrict, setRandomDistrict] = useState<any>(null);

  // ---------------------- useEffect #0: 데이터 준비 (클라이언트에서 1회 실행) ----------------------
  useEffect(() => {
    if (!seoulDistricts || seoulDistricts.length === 0) {
      return;
    }

    // 1. 유효한 좌표를 가진 지역들만 필터링
    const validDistricts = seoulDistricts.filter(
      (d) => typeof d.latitude === "number" && typeof d.longitude === "number"
    );

    // 2. 랜덤 선택을 위한 시드 설정 (시간 기반 시드로 서버/클라이언트 일관성 보장)
    const now = new Date();
    const seed = now.getHours() * 60 + now.getMinutes();

    // 3. 지역 선택
    let selected;
    if (validDistricts.length === 0) {
      selected = seoulDistricts[0]; // 유효 좌표 없으면 첫 항목 사용
    } else {
      const randomIndex = seed % validDistricts.length; // 시드 기반 인덱스 계산
      selected = validDistricts[randomIndex];
    }

    // 4. 상태 업데이트
    setRandomDistrict(selected); // 지도 중심 데이터 객체 저장
    setSelectedDistrict(selected?.name || ""); // UI 표시용 이름 저장
  }, [seoulDistricts]); // seoulDistricts가 로드되거나 변경될 때 재실행

  /* ---------------------- useEffect #1: API 로드 상태 관리 (리스너 및 복구) ---------------------- */
  useEffect(() => {
    // API 로드 성공/실패 시 호출될 이벤트 리스너 함수 정의
    const handleGoogleMapsLoaded = () => {
      setIsApiLoaded(true);

      // API 로드 완료 후에도 Map 생성자가 준비되지 않았을 수 있으므로,
      // 작은 시간차를 두고 상태를 false->true로 토글하여 useEffect #2를 강제 재시도하도록 유도
      setTimeout(() => {
        if ((window as any).google?.maps?.Map) {
          setIsApiLoaded(false);
          setTimeout(() => setIsApiLoaded(true), 10);
        } else {
          setTimeout(() => {
            if ((window as any).google?.maps?.Map) {
              setIsApiLoaded(false);
              setTimeout(() => setIsApiLoaded(true), 10);
            }
          }, 100);
        }
      }, 200);
    };

    const handleGoogleMapsError = (e: any) => {
      setIsApiLoaded(false);
    };

    if ((window as any).google?.maps) {
      setIsApiLoaded(true);
    } else {
      (window as any).addEventListener(
        "googleMapsLoaded",
        handleGoogleMapsLoaded
      );
      (window as any).addEventListener(
        "googleMapsError",
        handleGoogleMapsError
      );
    }

    // 클린업 함수: 리스너 제거
    return () => {
      (window as any).removeEventListener(
        "googleMapsLoaded",
        handleGoogleMapsLoaded
      );
      (window as any).removeEventListener(
        "googleMapsError",
        handleGoogleMapsError
      );
    };
  }, [isMounted, randomDistrict]);

  /* ---------------------- useEffect #2: 지도 생성 로직 (메인) ---------------------- */
  useEffect(() => {
    // 1. 필수 조건 검사 (API, DOM, 데이터)
    if (!isApiLoaded || !randomDistrict) {
      return;
    }

    // mapRef가 null일 경우, 짧은 시간 후 다시 시도하도록 유도
    if (!mapRef.current) {
      const t = setTimeout(() => {
        setIsApiLoaded(false); // false로 바꿨다가
        setTimeout(() => setIsApiLoaded(true), 1); // 다시 true로 바꾸어 useEffect를 트리거
      }, 50);
      return () => clearTimeout(t);
    }

    // 조건 3: 이미 지도가 생성되었으면 중복 생성 방지
    if (isMounted) {
      return;
    }

    // requestAnimationFrame으로 브라우저 리페인트 직전에 지도 생성 시작
    window.requestAnimationFrame(() => {
      try {
        // API 생성자 준비 최종 확인
        if (!(window as any).google?.maps?.Map) {
          console.warn("Google Maps API not fully loaded yet, will retry...");
          // API가 아직 로드되지 않았으면 잠시 후 재시도
          setTimeout(() => {
            setIsApiLoaded(false);
            setTimeout(() => setIsApiLoaded(true), 100);
          }, 500);
          return;
        }

        const center = {
          lat: randomDistrict.latitude,
          lng: randomDistrict.longitude,
        };

        // 2. Google Maps 인스턴스 생성
        const map = new (window as any).google.maps.Map(
          mapRef.current as HTMLDivElement,
          {
            zoom: 15,
            center,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }
        );

        mapInstance.current = map;

        // 3. 강제 resize 트리거 (지도 크기 오류 방지)
        setTimeout(() => {
          try {
            (window as any).google.maps.event.trigger(map, "resize");
            map.setCenter(center); // resize 후 중심 재설정
          } catch (e) {
            console.error("Resize trigger failed", e);
          }
        }, 250);

        // 마커 추가 함수를 별도로 정의
        const addMarkers = (cafeList: any[]) => {
          cafeList.forEach((cafe) => {
            // 카페 ID 확인 (API 데이터의 경우 cafeId, mock 데이터의 경우 cafe_id)
            const cafeId = cafe.cafeId || cafe.cafe_id || "";

            const marker = new (window as any).google.maps.Marker({
              position: { lat: cafe.latitude, lng: cafe.longitude },
              map: map,
              title: cafe.name,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                 <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 20 12 20s12-12.5 12-20c0-6.627-5.373-12-12-12z" fill="#6E4213"/>
                   <circle cx="12" cy="12" r="6" fill="white"/>
                 </svg>
               `)}`,
                scaledSize: new (window as any).google.maps.Size(24, 32),
                anchor: new (window as any).google.maps.Point(12, 32),
              },
            });

            // 인포윈도우 생성
            const infoWindow = new (window as any).google.maps.InfoWindow({
              disableAutoPan: true,
              content: `
               <div 
                 id="info-window-${cafeId}"
                 style="
                   min-width: 180px; 
                   padding: 8px; 
                   background: white;
                   border-radius: 12px;
                   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                   outline: none;
                   border: none;
                 "
                 onmouseenter="
                   if (window.infoWindowCloseTimer) {
                     clearTimeout(window.infoWindowCloseTimer);
                     window.infoWindowCloseTimer = null;
                   }
                   window.mouseOverInfoWindow = true;
                 "
                 onmouseleave="
                 "
               >
                 <div style="margin-bottom: 12px;">
                   <h3 style="
                     color: #6E4213; 
                     font-size: 15px; 
                     font-weight: 700; 
                     margin: 0; 
                     line-height: 1.3;
                   ">${cafe.name}</h3>
                 </div>
                 
                 <div style="margin-bottom: 16px;">
                   <div style="display: flex; align-items: flex-start; gap: 6px;">
                     <span style="color: #6E4213; font-size: 14px; margin-top: 1px;">📍</span>
                     <span style="color: #374151; font-size: 13px; line-height: 1.4;">${
                       cafe.address
                     }</span>
                   </div>
                   ${
                     cafe.tags && cafe.tags.length > 0
                       ? `<div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                           ${cafe.tags
                             .slice(0, 3)
                             .map(
                               (tag: string) =>
                                 `<span style="
                                   background-color: #F4EDE5;
                                   color: #6E4213;
                                   padding: 2px 8px;
                                   border-radius: 12px;
                                   font-size: 11px;
                                   font-weight: 500;
                                 ">${tag}</span>`
                             )
                             .join("")}
                         </div>`
                       : ""
                   }
                 </div>
                 
                <button 
                  id="cafe-detail-btn-${cafeId}"
                   style="
                     width: 100%; 
                     padding: 12px 16px; 
                     background: #6E4213; 
                     color: white; 
                     border: none; 
                     border-radius: 8px; 
                     font-size: 12px; 
                     font-weight: 600; 
                     cursor: pointer;
                     transition: all 0.2s ease;
                     box-shadow: 0 2px 4px rgba(110, 66, 19, 0.2);
                     outline: none;
                   "
                   onmouseover="
                     this.style.backgroundColor='#C19B6C'; 
                     this.style.transform='translateY(-1px)'; 
                     this.style.boxShadow='0 4px 8px rgba(110, 66, 19, 0.3)';
                   "
                   onmouseout="
                     this.style.backgroundColor='#6E4213'; 
                     this.style.transform='translateY(0)'; 
                     this.style.boxShadow='0 2px 4px rgba(110, 66, 19, 0.2)';
                   "
                 >
                   궁금해요
                 </button>
               </div>
             `,
            });
            // 마커 호버 시 인포윈도우 표시
            marker.addListener("mouseover", () => {
              // 다른 인포윈도우 모두 닫기
              infoWindowsRef.current.forEach((iw) => iw.close());

              infoWindow.open(map, marker);

              // 인포윈도우 내 버튼 클릭 이벤트 등록
              setTimeout(() => {
                const detailButton = document.getElementById(
                  `cafe-detail-btn-${cafeId}`
                );
                if (detailButton) {
                  detailButton.addEventListener("click", () => {
                    router.push(`/cafes/${cafeId}`);
                  });
                }
              }, 100);
            });

            // 마커에서 마우스 떼면 인포윈도우 닫기
            marker.addListener("mouseout", () => {
              // 약간의 지연을 두어 인포윈도우로 마우스가 이동할 시간을 줌
              setTimeout(() => {
                infoWindow.close();
              }, 100);
            });

            // 마커 클릭 시에도 인포윈도우 표시 (기존 기능 유지)
            marker.addListener("click", () => {
              // 다른 인포윈도우 모두 닫기
              infoWindowsRef.current.forEach((iw) => iw.close());

              infoWindow.open(map, marker);

              // 인포윈도우 내 버튼 클릭 이벤트 등록
              setTimeout(() => {
                const detailButton = document.getElementById(
                  `cafe-detail-btn-${cafeId}`
                );
                if (detailButton) {
                  detailButton.addEventListener("click", () => {
                    router.push(`/cafes/${cafeId}`);
                  });
                }
              }, 100);
            });

            // 마커와 인포윈도우를 배열에 저장 (클린업용)
            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
          });
        };

        // 지도 생성 시 마커 추가
        addMarkers(cafes);
        
        // 모든 마커를 포함하도록 지도 범위 조정
        if (cafes.length > 0) {
          const bounds = new (window as any).google.maps.LatLngBounds();
          cafes.forEach((cafe) => {
            if (cafe.latitude && cafe.longitude) {
              bounds.extend({
                lat: cafe.latitude,
                lng: cafe.longitude,
              });
            }
          });
          
          // bounds가 유효한 경우에만 fitBounds 적용
          if (!bounds.isEmpty()) {
            // 단일 마커인 경우를 대비해 padding 추가
            if (cafes.length === 1) {
              map.setCenter({
                lat: cafes[0].latitude,
                lng: cafes[0].longitude,
              });
              map.setZoom(15);
            } else {
              map.fitBounds(bounds, {
                padding: 50, // 여백 추가
              });
            }
          }
        }
        
        // 지도 클릭 시 모든 인포윈도우 닫기 및 맵 페이지로 이동
        map.addListener("click", () => {
          infoWindowsRef.current.forEach((iw) => iw.close());
          // 지도 클릭 시 맵 페이지로 이동
          router.push("/map");
        });

        setIsMounted(true);
      } catch (err) {
        console.error("Map creation failed:", err);
        setIsMounted(false);
      }
    });

    // 클린업 함수
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      infoWindowsRef.current.forEach((iw) => iw.close());
      infoWindowsRef.current = [];
      setIsMounted(false);
    };
  }, [isApiLoaded, randomDistrict]);

  // cafes 변경 시 마커 업데이트
  useEffect(() => {
    if (!isMounted || !mapInstance.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current = [];

    // 새 마커 추가
    const addMarkers = (cafeList: any[]) => {
      cafeList.forEach((cafe) => {
        const cafeId = cafe.cafeId || cafe.cafe_id || "";

        if (!cafe.latitude || !cafe.longitude) return;

        const marker = new (window as any).google.maps.Marker({
          position: { lat: cafe.latitude, lng: cafe.longitude },
          map: mapInstance.current,
          title: cafe.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 20 12 20s12-12.5 12-20c0-6.627-5.373-12-12-12z" fill="#6E4213"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new (window as any).google.maps.Size(24, 32),
            anchor: new (window as any).google.maps.Point(12, 32),
          },
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          disableAutoPan: true,
          content: `
            <div id="info-window-${cafeId}" style="min-width: 180px; padding: 8px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); outline: none; border: none;">
              <div style="margin-bottom: 12px;">
                <h3 style="color: #6E4213; font-size: 15px; font-weight: 700; margin: 0; line-height: 1.3;">${
                  cafe.name
                }</h3>
              </div>
              <div style="margin-bottom: 16px;">
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <span style="color: #6E4213; font-size: 14px; margin-top: 1px;">📍</span>
                  <span style="color: #374151; font-size: 13px; line-height: 1.4;">${
                    cafe.address
                  }</span>
                </div>
                ${
                  cafe.tags && cafe.tags.length > 0
                    ? `<div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                        ${cafe.tags
                          .slice(0, 3)
                          .map(
                            (tag: string) =>
                              `<span style="
                                background-color: #F4EDE5;
                                color: #6E4213;
                                padding: 2px 8px;
                                border-radius: 12px;
                                font-size: 11px;
                                font-weight: 500;
                              ">${tag}</span>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }
              </div>
              <button id="cafe-detail-btn-${cafeId}" style="width: 100%; padding: 12px 16px; background: #6E4213; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(110, 66, 19, 0.2); outline: none;">
                궁금해요
              </button>
            </div>
          `,
        });

        marker.addListener("mouseover", () => {
          infoWindowsRef.current.forEach((iw) => iw.close());
          infoWindow.open(mapInstance.current, marker);
          (window as any).currentInfoWindow = infoWindow;
          setTimeout(() => {
            const detailButton = document.getElementById(
              `cafe-detail-btn-${cafeId}`
            );
            if (detailButton) {
              detailButton.addEventListener("click", () => {
                router.push(`/cafes/${cafeId}`);
              });
            }
          }, 100);
        });

        marker.addListener("click", () => {
          infoWindowsRef.current.forEach((iw) => iw.close());
          infoWindow.open(mapInstance.current, marker);
          (window as any).currentInfoWindow = infoWindow;
          setTimeout(() => {
            const detailButton = document.getElementById(
              `cafe-detail-btn-${cafeId}`
            );
            if (detailButton) {
              detailButton.addEventListener("click", () => {
                router.push(`/cafes/${cafeId}`);
              });
            }
          }, 100);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      });
    };

    addMarkers(cafes);
    
    // 모든 마커를 포함하도록 지도 범위 조정
    if (cafes.length > 0 && mapInstance.current) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      cafes.forEach((cafe) => {
        if (cafe.latitude && cafe.longitude) {
          bounds.extend({
            lat: cafe.latitude,
            lng: cafe.longitude,
          });
        }
      });
      
      // bounds가 유효한 경우에만 fitBounds 적용
      if (!bounds.isEmpty()) {
        // 단일 마커인 경우를 대비해 padding 추가
        if (cafes.length === 1) {
          mapInstance.current.setCenter({
            lat: cafes[0].latitude,
            lng: cafes[0].longitude,
          });
          mapInstance.current.setZoom(15);
        } else {
          mapInstance.current.fitBounds(bounds, {
            padding: 50, // 여백 추가
          });
        }
      }
    }
  }, [cafes, isMounted, router]);

  return (
    <div className={`relative ${className}`}>
      <div
        id="app-map"
        ref={mapRef}
        className={`w-full ${
          className.includes("h-screen") ? "h-screen" : "h-[38rem]"
        } rounded-lg`}
      />

      {(!isMounted || !isApiLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse rounded-lg pointer-events-none">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">
              지도를 불러오고 있어요...
            </p>
            <div className="text-sm text-gray-600">지도 생성중...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
