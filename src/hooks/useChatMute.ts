import { useCallback } from "react";
import { toggleChatMute } from "@/api/chat";
import { useChatPreferencesStore } from "@/stores/chatPreferencesStore";

interface UseChatMuteProps {
  roomId: string | null;
  isMuted: boolean;
  isCafeChat?: boolean; // true면 카페 채팅, false면 DM 채팅
  onMutedChange: (muted: boolean) => void;
}

interface UseChatMuteReturn {
  toggleMute: () => Promise<void>;
}

/**
 * 채팅 알림 설정 관리 Hook
 * 단일 책임: 알림 on/off 토글
 */
export const useChatMute = ({
  roomId,
  isMuted,
  isCafeChat = false,
  onMutedChange,
}: UseChatMuteProps): UseChatMuteReturn => {
  const getCafeMutePref = useChatPreferencesStore((state) => state.getCafeMute);
  const setCafeMutePref = useChatPreferencesStore((state) => state.setCafeMute);
  const getDmMutePref = useChatPreferencesStore((state) => state.getDmMute);
  const setDmMutePref = useChatPreferencesStore((state) => state.setDmMute);

  // 채팅방 알림 토글
  const toggleMute = useCallback(async () => {
    if (!roomId) return;

    try {
      const newMutedState = !isMuted;

      // 서버에 muted 값 업데이트
      await toggleChatMute(roomId, newMutedState);

      // 로컬 상태 업데이트
      onMutedChange(newMutedState);

      // 로컬 스토리지에 저장
      if (isCafeChat) {
        setCafeMutePref(roomId, newMutedState);
      } else {
        setDmMutePref(roomId, newMutedState);
      }
    } catch (err) {
      console.error("채팅방 알림 설정 실패:", err);
      // 에러가 발생해도 로컬 상태는 업데이트
      const newMutedState = !isMuted;
      onMutedChange(newMutedState);
      if (isCafeChat) {
        setCafeMutePref(roomId, newMutedState);
      } else {
        setDmMutePref(roomId, newMutedState);
      }
    }
  }, [
    roomId,
    isMuted,
    isCafeChat,
    onMutedChange,
    setCafeMutePref,
    setDmMutePref,
  ]);

  return {
    toggleMute,
  };
};
