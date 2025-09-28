import { Cafe } from '@/types/cafe';

export const mockCafes: Cafe[] = [
  {
    cafe_id: '1',
    name: '스타벅스 강남점',
    address: '서울특별시 강남구 테헤란로 152',
    latitude: 37.5665,
    longitude: 127.0333,
    open_hours: '07:00 - 22:00',
    avg_rating: 4.2,
    created_at: '2024-01-01'
  },
  {
    cafe_id: '2',
    name: '투썸플레이스 홍대점',
    address: '서울특별시 마포구 와우산로29길 4',
    latitude: 37.5563,
    longitude: 126.9226,
    open_hours: '08:00 - 23:00',
    avg_rating: 4.5,
    created_at: '2024-01-02'
  },
  {
    cafe_id: '3',
    name: '카페베네 신촌점',
    address: '서울특별시 서대문구 신촌로 83',
    latitude: 37.5598,
    longitude: 126.9420,
    open_hours: '09:00 - 22:00',
    avg_rating: 4.0,
    created_at: '2024-01-03'
  },
];