# 카페 거리 계산 API 스펙

## 요청 정보

### 엔드포인트

```
POST /api/cafes/{cafeId}/distance
```

### 요청 Body

```json
{
  "userLat": 37.5665,
  "userLng": 126.978,
  "cafeId": "33"
}
```

### 응답

```json
{
  "distance": 1500 // 미터 단위
}
```

## 구현 요구사항

1. **카페 좌표 데이터**: 카페의 위도(latitude), 경도(longitude) 정보가 데이터베이스에 저장되어 있어야 함
2. **거리 계산**: Haversine 공식 또는 유사한 지구 곡률을 고려한 거리 계산 알고리즘 사용
3. **응답 단위**: 미터(m) 단위로 반환

## 예시 구현 (Java)

```java
@PostMapping("/api/cafes/{cafeId}/distance")
public ResponseEntity<Map<String, Double>> calculateDistance(
    @PathVariable String cafeId,
    @RequestBody DistanceRequest request) {

    // 1. 카페 좌표 조회
    Cafe cafe = cafeService.findById(cafeId);
    if (cafe == null) {
        return ResponseEntity.notFound().build();
    }

    // 2. 거리 계산 (Haversine 공식)
    double distance = calculateHaversineDistance(
        request.getUserLat(), request.getUserLng(),
        cafe.getLatitude(), cafe.getLongitude()
    );

    Map<String, Double> response = new HashMap<>();
    response.put("distance", distance);

    return ResponseEntity.ok(response);
}

private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
    final int R = 6371; // 지구 반지름 (km)

    double latDistance = Math.toRadians(lat2 - lat1);
    double lonDistance = Math.toRadians(lon2 - lon1);

    double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    double distance = R * c * 1000; // 미터로 변환

    return distance;
}
```

## 프론트엔드 구현 완료

- ✅ 사용자 현재 위치 자동 감지
- ✅ 백엔드 API 호출
- ✅ 거리 정보 UI 표시
- ✅ 로딩 상태 및 에러 처리
- ✅ 길찾기 버튼 제거

## 테스트 방법

1. 카페 상세페이지 접속
2. 위치 접근 권한 허용
3. 거리 정보 표시 확인
4. 콘솔에서 API 요청/응답 로그 확인
