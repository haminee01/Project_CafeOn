import React from "react";
import ProfileIcon from "./ProfileIcon";
import { ChatMessage, ProfileClickHandler } from "@/types/chat";

interface ChatMessageItemProps {
  message: ChatMessage;
  onProfileClick: ProfileClickHandler;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onProfileClick,
}) => {
  return (
    <div
      key={message.id}
      className={`flex ${
        message.isMyMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-start max-w-xs md:max-w-md ${
          message.isMyMessage ? "flex-row-reverse space-x-reverse" : "space-x-3"
        }`}
      >
        {/* 프로필 이미지/아이콘 */}
        <div
          className={`cursor-pointer transition duration-150 ${
            message.isMyMessage ? "ml-2" : "mr-2"
          }`}
          onClick={(event) =>
            onProfileClick(message.senderId, message.senderName, event)
          }
        >
          <ProfileIcon variant={message.isMyMessage ? "default" : "amber"} />
        </div>

        <div className="flex flex-col">
          {/* 이름 */}
          <span
            className={`text-xs text-gray-500 mb-1 ${
              message.isMyMessage ? "text-right" : "text-left"
            }`}
          >
            {message.senderName}
          </span>

          {/* 메시지 내용 */}
          <div
            className={`p-3 rounded-xl shadow-sm ${
              message.isMyMessage
                ? "bg-[#6E4213] text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
