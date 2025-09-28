"use client"

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { seoulDistricts } from '@/data/seoulDistricts';
import { mockCafes } from '@/data/mockCafes';

interface MapProps {
    className?: string;
}

const Map:React.FC<MapProps> = ({className = ""}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const router = useRouter();
    const [selectedDistrict, setSelectedDistrict] = useState<string>("null");

    // 랜덤 구 선택
    const getRandomDistrict = () => {
        const randomIndex = Math.floor(Math.random() * seoulDistricts.length);
        return selectedDistrict[randomIndex];
    }

    // 구별 카페 필터링
    const getCafesInDistrict = (districtName: string): Cafe[] => {
        // 실제로는 좌표 기반으로 필터링하지만, mock 데이터에서는 랜덤으로 반환
        return mockCafes.slice(0, Math.floor(Math.random() * 5) + 3);
    };

    // 지도 초기화
    useEffect(() => {
        if(!mapRef.current) return;

        const randomDistrict = getRandomDistrict();
        setSelectedDistrict(randomDistrict);

        const map = new Google.maps.Map(mapRef.current, {
            zoom: 15,
            center: {
                lat: randomDistrict.latitude,
                lng: randomDistrict.longitude
            },
            styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
        })

        mapInstance.current = map;

        // 카페 마커 추가
        const cafes = getCafesInDistrict(randomDistrict.name);
        cafes.forEach((cafe) => {
            const marker = new google.maps.Marker({
                position: {lat: cafe.latitude, lng: cafe.longitude},
                map: map,
                title: cafe.name,
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#6E4213" stroke="white" stroke-width="2"/>
                        <path d="M8 10h8M8 14h6" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    `)}`,
                    scaledSize: new google.maps.Size(24, 24)
                  }
            });

            // 마커 클릭 시 카페 상세 페이지로 이동
            marker.addListener('click', () => {
                router.push(`/cafes/${cafe.cafe_id}`);
            })

            // 인포윈도우 추가
            
        })
    }, []);
}

export default Map;