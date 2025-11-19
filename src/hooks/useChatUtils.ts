/**
 * 채팅 관련 유틸리티 함수들
 * Run Grouping 및 메시지 타입 체크 등
 */

// 분 단위 시간 키 생성 (YYYY-MM-DD HH:MM)
export const minuteKeyOf = (createdAt: string): string | null => {
  try {
    const d = new Date(createdAt);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const MM = String(d.getMinutes()).padStart(2, "0");
    return `${yy}-${mm}-${dd} ${HH}:${MM}`;
  } catch {
    return null;
  }
};

// 시스템 메시지 타입 체크
export const isSystemType = (messageType: string): boolean => {
  const type = (messageType || "").toString().toUpperCase();
  return type === "SYSTEM" || type.startsWith("SYSTEM_");
};

// Run 키 생성 (senderId|minuteKey)
export const runKeyOf = (msg: any): string | null => {
  if (isSystemType(msg.messageType)) return null;
  const sid = msg.senderId ? String(msg.senderId).trim() : "";
  const mk = minuteKeyOf(msg.createdAt);
  if (!sid || !mk) return null;
  return `${sid}|${mk}`;
};
