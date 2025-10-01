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

  // 영등포구 추가 카페들 (문래 지역)
  {
    cafe_id: "33",
    name: "문래 마이스페이스",
    address: "서울특별시 영등포구 도림로141길 15",
    latitude: 37.5172,
    longitude: 126.8953,
    open_hours: "10:00 - 21:30",
    avg_rating: 4.6,
    created_at: "2024-02-02",
    description:
      "소중한 사람을 위한 선물 디저트. 정성과 시간을 다한 디저트 천국, 마이스페이스 입니다! 문래역 1번 출구에서 도보 6분, 신도림역 6번 출구에서 도보 7분 거리에 위치해 있습니다.",
  },
  {
    cafe_id: "34",
    name: "문래 디저트 카페",
    address: "서울특별시 영등포구 도림로 472",
    latitude: 37.5165,
    longitude: 126.8947,
    open_hours: "09:00 - 22:00",
    avg_rating: 4.4,
    created_at: "2024-02-03",
    description:
      "문래 지역의 히든 디저트 카페로, 특별한 케이크와 음료를 제공합니다. 조용하고 아늑한 분위기에서 휴식을 취할 수 있어요.",
  },
  {
    cafe_id: "35",
    name: "문래 브런치 카페",
    address: "서울특별시 영등포구 문래동3가 55-24",
    latitude: 37.5185,
    longitude: 126.8965,
    open_hours: "08:00 - 20:00",
    avg_rating: 4.3,
    created_at: "2024-02-04",
    description:
      "브런치와 디저트가 맛있는 문래의 인기 카페입니다. 신선한 재료로 만든 샐러드와 파스타도 함께 즐길 수 있어요.",
  },

  // 유사 카페들 (데이트/로맨틱 카페)
  {
    cafe_id: "36",
    name: "로맨틱한 데이트 카페",
    address: "서울특별시 강남구 테헤란로 123",
    latitude: 37.5665,
    longitude: 127.0333,
    open_hours: "10:00 - 23:00",
    avg_rating: 4.5,
    created_at: "2024-02-05",
    description:
      "커플들이 좋아하는 아늑한 공간들을 모았습니다. 특별한 날을 위한 완벽한 데이트 카페입니다.",
  },
  {
    cafe_id: "37",
    name: "힐링 카페 스페이스",
    address: "서울특별시 마포구 홍익로 3",
    latitude: 37.5563,
    longitude: 126.9226,
    open_hours: "09:00 - 22:00",
    avg_rating: 4.4,
    created_at: "2024-02-06",
    description:
      "마음의 휴식을 위한 힐링 공간. 자연스러운 인테리어와 편안한 분위기에서 스트레스를 해소해보세요.",
  },
  {
    cafe_id: "38",
    name: "아늑한 북카페",
    address: "서울특별시 서대문구 신촌로 83",
    latitude: 37.5598,
    longitude: 126.942,
    open_hours: "08:00 - 24:00",
    avg_rating: 4.2,
    created_at: "2024-02-07",
    description:
      "책과 커피가 함께하는 특별한 공간. 조용한 분위기에서 독서와 커피를 동시에 즐길 수 있습니다.",
  },
  {
    cafe_id: "39",
    name: "포토스팟 카페",
    address: "서울특별시 종로구 인사동길 12",
    latitude: 37.5735,
    longitude: 126.9858,
    open_hours: "10:00 - 21:00",
    avg_rating: 4.6,
    created_at: "2024-02-08",
    description:
      "인스타그램에 올리기 좋은 예쁜 포토스팟들이 가득한 카페입니다. 특별한 순간을 기록해보세요.",
  },

  // 추가 카페들 - 유사 카페 추천용
  {
    cafe_id: "40",
    name: "커피나무 성수점",
    address: "서울특별시 성동구 성수일로 123",
    latitude: 37.5446,
    longitude: 127.0559,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.6,
    created_at: "2024-01-40",
    description:
      "성수동의 트렌디한 카페입니다. 산업풍 인테리어와 맛있는 디저트로 유명해요.",
  },
  {
    cafe_id: "41",
    name: "브런치카페 송리단길",
    address: "서울특별시 용산구 이태원로 789",
    latitude: 37.5347,
    longitude: 126.9947,
    open_hours: "09:00 - 21:00",
    avg_rating: 4.3,
    created_at: "2024-01-41",
    description:
      "송리단길의 감성적인 브런치 카페입니다. 예쁜 플레이트와 맛있는 커피를 즐겨보세요.",
  },
  {
    cafe_id: "42",
    name: "로컬커피 연남동점",
    address: "서울특별시 마포구 연남동 456-78",
    latitude: 37.5594,
    longitude: 126.9223,
    open_hours: "07:30 - 22:30",
    avg_rating: 4.5,
    created_at: "2024-01-42",
    description:
      "연남동의 힙한 로컬 카페입니다. 로스팅한 원두로 만든 신선한 커피를 맛보세요.",
  },
  {
    cafe_id: "43",
    name: "데이트카페 압구정점",
    address: "서울특별시 강남구 압구정로 321",
    latitude: 37.5275,
    longitude: 127.0286,
    open_hours: "10:00 - 23:00",
    avg_rating: 4.4,
    created_at: "2024-01-43",
    description:
      "압구정의 럭셔리한 데이트 카페입니다. 프리미엄 디저트와 분위기 있는 인테리어를 자랑해요.",
  },
  {
    cafe_id: "44",
    name: "스터디카페 강남점",
    address: "서울특별시 강남구 테헤란로 654",
    latitude: 37.4986,
    longitude: 127.0286,
    open_hours: "06:00 - 24:00",
    avg_rating: 4.2,
    created_at: "2024-01-44",
    description:
      "24시간 운영하는 스터디 카페입니다. 조용한 환경에서 집중해서 공부할 수 있어요.",
  },
  {
    cafe_id: "45",
    name: "힐링카페 한강점",
    address: "서울특별시 영등포구 여의대로 987",
    latitude: 37.5299,
    longitude: 126.9133,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.7,
    created_at: "2024-01-45",
    description:
      "한강을 바라보며 커피를 마실 수 있는 힐링 카페입니다. 자연 속에서 휴식을 취해보세요.",
  },
  {
    cafe_id: "46",
    name: "아트카페 삼청동점",
    address: "서울특별시 종로구 삼청로 147",
    latitude: 37.5838,
    longitude: 126.9856,
    open_hours: "09:00 - 21:00",
    avg_rating: 4.3,
    created_at: "2024-01-46",
    description:
      "삼청동의 예술적인 카페입니다. 갤러리와 카페가 결합된 특별한 공간이에요.",
  },
  {
    cafe_id: "47",
    name: "포토카페 이태원점",
    address: "서울특별시 용산구 이태원로 234",
    latitude: 37.5347,
    longitude: 126.9947,
    open_hours: "10:00 - 23:00",
    avg_rating: 4.6,
    created_at: "2024-01-47",
    description:
      "이태원의 인스타그램 명소 카페입니다. 예쁜 포토존과 맛있는 디저트를 즐겨보세요.",
  },
  {
    cafe_id: "48",
    name: "북카페 대학로점",
    address: "서울특별시 종로구 대학로 89",
    latitude: 37.5826,
    longitude: 126.9998,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.4,
    created_at: "2024-01-48",
    description:
      "대학로의 조용한 북카페입니다. 다양한 도서와 함께하는 여유로운 시간을 보내세요.",
  },
  {
    cafe_id: "49",
    name: "브런치카페 청담점",
    address: "서울특별시 강남구 청담동 123-45",
    latitude: 37.5275,
    longitude: 127.0473,
    open_hours: "09:00 - 21:00",
    avg_rating: 4.5,
    created_at: "2024-01-49",
    description:
      "청담동의 세련된 브런치 카페입니다. 건강한 재료로 만든 신선한 메뉴를 제공해요.",
  },
  {
    cafe_id: "50",
    name: "로맨틱카페 남산점",
    address: "서울특별시 중구 남산공원길 67",
    latitude: 37.5512,
    longitude: 126.9882,
    open_hours: "10:00 - 22:00",
    avg_rating: 4.8,
    created_at: "2024-01-50",
    description:
      "남산에서 서울 시내를 바라보며 즐기는 로맨틱한 카페입니다. 데이트 코스로 최고예요.",
  },

  // 추가 카페들 - 캐러셀 테스트용
  {
    cafe_id: "51",
    name: "감성카페 성수점",
    address: "서울특별시 성동구 성수일로 200",
    latitude: 37.5446,
    longitude: 127.0559,
    open_hours: "09:00 - 23:00",
    avg_rating: 4.6,
    created_at: "2024-02-01",
    description:
      "성수동의 감성적인 카페입니다. 인테리어가 예쁘고 커피도 맛있어요. 포토스팟으로도 유명해요.",
  },
  {
    cafe_id: "52",
    name: "브런치카페 홍대점",
    address: "서울특별시 마포구 와우산로 150",
    latitude: 37.5563,
    longitude: 126.9226,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.4,
    created_at: "2024-02-02",
    description:
      "홍대의 활기찬 분위기를 담은 브런치 카페입니다. 신선한 재료로 만든 샐러드와 파스타가 맛있어요.",
  },
  {
    cafe_id: "53",
    name: "힐링카페 강남점",
    address: "서울특별시 강남구 테헤란로 300",
    latitude: 37.5665,
    longitude: 127.0333,
    open_hours: "07:00 - 24:00",
    avg_rating: 4.5,
    created_at: "2024-02-03",
    description:
      "강남의 바쁜 일상에서 잠시 휴식을 취할 수 있는 힐링 카페입니다. 조용하고 편안한 분위기예요.",
  },
  {
    cafe_id: "54",
    name: "북카페 종로점",
    address: "서울특별시 종로구 인사동길 50",
    latitude: 37.5735,
    longitude: 126.9858,
    open_hours: "09:00 - 21:00",
    avg_rating: 4.3,
    created_at: "2024-02-04",
    description:
      "전통과 현대가 어우러진 종로의 북카페입니다. 다양한 도서와 함께하는 여유로운 시간을 보내세요.",
  },
  {
    cafe_id: "55",
    name: "데이트카페 이태원점",
    address: "서울특별시 용산구 이태원로 100",
    latitude: 37.5347,
    longitude: 126.9947,
    open_hours: "10:00 - 24:00",
    avg_rating: 4.7,
    created_at: "2024-02-05",
    description:
      "이태원의 국제적인 분위기를 담은 데이트 카페입니다. 특별한 날을 위한 완벽한 공간이에요.",
  },
  {
    cafe_id: "56",
    name: "스터디카페 신촌점",
    address: "서울특별시 서대문구 신촌로 100",
    latitude: 37.5598,
    longitude: 126.942,
    open_hours: "06:00 - 24:00",
    avg_rating: 4.2,
    created_at: "2024-02-06",
    description:
      "신촌 대학가의 스터디 카페입니다. 조용한 환경에서 집중해서 공부할 수 있어요.",
  },
  {
    cafe_id: "57",
    name: "아트카페 압구정점",
    address: "서울특별시 강남구 압구정로 200",
    latitude: 37.5275,
    longitude: 127.0286,
    open_hours: "09:00 - 22:00",
    avg_rating: 4.6,
    created_at: "2024-02-07",
    description:
      "압구정의 세련된 아트 카페입니다. 갤러리와 카페가 결합된 특별한 공간이에요.",
  },
  {
    cafe_id: "58",
    name: "포토카페 강남점",
    address: "서울특별시 강남구 강남대로 500",
    latitude: 37.4986,
    longitude: 127.0286,
    open_hours: "10:00 - 23:00",
    avg_rating: 4.8,
    created_at: "2024-02-08",
    description:
      "강남의 인스타그램 명소 카페입니다. 예쁜 포토존과 맛있는 디저트를 즐겨보세요.",
  },
  {
    cafe_id: "59",
    name: "로맨틱카페 한강점",
    address: "서울특별시 영등포구 여의대로 200",
    latitude: 37.5299,
    longitude: 126.9133,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.9,
    created_at: "2024-02-09",
    description:
      "한강을 바라보며 즐기는 로맨틱한 카페입니다. 일몰 시간이 특히 아름다워요.",
  },
  {
    cafe_id: "60",
    name: "힐링카페 삼청동점",
    address: "서울특별시 종로구 삼청로 100",
    latitude: 37.5838,
    longitude: 126.9856,
    open_hours: "09:00 - 21:00",
    avg_rating: 4.4,
    created_at: "2024-02-10",
    description:
      "삼청동의 조용한 힐링 카페입니다. 전통 한옥과 현대적인 인테리어가 조화롭게 어우러져요.",
  },
  {
    cafe_id: "61",
    name: "브런치카페 청담점",
    address: "서울특별시 강남구 청담동 200",
    latitude: 37.5275,
    longitude: 127.0473,
    open_hours: "08:00 - 20:00",
    avg_rating: 4.5,
    created_at: "2024-02-11",
    description:
      "청담동의 세련된 브런치 카페입니다. 건강한 재료로 만든 신선한 메뉴를 제공해요.",
  },
  {
    cafe_id: "62",
    name: "북카페 대학로점",
    address: "서울특별시 종로구 대학로 200",
    latitude: 37.5826,
    longitude: 126.9998,
    open_hours: "08:00 - 22:00",
    avg_rating: 4.3,
    created_at: "2024-02-12",
    description:
      "대학로의 조용한 북카페입니다. 다양한 도서와 함께하는 여유로운 시간을 보내세요.",
  },
  {
    cafe_id: "63",
    name: "데이트카페 송파점",
    address: "서울특별시 송파구 올림픽로 400",
    latitude: 37.5133,
    longitude: 127.1028,
    open_hours: "10:00 - 23:00",
    avg_rating: 4.6,
    created_at: "2024-02-13",
    description:
      "송파의 로맨틱한 데이트 카페입니다. 특별한 날을 위한 완벽한 공간이에요.",
  },
  {
    cafe_id: "64",
    name: "스터디카페 마포점",
    address: "서울특별시 마포구 홍익로 100",
    latitude: 37.5563,
    longitude: 126.9226,
    open_hours: "06:00 - 24:00",
    avg_rating: 4.1,
    created_at: "2024-02-14",
    description:
      "마포의 조용한 스터디 카페입니다. 집중해서 공부하기 좋은 환경을 제공해요.",
  },
  {
    cafe_id: "65",
    name: "아트카페 용산점",
    address: "서울특별시 용산구 한강대로 300",
    latitude: 37.5316,
    longitude: 126.9787,
    open_hours: "09:00 - 22:00",
    avg_rating: 4.4,
    created_at: "2024-02-15",
    description:
      "용산의 예술적인 카페입니다. 갤러리와 카페가 결합된 특별한 공간이에요.",
  },
];
