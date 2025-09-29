import React from "react";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  onProfileClick: (
    senderId: string,
    senderName: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
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
          className={`w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center cursor-pointer transition duration-150 ${
            message.isMyMessage ? "ml-2" : "mr-2"
          }`}
          onClick={(event) =>
            onProfileClick(message.senderId, message.senderName, event)
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-amber-900"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a1.5 1.5 0 011.892-1.892L16.5 17.25M17.25 12a5.25 5.25 0 00-10.5 0h10.5z"
            />
          </svg>
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
