import { Cafe } from "@/types/cafe";

export const mockCafes: Cafe[] = [
  // 강남구 카페들
  {
    cafe_id: "1",
    name: "스타벅스 강남점",
    address: "서울특별시 강남구 테헤란로 152",
    latitude: 37.5665,
    longitude: 127.0333,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.2,
    created_at: "2024-01-01",
    description:
      "강남의 핫한 비즈니스 지구에 위치한 스타벅스로, 업무용으로도 데이트용으로도 완벽한 공간입니다. 넓은 매장과 다양한 메뉴를 제공합니다.",
  },
  {
    cafe_id: "2",
    name: "투썸플레이스 강남역점",
    address: "서울특별시 강남구 강남대로 396",
    latitude: 37.498,
    longitude: 127.0276,
    open_hours: "08:00 - 23:00",
    avg_rating: 4.3,
    created_at: "2024-01-02",
    description:
      "강남역 바로 앞에 위치한 투썸플레이스로, 접근성이 뛰어나고 24시간 운영하는 편의점과 연결되어 있습니다. 다양한 디저트와 커피를 즐길 수 있어요.",
  },
  {
    cafe_id: "3",
    name: "커피빈 선릉점",
    address: "서울특별시 강남구 선릉로 513",
    latitude: 37.5044,
    longitude: 127.049,
    open_hours: "07:30 - 22:30",
    avg_rating: 4.1,
    created_at: "2024-01-03",
    description:
      "선릉역 근처의 조용한 분위기의 커피빈입니다. 공부하기 좋은 환경과 맛있는 샌드위치, 그리고 다양한 커피 메뉴를 제공합니다.",
  },

  // 마포구 카페들
  {
    cafe_id: "4",
    name: "투썸플레이스 홍대점",
    address: "서울특별시 마포구 와우산로29길 4",
    latitude: 37.5563,
    longitude: 126.9226,
    open_hours: "08:00 - 23:00",
    avg_rating: 4.5,
    created_at: "2024-01-04",
    description:
      "홍대의 젊은 에너지가 가득한 투썸플레이스입니다. 24시간 운영으로 언제든 방문 가능하며, 홍대의 활기찬 분위기를 느낄 수 있어요.",
  },
  {
    cafe_id: "5",
    name: "스타벅스 홍대점",
    address: "서울특별시 마포구 양화로 160",
    latitude: 37.5563,
    longitude: 126.9236,
    open_hours: "07:00 - 24:00",
    avg_rating: 4.4,
    created_at: "2024-01-05",
    description:
      "홍대의 중심가에 위치한 스타벅스로, 24시간 운영하는 매장입니다. 젊은 분들이 많이 찾는 곳으로 활기찬 분위기를 자랑해요.",
  },
  {
    cafe_id: "6",
    name: "이디야커피 합정점",
    address: "서울특별시 마포구 월드컵로 72",
    latitude: 37.5503,
    longitude: 126.9145,
    open_hours: "06:00 - 23:00",
    avg_rating: 4.0,
    created_at: "2024-01-06",
    description:
      "합정역 근처의 아늑한 이디야커피입니다. 합리적인 가격의 커피와 디저트를 제공하며, 조용한 분위기에서 휴식을 취하기 좋아요.",
  },

  // 서대문구 카페들
  {
    cafe_id: "7",
    name: "카페베네 신촌점",
    address: "서울특별시 서대문구 신촌로 83",
    latitude: 37.5598,
    longitude: 126.942,
    open_hours: "09:00 - 22:00",
    avg_rating: 4.0,
    created_at: "2024-01-07",
    description:
      "신촌의 대학가에 위치한 카페베네로, 학생들이 많이 찾는 곳입니다. 합리적인 가격과 넓은 공간으로 그룹 스터디나 모임에 적합해요.",
  },
  {
    cafe_id: "8",
    name: "스타벅스 이대점",
    address: "서울특별시 서대문구 신촌로 134",
    latitude: 37.5567,
    longitude: 126.946,
    open_hours: "07:00 - 23:00",
    avg_rating: 4.3,
    created_at: "2024-01-08",
    description:
      "이화여대 근처의 스타벅스로, 학생들과 지역 주민들이 많이 이용합니다. 조용한 분위기에서 공부하거나 휴식을 취하기 좋은 공간이에요.",
  },

  // 종로구 카페들
  {
    cafe_id: "9",
    name: "투썸플레이스 종로점",
    address: "서울특별시 종로구 종로 69",
    latitude: 37.57,
    longitude: 126.979,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.2,
    created_at: "2024-01-09",
    description:
      "종로의 전통적인 분위기와 현대적인 카페 문화가 만나는 투썸플레이스입니다. 관광객과 직장인들이 모두 즐겨 찾는 곳이에요.",
  },
  {
    cafe_id: "10",
    name: "스타벅스 인사동점",
    address: "서울특별시 종로구 인사동길 12",
    latitude: 37.5735,
    longitude: 126.9858,
    open_hours: "07:00 - 23:00",
    avg_rating: 4.4,
    created_at: "2024-01-10",
    description:
      "인사동의 전통 한옥 거리에 위치한 스타벅스로, 한국의 전통과 현대가 조화롭게 어우러진 특별한 공간입니다.",
  },

  // 영등포구 카페들
  {
    cafe_id: "11",
    name: "커피빈 여의도점",
    address: "서울특별시 영등포구 여의대로 24",
    latitude: 37.5219,
    longitude: 126.924,
    open_hours: "07:30 - 22:00",
    avg_rating: 4.1,
    created_at: "2024-01-11",
    description:
      "여의도의 비즈니스 중심가에 위치한 커피빈으로, 직장인들의 업무 회의나 휴식 공간으로 인기가 높습니다.",
  },
  {
    cafe_id: "12",
    name: "스타벅스 영등포점",
    address: "서울특별시 영등포구 영등포로 150",
    latitude: 37.5172,
    longitude: 126.9073,
    open_hours: "07:00 - 23:00",
    avg_rating: 4.0,
    created_at: "2024-01-12",
    description:
      "영등포역 근처의 스타벅스로, 쇼핑과 업무를 마친 후 휴식을 취하기 좋은 편리한 위치에 자리잡고 있어요.",
  },

  // 강동구 카페들
  {
    cafe_id: "13",
    name: "투썸플레이스 천호점",
    address: "서울특별시 강동구 천호대로 1012",
    latitude: 37.5392,
    longitude: 127.1238,
    open_hours: "08:00 - 22:30",
    avg_rating: 4.3,
    created_at: "2024-01-13",
    description:
      "천호역 근처의 투썸플레이스로, 가족 단위 방문객들이 많이 찾는 곳입니다. 넓은 매장과 다양한 디저트 메뉴를 제공해요.",
  },
  {
    cafe_id: "14",
    name: "스타벅스 강동구청점",
    address: "서울특별시 강동구 구천면로 395",
    latitude: 37.5301,
    longitude: 127.1238,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.2,
    created_at: "2024-01-14",
    description:
      "강동구청 근처의 스타벅스로, 공무원들과 지역 주민들이 자주 이용하는 곳입니다. 조용하고 편안한 분위기가 특징이에요.",
  },

  // 송파구 카페들
  {
    cafe_id: "15",
    name: "커피빈 잠실점",
    address: "서울특별시 송파구 올림픽로 300",
    latitude: 37.5133,
    longitude: 127.1028,
    open_hours: "07:30 - 23:00",
    avg_rating: 4.4,
    created_at: "2024-01-15",
    description:
      "잠실의 번화가에 위치한 커피빈으로, 쇼핑과 놀이를 마친 후 휴식을 취하기 좋은 곳입니다. 롯데월드와 가까워 가족 단위 방문객들이 많아요.",
  },
  {
    cafe_id: "16",
    name: "스타벅스 롯데월드점",
    address: "서울특별시 송파구 올림픽로 240",
    latitude: 37.5113,
    longitude: 127.0981,
    open_hours: "07:00 - 24:00",
    avg_rating: 4.5,
    created_at: "2024-01-16",
    description:
      "롯데월드와 바로 연결된 스타벅스로, 24시간 운영하는 매장입니다. 놀이공원을 방문한 가족들과 관광객들이 많이 찾는 특별한 공간이에요.",
  },

  // 용산구 카페들
  {
    cafe_id: "17",
    name: "투썸플레이스 용산점",
    address: "서울특별시 용산구 한강대로 405",
    latitude: 37.5316,
    longitude: 126.9787,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.2,
    created_at: "2024-01-17",
    description:
      "용산역 근처의 투썸플레이스로, 한강과 가까운 위치에 있어 조망이 좋습니다. 데이트나 휴식에 최적의 장소예요.",
  },
  {
    cafe_id: "18",
    name: "스타벅스 이태원점",
    address: "서울특별시 용산구 이태원로 200",
    latitude: 37.5347,
    longitude: 126.9947,
    open_hours: "07:00 - 23:00",
    avg_rating: 4.3,
    created_at: "2024-01-18",
    description:
      "이태원의 국제적인 분위기를 느낄 수 있는 스타벅스입니다. 다양한 국적의 사람들이 모이는 특별한 공간이에요.",
  },
  {
    cafe_id: "19",
    name: "커피빈 한남점",
    address: "서울특별시 용산구 이태원로 54길 5",
    latitude: 37.5295,
    longitude: 126.9845,
    open_hours: "07:30 - 22:30",
    avg_rating: 4.1,
    created_at: "2024-01-19",
    description:
      "한남동의 조용한 거리에 위치한 커피빈으로, 아늑한 분위기에서 커피를 즐기기 좋은 곳입니다.",
  },

  // 서초구 카페들
  {
    cafe_id: "20",
    name: "스타벅스 서초점",
    address: "서울특별시 서초구 서초대로 74길 11",
    latitude: 37.4947,
    longitude: 127.0276,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.0,
    created_at: "2024-01-20",
    description:
      "서초구의 비즈니스 중심가에 위치한 스타벅스로, 직장인들의 업무 회의 공간으로 인기가 높습니다.",
  },
  {
    cafe_id: "21",
    name: "투썸플레이스 방배점",
    address: "서울특별시 서초구 방배로 200",
    latitude: 37.4837,
    longitude: 126.9974,
    open_hours: "08:00 - 23:00",
    avg_rating: 4.4,
    created_at: "2024-01-21",
    description:
      "방배동의 주거지역에 위치한 투썸플레이스로, 지역 주민들이 자주 찾는 편안한 공간입니다.",
  },
  {
    cafe_id: "22",
    name: "이디야커피 서초점",
    address: "서울특별시 서초구 서초중앙로 176",
    latitude: 37.5019,
    longitude: 127.0259,
    open_hours: "06:00 - 23:00",
    avg_rating: 4.2,
    created_at: "2024-01-22",
    description:
      "서초역 근처의 이디야커피로, 합리적인 가격의 커피와 디저트를 제공합니다.",
  },

  // 동작구 카페들
  {
    cafe_id: "23",
    name: "스타벅스 사당점",
    address: "서울특별시 동작구 사당로 200",
    latitude: 37.4769,
    longitude: 126.9819,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.1,
    created_at: "2024-01-23",
    description:
      "사당역 근처의 스타벅스로, 대학가와 가까워 학생들이 많이 찾는 곳입니다.",
  },
  {
    cafe_id: "24",
    name: "커피빈 노량진점",
    address: "서울특별시 동작구 노량진로 200",
    latitude: 37.5138,
    longitude: 126.9405,
    open_hours: "07:30 - 22:30",
    avg_rating: 4.3,
    created_at: "2024-01-24",
    description:
      "노량진의 번화가에 위치한 커피빈으로, 쇼핑과 휴식을 동시에 즐길 수 있는 곳입니다.",
  },

  // 관악구 카페들
  {
    cafe_id: "25",
    name: "투썸플레이스 신림점",
    address: "서울특별시 관악구 신림로 200",
    latitude: 37.4842,
    longitude: 126.9295,
    open_hours: "08:00 - 23:00",
    avg_rating: 4.0,
    created_at: "2024-01-25",
    description:
      "신림역 근처의 투썸플레이스로, 대학가와 가까워 학생들이 자주 이용하는 곳입니다.",
  },
  {
    cafe_id: "26",
    name: "스타벅스 서울대점",
    address: "서울특별시 관악구 관악로 1",
    latitude: 37.4596,
    longitude: 126.9513,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.2,
    created_at: "2024-01-26",
    description:
      "서울대학교 근처의 스타벅스로, 학생들과 교수진들이 많이 찾는 학술적인 분위기의 공간입니다.",
  },
  {
    cafe_id: "27",
    name: "이디야커피 봉천점",
    address: "서울특별시 관악구 봉천로 200",
    latitude: 37.4825,
    longitude: 126.9419,
    open_hours: "06:00 - 23:00",
    avg_rating: 4.1,
    created_at: "2024-01-27",
    description:
      "봉천동의 주거지역에 위치한 이디야커피로, 지역 주민들에게 사랑받는 아늑한 공간입니다.",
  },

  // 금천구 카페들
  {
    cafe_id: "28",
    name: "스타벅스 가산점",
    address: "서울특별시 금천구 가산디지털1로 200",
    latitude: 37.4819,
    longitude: 126.8827,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.0,
    created_at: "2024-01-28",
    description:
      "가산디지털단지의 스타벅스로, IT 업계 종사자들이 많이 찾는 현대적인 공간입니다.",
  },
  {
    cafe_id: "29",
    name: "커피빈 독산점",
    address: "서울특별시 금천구 독산로 200",
    latitude: 37.4669,
    longitude: 126.8974,
    open_hours: "07:30 - 22:30",
    avg_rating: 4.2,
    created_at: "2024-01-29",
    description:
      "독산동의 조용한 거리에 위치한 커피빈으로, 휴식하기 좋은 분위기를 제공합니다.",
  },

  // 구로구 카페들
  {
    cafe_id: "30",
    name: "투썸플레이스 구로점",
    address: "서울특별시 구로구 구로중앙로 200",
    latitude: 37.5034,
    longitude: 126.8819,
    open_hours: "08:00 - 23:00",
    avg_rating: 4.1,
    created_at: "2024-01-30",
    description:
      "구로역 근처의 투썸플레이스로, 비즈니스 지구의 활기찬 분위기를 느낄 수 있습니다.",
  },
  {
    cafe_id: "31",
    name: "스타벅스 신도림점",
    address: "서울특별시 구로구 신도림로 200",
    latitude: 37.5089,
    longitude: 126.8919,
    open_hours: "07:00 - 22:00",
    avg_rating: 4.3,
    created_at: "2024-01-31",
    description:
      "신도림역 근처의 스타벅스로, 지하철 환승객들이 많이 이용하는 편리한 위치에 있습니다.",
  },
  {
    cafe_id: "32",
    name: "이디야커피 가리봉점",
    address: "서울특별시 구로구 가리봉로 200",
    latitude: 37.4947,
    longitude: 126.8719,
    open_hours: "06:00 - 23:00",
    avg_rating: 4.0,
    created_at: "2024-02-01",
    description:
      "가리봉동의 주거지역에 위치한 이디야커피로, 지역 주민들에게 친숙한 공간입니다.",
  },
];
