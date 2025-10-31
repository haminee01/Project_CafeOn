import React from "react";
import ProfileIcon from "./ProfileIcon";
import { ChatSidebarProps } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  participants,
  currentUserId,
  isNotificationOn,
  onToggleNotification,
  onClose,
  onProfileClick,
  onLeave,
  title = "참여자 목록",
  subtitle,
}) => {
  // 현재 사용자 정보 가져오기 (username으로 비교)
  const { user } = useAuth();
  const currentUserNickname = user?.username || null;
  const effectiveCurrentUserId = currentUserId || (user as any)?.id || null;

  // 로컬 스토리지에 저장된 사용자명도 후보로 사용 (브랜치/새로고침 간 불일치 대비)
  let storedUsername: string | null = null;
  try {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("userInfo") : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      storedUsername = parsed?.username || null;
    }
  } catch {}

  // 토큰에서도 닉네임 추출
  let tokenNickname: string | null = null;
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      tokenNickname = payload?.nickname || payload?.username || null;
    }
  } catch {}

  const candidateMyNames = [
    currentUserNickname,
    storedUsername,
    tokenNickname,
  ].filter(Boolean) as string[];

  // 현재 사용자 ID 후보 (토큰에서도 추출)
  let currentUserIdFromToken: string | null = null;
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserIdFromToken =
        payload?.sub || payload?.userId || payload?.id || null;
    }
  } catch {}

  const candidateMyIds = [
    effectiveCurrentUserId,
    currentUserIdFromToken,
    (user as any)?.id,
  ].filter(Boolean) as string[];
  return (
    <>
      {/* 사이드바 (참여자 목록) 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-20 z-30"
        onClick={onClose}
      />

      {/* 사이드바 본체 */}
      <div
        className={`absolute inset-y-0 right-0 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out z-40`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full border-l border-gray-200">
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-[#999999]">
            <h3 className="text-lg font-bold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 참여자 목록 리스트 */}
          <div className="p-4 flex-1 overflow-y-auto">
            {subtitle && (
              <p className="text-sm font-semibold mb-3 text-gray-600">
                {subtitle} ({participants.length})
              </p>
            )}
            <div className="space-y-3">
              {participants
                .sort((a, b) => {
                  // 현재 사용자를 맨 위로 정렬 (ID 우선, 이름 후보 보조)
                  const aIsMe =
                    (candidateMyIds.length > 0 &&
                      candidateMyIds.some(
                        (id) => String(id) === String(a.id)
                      )) ||
                    (candidateMyNames.length > 0 &&
                      candidateMyNames.some(
                        (name) => (name || "").trim() === (a.name || "").trim()
                      ));
                  const bIsMe =
                    (candidateMyIds.length > 0 &&
                      candidateMyIds.some(
                        (id) => String(id) === String(b.id)
                      )) ||
                    (candidateMyNames.length > 0 &&
                      candidateMyNames.some(
                        (name) => (name || "").trim() === (b.name || "").trim()
                      ));
                  if (aIsMe) return -1;
                  if (bIsMe) return 1;
                  return 0;
                })
                .map((participant) => {
                  // 현재 사용자 여부 판단 (ID 우선, 이름 후보 보조)
                  const isCurrentUser =
                    (candidateMyIds.length > 0 &&
                      candidateMyIds.some(
                        (id) => String(id) === String(participant.id)
                      )) ||
                    (candidateMyNames.length > 0 &&
                      candidateMyNames.some(
                        (name) =>
                          (name || "").trim() ===
                          (participant.name || "").trim()
                      ));

                  // 디버깅 로그
                  if (isCurrentUser) {
                    console.log("ChatSidebar: 현재 사용자 확인", {
                      participantName: participant.name,
                      participantId: participant.id,
                      candidateMyIds,
                      candidateMyNames,
                      isCurrentUser,
                    });
                  }

                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center space-x-3 p-2 rounded-md transition duration-150 ${
                        !isCurrentUser && onProfileClick
                          ? "cursor-pointer hover:bg-gray-100"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (!isCurrentUser && onProfileClick) {
                          onProfileClick(participant, e);
                        }
                      }}
                    >
                      <ProfileIcon variant="default" />
                      <span className="font-medium text-gray-800">
                        {(() => {
                          const alreadyHasMe =
                            participant.name.includes("(나)");
                          if (isCurrentUser && !alreadyHasMe) {
                            return `${participant.name} (나)`;
                          }
                          return participant.name;
                        })()}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="p-4 mt-auto border-t border-[#CDCDCD] flex space-x-2">
            <button
              onClick={onToggleNotification}
              className={`w-full px-4 py-2 rounded-lg shadow-md transition text-sm ${
                isNotificationOn
                  ? "bg-[#8d5e33] text-white hover:bg-[#6E4213]"
                  : "bg-gray-400 text-[#6E4213] hover:bg-gray-500"
              }`}
            >
              {isNotificationOn ? "알림끄기" : "알림켜기"}
            </button>
            {onLeave && (
              <button
                onClick={onLeave}
                className="w-full px-4 py-2 bg-gray-200 text-[#6E4213] rounded-lg shadow-md hover:bg-gray-300 transition text-sm"
              >
                나가기
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
