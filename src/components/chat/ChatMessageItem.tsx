import React, { useEffect } from "react";
import ProfileIcon from "./ProfileIcon";
import { ChatMessage, ProfileClickHandler } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessageItemProps {
  message: ChatMessage;
  onProfileClick: ProfileClickHandler;
  unreadCount?: number;
  showTimestamp?: boolean; // Run Grouping: 마지막 메시지만 타임스탬프 표시
  showNickname?: boolean; // Run Grouping: 첫 메시지만 닉네임 표시
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onProfileClick,
  unreadCount = 0,
  showTimestamp = true,
  showNickname = true,
}) => {
  // useAuth에서 현재 사용자 정보 가져오기
  const { user } = useAuth();
  const currentUserNickname = user?.username || null;

  // 현재 사용자와 메시지 발신자가 같은지 판단
  const isMyMessage =
    message.isMyMessage ||
    (currentUserNickname && message.senderName === currentUserNickname);
  const displayName = isMyMessage ? message.senderName : message.senderName;

  // 타임스탬프 포맷팅 함수
  const formatTimestamp = (createdAt?: string): string => {
    if (!createdAt) return "";
    try {
      const date = new Date(createdAt);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? "오후" : "오전";
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${period} ${displayHours}:${displayMinutes}`;
    } catch {
      return "";
    }
  };

  // 실제 표시할 타임스탬프 (timeLabel 우선, 없으면 createdAt 포맷팅)
  const displayTime = message.timeLabel || formatTimestamp(message.createdAt);

  // 시스템 메시지 체크 (messageType이나 content 패턴으로)
  const isSystemMessage =
    (message.messageType &&
      (message.messageType.toUpperCase() === "SYSTEM" ||
        message.messageType.toUpperCase().startsWith("SYSTEM_"))) ||
    message.content.includes("님이 입장했습니다.") ||
    message.content.includes("님이 퇴장했습니다.");

  // 시스템 메시지는 중앙 정렬, 회색 타원형 배경
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      key={message.id}
      className={`flex items-end gap-2 my-1 ${
        isMyMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* 왼쪽 정렬(상대방): 아바타 - 말풍선 - 메타 */}
      {!isMyMessage && (
        <>
          {/* 아바타 (닉네임이 표시되는 메시지에만) */}
          {showNickname ? (
            <div
              className="cursor-pointer transition duration-150 flex-shrink-0"
              onClick={(event) =>
                onProfileClick(message.senderId, message.senderName, event)
              }
            >
              <ProfileIcon variant="amber" />
            </div>
          ) : (
            <div className="w-9 flex-shrink-0" />
          )}

          <div className="flex flex-col max-w-xs">
            {/* 닉네임 */}
            {showNickname && (
              <span className="text-xs text-gray-600 mb-1 ml-1">
                {displayName}
              </span>
            )}

            {/* 말풍선 + 메타 */}
            <div className="flex items-end gap-2">
              {/* 말풍선 */}
              <div>
                {/* 텍스트 메시지 */}
                {message.content && (
                  <div className="bg-white text-gray-800 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-gray-200">
                    {message.content}
                  </div>
                )}

                {/* 이미지 표시 */}
                {message.images && message.images.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {message.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl shadow-sm"
                      >
                        <img
                          src={imageUrl}
                          alt={`채팅 이미지 ${index + 1}`}
                          className="max-w-xs w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 메타 (타임스탬프 + 안읽음 카운트) */}
              {(displayTime || unreadCount > 0) && (
                <div className="flex flex-col items-start gap-1 text-xs">
                  {displayTime && (
                    <span className="text-[#6E4213]">{displayTime}</span>
                  )}
                  {unreadCount > 0 && (
                    <span className="text-[#6E4213] font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 오른쪽 정렬(나): 메타 - 말풍선 - 아바타 */}
      {isMyMessage && (
        <>
          <div className="flex flex-col max-w-xs items-end">
            {/* 닉네임 (내 메시지에는 보통 표시 안 함, 하지만 구조상 포함) */}
            {showNickname && (
              <span className="text-xs text-gray-600 mb-1 mr-1 invisible">
                {displayName}
              </span>
            )}

            {/* 메타 + 말풍선 */}
            <div className="flex items-end gap-2 flex-row-reverse">
              {/* 말풍선 */}
              <div>
                {/* 텍스트 메시지 */}
                {message.content && (
                  <div className="bg-[#6E4213] text-white px-3 py-2 rounded-2xl rounded-br-none shadow-sm">
                    {message.content}
                  </div>
                )}

                {/* 이미지 표시 */}
                {message.images && message.images.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {message.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl shadow-sm"
                      >
                        <img
                          src={imageUrl}
                          alt={`채팅 이미지 ${index + 1}`}
                          className="max-w-xs w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 메타 (타임스탬프 + 안읽음 카운트) */}
              {(displayTime || unreadCount > 0) && (
                <div className="flex flex-col items-end gap-1 text-xs">
                  {unreadCount > 0 && (
                    <span className="text-[#6E4213] font-semibold">
                      {unreadCount}
                    </span>
                  )}
                  {displayTime && (
                    <span className="text-[#6E4213]">{displayTime}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMessageItem;
