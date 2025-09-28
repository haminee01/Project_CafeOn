import React, { useEffect, useRef } from "react";
import ChatMessageItem from "./ChatMessageItem";

interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  onProfileClick: (senderId: string, senderName: string) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  onProfileClick,
}) => {
  // 스크롤 영역의 맨 아래를 참조할 Ref 생성
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 배열(messages)이 업데이트될 때마다 스크롤을 맨 아래로 이동시키는 효과
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          onProfileClick={onProfileClick}
        />
      ))}
      {/* 메시지 목록의 끝을 표시하는 빈 div. 이 div로 스크롤합니다. */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
