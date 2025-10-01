import React from "react";

interface ChatRoomItemProps {
  cafeName: string;
  lastMessage: string;
  isUnread: boolean;
  onClick: () => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  cafeName,
  lastMessage,
  isUnread,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 ${
        isUnread ? "bg-gray-100" : ""
      }`}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300">
        {/* 카페 이미지 또는 아이콘 */}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold truncate">{cafeName}</p>
        <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
      </div>
      {isUnread && (
        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
      )}
    </div>
  );
};

export default ChatRoomItem;
