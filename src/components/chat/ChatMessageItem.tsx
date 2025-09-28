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
  // 프로필 클릭 시 호출될 콜백 함수를 추가합니다. (상대방 ID를 전달)
  onProfileClick?: (senderId: string, senderName: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onProfileClick,
}) => {
  const profileImage =
    message.senderName === "Sunwon903"
      ? "/images/profile-sunwon.png"
      : "/images/profile-alice.png";

  // 상대방 메시지일 때만 클릭 이벤트 핸들러를 정의합니다.
  const handleProfileClick = () => {
    if (!message.isMyMessage && onProfileClick) {
      onProfileClick(message.senderId, message.senderName);
    }
  };

  return (
    <div
      className={`mb-4 flex ${
        message.isMyMessage ? "flex-row-reverse" : "flex-row"
      } items-start`}
    >
      {/* 상대방 메시지일 경우에만 프로필 이미지와 닉네임 렌더링 */}
      {!message.isMyMessage && (
        <div
          className="flex-shrink-0 mr-2 flex flex-col items-center cursor-pointer group"
          onClick={handleProfileClick}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border-2 border-transparent group-hover:border-amber-500 transition duration-150">
            {/* 프로필 이미지 (실제 이미지 경로로 대체 필요) */}
            <img
              src={profileImage}
              alt={`${message.senderName} 프로필`}
              className="w-full h-full object-cover"
              // 이미지 로드 오류 방지용 placeholder
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/32x32/cccccc/333333?text=👤";
              }}
            />
          </div>
          <span className="mt-1 text-xs text-gray-500 group-hover:text-amber-600 transition duration-150">
            {message.senderName}
          </span>

          {/* 1:1 채팅하기 버튼은 프로필 클릭 시 모달이 띄워지는 것으로 대체되므로 별도로 렌더링하지 않습니다. */}
        </div>
      )}

      {/* 메시지 내용 버블 */}
      <div
        className={`flex flex-col ${
          message.isMyMessage ? "items-end" : "items-start"
        } max-w-[75%]`}
      >
        {/* 내 메시지일 경우에만 닉네임 렌더링 (상대방은 프로필 아래에 렌더링됨) */}
        {message.isMyMessage && (
          <span className="text-xs text-gray-500 mb-1">닉네임</span>
        )}

        <div
          className={`rounded-lg p-2 text-sm ${
            message.isMyMessage
              ? "bg-[#A86E3C] text-white"
              : "bg-gray-100 text-black border border-gray-200"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
