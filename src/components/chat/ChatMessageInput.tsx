// src/components/chat/ChatMessageInput.tsx

import React, { useState } from "react";

interface ChatMessageInputProps {
  onSendMessage: (message: string) => void;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 flex">
      <input
        type="text"
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
        placeholder="메시지 보내기"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={handleSendMessage}
        className="ml-2 rounded-full bg-[#A86E3C] px-6 py-2 text-white hover:bg-[#8d5e33]"
      >
        보내기
      </button>
    </div>
  );
};

export default ChatMessageInput;
