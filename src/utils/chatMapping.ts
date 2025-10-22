// 카페 ID와 채팅방 ID 매핑을 관리하는 유틸리티

// 카페 ID -> 채팅방 ID 매핑
const cafeToRoom = new Map<number, number>();

// 채팅방 ID -> 카페 ID 매핑 (역방향 조회용)
const roomToCafe = new Map<number, number>();

/**
 * 카페 ID와 채팅방 ID 매핑을 저장합니다.
 * @param cafeId 카페 ID
 * @param roomId 채팅방 ID
 */
export function setChatMapping(cafeId: number, roomId: number): void {
  console.log(`=== 채팅방 매핑 저장 시작 ===`, {
    cafeId,
    roomId,
    저장전매핑크기: cafeToRoom.size,
    저장전매핑내용: Object.fromEntries(cafeToRoom),
  });

  cafeToRoom.set(cafeId, roomId);
  roomToCafe.set(roomId, cafeId);

  console.log(`=== 채팅방 매핑 저장 완료 ===`, {
    cafeId,
    roomId,
    저장후매핑크기: cafeToRoom.size,
    저장후매핑내용: Object.fromEntries(cafeToRoom),
    저장확인: cafeToRoom.get(cafeId) === roomId,
  });
}

/**
 * 카페 ID로 채팅방 ID를 조회합니다.
 * @param cafeId 카페 ID
 * @returns 채팅방 ID 또는 undefined
 */
export function getRoomIdByCafe(cafeId: number): number | undefined {
  const roomId = cafeToRoom.get(cafeId);
  console.log(`=== 카페 ID로 채팅방 ID 조회 ===`, {
    cafeId,
    roomId,
    매핑존재: roomId !== undefined,
    전체매핑크기: cafeToRoom.size,
    전체매핑내용: Object.fromEntries(cafeToRoom),
  });
  return roomId;
}

/**
 * 채팅방 ID로 카페 ID를 조회합니다.
 * @param roomId 채팅방 ID
 * @returns 카페 ID 또는 undefined
 */
export function getCafeIdByRoom(roomId: number): number | undefined {
  return roomToCafe.get(roomId);
}

/**
 * 카페 ID와 채팅방 ID 매핑을 제거합니다.
 * @param cafeId 카페 ID
 */
export function removeChatMapping(cafeId: number): void {
  const roomId = cafeToRoom.get(cafeId);
  if (roomId !== undefined) {
    cafeToRoom.delete(cafeId);
    roomToCafe.delete(roomId);
    console.log(`채팅방 매핑 제거: ${cafeId} -> ${roomId}`);
  }
}

/**
 * 모든 매핑을 디버그 출력합니다.
 */
export function debugMappings(): void {
  console.log("=== 현재 채팅방 매핑 상태 ===");
  console.log("카페 -> 채팅방:", Object.fromEntries(cafeToRoom));
  console.log("채팅방 -> 카페:", Object.fromEntries(roomToCafe));
  console.log("총 매핑 수:", cafeToRoom.size);
}

/**
 * 모달에서 사용할 카페 ID 조회 함수
 * @param roomId 채팅방 ID
 * @returns 카페 ID 또는 undefined
 */
export function getCafeIdByRoomForModal(roomId: number): number | undefined {
  return getCafeIdByRoom(roomId);
}
