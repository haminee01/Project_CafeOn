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
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-200 bg-white flex items-center shadow-md"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4213] transition duration-150 mr-2"
        autoFocus
      />
      <button
        type="submit"
        disabled={!input.trim()}
        className={`p-3 rounded-xl transition duration-150 shadow-sm
          ${
            input.trim()
              ? "bg-[#6E4213] text-white hover:bg-[#8d5e33]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
        </svg>
      </button>
    </form>
  );
};

export default ChatMessageInput;
