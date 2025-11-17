"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ChatContextType {
  unreadCounts: { [roomId: number]: number };
  updateUnreadCount: (roomId: number, count: number) => void;
  markAsRead: (roomId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCounts, setUnreadCounts] = useState<{
    [roomId: number]: number;
  }>({});

  const updateUnreadCount = useCallback((roomId: number, count: number) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: count,
    }));
  }, []);

  const markAsRead = useCallback((roomId: number) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0,
    }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        unreadCounts,
        updateUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
