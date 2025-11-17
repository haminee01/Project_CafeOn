// 1:1 채팅에서 상대방 ID와 채팅방 ID 매핑을 관리하는 유틸리티

const counterpartToRoom = new Map<string, number>();
const roomToCounterpart = new Map<number, string>();

export function setDmChatMapping(counterpartId: string, roomId: number): void {
  // roomId가 1인 경우 저장하지 않음 (잘못된 매핑 방지)
  if (roomId === 1) {
    console.error("잘못된 roomId(1) 저장 시도 차단!", {
      counterpartId,
      roomId,
    });
    return;
  }

  counterpartToRoom.set(counterpartId, roomId);
  roomToCounterpart.set(roomId, counterpartId);
}

export function getRoomIdByCounterpart(
  counterpartId: string
): number | undefined {
  const roomId = counterpartToRoom.get(counterpartId);
  return roomId;
}

export function getCounterpartByRoom(roomId: number): string | undefined {
  return roomToCounterpart.get(roomId);
}

export function removeDmChatMapping(counterpartId: string): void {
  const roomId = counterpartToRoom.get(counterpartId);
  if (roomId !== undefined) {
    counterpartToRoom.delete(counterpartId);
    roomToCounterpart.delete(roomId);
  }
}

export function debugDmMappings(): void {}

export function clearAllDmMappings(): void {
  counterpartToRoom.clear();
  roomToCounterpart.clear();
}

export function removeInvalidMappings(): void {
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
}
