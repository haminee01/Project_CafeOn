"use client";

import React, { useState } from "react";

interface ChatMessageInputProps {
  onSendMessage: (message: string) => void;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-b-xl">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#6E4213] focus:border-transparent transition duration-150"
        />
        <button
          type="submit"
          className="bg-[#6E4213] text-white p-3 rounded-lg hover:bg-[#8d5e33] transition duration-150 disabled:bg-gray-400"
          disabled={!input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.52 60.52 0 0 0 18.44-5.9v-.413c0-1.721-.574-3.414-1.681-4.785z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatMessageInput;
