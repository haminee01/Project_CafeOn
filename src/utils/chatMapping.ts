// 카페 ID와 채팅방 ID 매핑을 관리하는 유틸리티

const cafeToRoom = new Map<number, number>();
const roomToCafe = new Map<number, number>();

export function setChatMapping(cafeId: number, roomId: number): void {
  cafeToRoom.set(cafeId, roomId);
  roomToCafe.set(roomId, cafeId);
}

export function getRoomIdByCafe(cafeId: number): number | undefined {
  const roomId = cafeToRoom.get(cafeId);
  return roomId;
}

export function getCafeIdByRoom(roomId: number): number | undefined {
  return roomToCafe.get(roomId);
}

export function removeChatMapping(cafeId: number): void {
  const roomId = cafeToRoom.get(cafeId);
  if (roomId !== undefined) {
    cafeToRoom.delete(cafeId);
    roomToCafe.delete(roomId);
  }
}

export function getCafeIdByRoomForModal(roomId: number): number | undefined {
  return getCafeIdByRoom(roomId);
}
