import { useCallback } from "react";
import { getChatParticipants, ChatParticipant } from "@/api/chat";
import { Participant } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStore } from "@/stores/authStore";
import { useChatPreferencesStore } from "@/stores/chatPreferencesStore";

interface UseChatParticipantsProps {
  roomId: string | null;
  isCafeChat?: boolean; // true면 카페 채팅, false면 DM 채팅
  onParticipantsChange: (
    updater: Participant[] | ((prev: Participant[]) => Participant[])
  ) => void;
  onMutedChange?: (muted: boolean) => void;
}

interface UseChatParticipantsReturn {
  refreshParticipants: (targetRoomId?: string) => Promise<void>;
}

/**
 * 채팅 참여자 관리 Hook
 * 단일 책임: 참여자 목록 조회 및 관리
 */
export const useChatParticipants = ({
  roomId,
  isCafeChat = false,
  onParticipantsChange,
  onMutedChange,
}: UseChatParticipantsProps): UseChatParticipantsReturn => {
  const { user } = useAuth();
  const getCafeMutePref = useChatPreferencesStore((state) => state.getCafeMute);
  const getDmMutePref = useChatPreferencesStore((state) => state.getDmMute);

  // 참여자 목록 새로고침
  const refreshParticipants = useCallback(
    async (targetRoomId?: string) => {
      const useRoomId = targetRoomId || roomId;
      if (!useRoomId) {
        return;
      }

      try {
        const response: ChatParticipant[] = await getChatParticipants(
          useRoomId
        );

        // 현재 사용자 username 가져오기
        const storedUsername =
          useAuthStore.getState().user?.nickname ||
          useAuthStore.getState().user?.username ||
          null;

        const currentUsername = user?.username || storedUsername;

        let convertedParticipants: Participant[];

        if (isCafeChat) {
          // 카페 채팅: "나 (nickname)" 형태 처리
          convertedParticipants = response
            .map((participant) => {
              // "나 (nickname)" 형태에서 순수한 닉네임만 추출
              let cleanNickname = participant.nickname;
              if (cleanNickname.startsWith("나 (")) {
                cleanNickname = cleanNickname
                  .replace("나 (", "")
                  .replace(")", "");
              }

              // 서버에서 받은 닉네임을 그대로 사용하고, 내 계정이면 (나) 표기 추가
              const isMe = participant.me === true;
              const finalName = isMe ? `${cleanNickname} (나)` : cleanNickname;

              return {
                id: participant.userId,
                name: finalName,
                isMe: isMe,
              } as Participant & { isMe: boolean };
            })
            .sort((a, b) => {
              // 현재 사용자를 맨 위로 정렬
              if ((a as any).isMe) return -1;
              if ((b as any).isMe) return 1;
              return 0;
            });

          // isMe 속성 제거하고 Participant 배열로 변환
          convertedParticipants = convertedParticipants.map((p) => {
            const { isMe, ...rest } = p as any;
            return rest as Participant;
          });
        } else {
          // DM 채팅: 순수한 닉네임만 사용
          convertedParticipants = response.map((p: ChatParticipant) => ({
            id: p.userId,
            name: p.nickname,
          }));
        }

        onParticipantsChange(convertedParticipants);

        // 현재 사용자 찾기 및 알림 상태 설정
        const currentUser = response.find((p) => p.me === true);
        if (currentUser && onMutedChange) {
          const mutedState = isCafeChat
            ? getCafeMutePref(useRoomId)
            : getDmMutePref(useRoomId);
          onMutedChange(mutedState);
        }
      } catch (err) {
        console.error("참여자 목록 조회 실패:", err);
        onParticipantsChange([]);
      }
    },
    [
      roomId,
      isCafeChat,
      user?.username,
      onParticipantsChange,
      onMutedChange,
      getCafeMutePref,
      getDmMutePref,
    ]
  );

  return {
    refreshParticipants,
  };
};
