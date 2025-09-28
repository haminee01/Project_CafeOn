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

        const map = new BsGoogle.maps.Map(mapRef.current, {
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
    }, []);
}

export default Map;