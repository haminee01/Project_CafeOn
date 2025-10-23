// 1:1 채팅에서 상대방 ID와 채팅방 ID 매핑을 관리하는 유틸리티

// 상대방 ID -> 채팅방 ID 매핑
const counterpartToRoom = new Map<string, number>();

// 채팅방 ID -> 상대방 ID 매핑 (역방향 조회용)
const roomToCounterpart = new Map<number, string>();

/**
 * 상대방 ID와 채팅방 ID 매핑을 저장합니다.
 * @param counterpartId 상대방 ID
 * @param roomId 채팅방 ID
 */
export function setDmChatMapping(counterpartId: string, roomId: number): void {
  console.log(`=== 1:1 채팅 매핑 저장 시작 ===`, {
    counterpartId,
    roomId,
    저장전매핑크기: counterpartToRoom.size,
    저장전매핑내용: Object.fromEntries(counterpartToRoom),
  });

  // roomId가 1인 경우 저장하지 않음 (잘못된 매핑 방지)
  if (roomId === 1) {
    console.error("❌ 잘못된 roomId(1) 저장 시도 차단!", {
      counterpartId,
      roomId,
    });
    return;
  }

  counterpartToRoom.set(counterpartId, roomId);
  roomToCounterpart.set(roomId, counterpartId);

  console.log(`=== 1:1 채팅 매핑 저장 완료 ===`, {
    counterpartId,
    roomId,
    저장후매핑크기: counterpartToRoom.size,
    저장후매핑내용: Object.fromEntries(counterpartToRoom),
    저장확인: counterpartToRoom.get(counterpartId) === roomId,
  });
}

/**
 * 상대방 ID로 채팅방 ID를 조회합니다.
 * @param counterpartId 상대방 ID
 * @returns 채팅방 ID 또는 undefined
 */
export function getRoomIdByCounterpart(
  counterpartId: string
): number | undefined {
  const roomId = counterpartToRoom.get(counterpartId);
  console.log(`=== 상대방 ID로 채팅방 ID 조회 ===`, {
    counterpartId,
    roomId,
    매핑존재: roomId !== undefined,
    전체매핑크기: counterpartToRoom.size,
    전체매핑내용: Object.fromEntries(counterpartToRoom),
  });
  return roomId;
}

/**
 * 채팅방 ID로 상대방 ID를 조회합니다.
 * @param roomId 채팅방 ID
 * @returns 상대방 ID 또는 undefined
 */
export function getCounterpartByRoom(roomId: number): string | undefined {
  return roomToCounterpart.get(roomId);
}

/**
 * 상대방 ID와 채팅방 ID 매핑을 제거합니다.
 * @param counterpartId 상대방 ID
 */
export function removeDmChatMapping(counterpartId: string): void {
  const roomId = counterpartToRoom.get(counterpartId);
  if (roomId !== undefined) {
    counterpartToRoom.delete(counterpartId);
    roomToCounterpart.delete(roomId);
    console.log(`1:1 채팅 매핑 제거: ${counterpartId} -> ${roomId}`);
  }
}

/**
 * 모든 1:1 채팅 매핑을 디버그 출력합니다.
 */
export function debugDmMappings(): void {
  console.log("=== 현재 1:1 채팅 매핑 상태 ===");
  console.log("상대방 -> 채팅방:", Object.fromEntries(counterpartToRoom));
  console.log("채팅방 -> 상대방:", Object.fromEntries(roomToCounterpart));
  console.log("총 매핑 수:", counterpartToRoom.size);
}

/**
 * 모든 1:1 채팅 매핑을 초기화합니다.
 */
export function clearAllDmMappings(): void {
  console.log("=== 모든 1:1 채팅 매핑 초기화 ===");
  counterpartToRoom.clear();
  roomToCounterpart.clear();
  console.log("초기화 완료, 총 매핑 수:", counterpartToRoom.size);
}

/**
 * 잘못된 매핑(roomId가 1인 경우)을 모두 제거합니다.
 */
export function removeInvalidMappings(): void {
  console.log("=== 잘못된 매핑 제거 시작 ===");
  const invalidCounterparts: string[] = [];

  // roomId가 1인 매핑 찾기
  counterpartToRoom.forEach((roomId, counterpartId) => {
    if (roomId === 1) {
      invalidCounterparts.push(counterpartId);
    }
  });

  // 잘못된 매핑 제거
  invalidCounterparts.forEach((counterpartId) => {
    removeDmChatMapping(counterpartId);
  });

  console.log(`잘못된 매핑 ${invalidCounterparts.length}개 제거 완료`);
}
