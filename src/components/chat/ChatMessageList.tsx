"use client";

import React, { useEffect, useRef } from "react";
import ChatMessageItem from "./ChatMessageItem";
import { ChatMessage, ProfileClickHandler } from "@/types/chat";

interface ChatMessageListProps {
  messages: ChatMessage[];
  onProfileClick: ProfileClickHandler;
  onListClick: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  onProfileClick,
  onListClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 border-y"
      onClick={onListClick}
    >
      {messages.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          onProfileClick={onProfileClick}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
