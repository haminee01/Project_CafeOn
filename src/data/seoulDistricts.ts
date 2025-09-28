export interface District {
    name: string;
    latitude: number;
    longitude: number;
  }

export const seoulDistricts: District[] = [
    { name: '강남구', latitude: 37.5172, longitude: 127.0473 },
    { name: '강동구', latitude: 37.5301, longitude: 127.1238 },
    { name: '관악구', latitude: 37.4744, longitude: 126.9507 },
    { name: '광진구', latitude: 37.5385, longitude: 127.0823 },
    { name: '마포구', latitude: 37.5663, longitude: 126.9019 },
    { name: '서초구', latitude: 37.4837, longitude: 127.0324 },
    { name: '성동구', latitude: 37.5633, longitude: 127.0366 },
    { name: '송파구', latitude: 37.5145, longitude: 127.1059 },
    { name: '영등포구', latitude: 37.5264, longitude: 126.8962 },
    { name: '용산구', latitude: 37.5384, longitude: 126.9654 },
    { name: '종로구', latitude: 37.5735, longitude: 126.9788 },
  ];