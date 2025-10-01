import React from "react";
import ChatRoomList from "@/components/chat/ChatRoomList";

const ChatListPage = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      <ChatRoomList />
    </div>
  );
};

export default ChatListPage;
