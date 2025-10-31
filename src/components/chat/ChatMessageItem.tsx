import React, { useEffect } from "react";
import ProfileIcon from "./ProfileIcon";
import { ChatMessage, ProfileClickHandler } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessageItemProps {
  message: ChatMessage;
  onProfileClick: ProfileClickHandler;
  unreadCount?: number;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onProfileClick,
  unreadCount = 0,
}) => {
  // useAuth에서 현재 사용자 정보 가져오기
  const { user } = useAuth();
  const currentUserNickname = user?.username || null;

  // 디버깅을 위한 로그 추가 (주석 처리)
  // console.log("ChatMessageItem 렌더링:", {
  //   messageId: message.id,
  //   senderName: message.senderName,
  //   content: message.content,
  //   isMyMessage: message.isMyMessage,
  //   messageType: message.messageType,
  //   currentUserNickname,
  // });

  // 현재 사용자와 메시지 발신자가 같은지 판단
  const isMyMessage =
    message.isMyMessage ||
    (currentUserNickname && message.senderName === currentUserNickname);
  const displayName = isMyMessage
    ? `${message.senderName} (나)`
    : message.senderName;

  // console.log("메시지 소유자 최종 판단:", {
  //   senderName: message.senderName,
  //   currentUserNickname,
  //   isMyMessage,
  //   displayName,
  // });

  // 읽지 않은 사람 수가 있을 때만 로그 출력 (디버깅용)
  useEffect(() => {
    if (unreadCount > 0) {
      // console.log("읽지 않은 메시지:", {
      //   messageId: message.id,
      //   content: message.content,
      //   unreadCount,
      //   isMyMessage,
      // });
    }
  }, [message.id, message.content, unreadCount, isMyMessage]);

  // 입장/퇴장 안내 메시지 처리 (messageType과 무관하게 content 패턴으로 처리)
  const isJoinOrLeave =
    message.content.includes("님이 입장했습니다.") ||
    message.content.includes("님이 퇴장했습니다.");
  if (isJoinOrLeave) {
    if (isMyMessage) {
      return (
        <div className="flex justify-end my-2">
          <div className="bg-[#6E4213] text-white text-sm px-3 py-2 rounded-lg max-w-xs rounded-br-none">
            {message.content}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-lg max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      key={message.id}
      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex items-start max-w-xs md:max-w-md ${
          isMyMessage ? "flex-row-reverse space-x-reverse" : "space-x-3"
        }`}
      >
        {/* 프로필 이미지/아이콘 */}
        <div
          className={`cursor-pointer transition duration-150 ${
            isMyMessage ? "ml-2" : "mr-2"
          }`}
          onClick={(event) =>
            onProfileClick(message.senderId, message.senderName, event)
          }
        >
          <ProfileIcon variant={isMyMessage ? "default" : "amber"} />
        </div>

        <div className="flex flex-col">
          {/* 이름 */}
          <span
            className={`text-xs text-gray-500 mb-1 ${
              isMyMessage ? "text-right" : "text-left"
            }`}
          >
            {displayName}
          </span>

          {/* 메시지 내용 */}
          <div
            className={`p-3 rounded-xl shadow-sm ${
              isMyMessage
                ? "bg-[#6E4213] text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
            }`}
          >
            {message.content}
          </div>

          {/* 읽지 않은 사람 수 표시 (읽지 않은 사람이 있을 때만, 내 메시지에도 표시) */}
          {unreadCount > 0 && (
            <div
              className={`flex mt-1 items-center ${
                isMyMessage ? "justify-start" : "justify-end"
              }`}
            >
              <span className="text-[#6E4213] text-xs font-semibold">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
