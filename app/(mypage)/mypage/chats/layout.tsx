import React from "react";

interface ChatsLayoutProps {
  children: React.ReactNode;
}

const ChatsLayout: React.FC<ChatsLayoutProps> = ({ children }) => {
  return <div className="flex h-full w-full">{children}</div>;
};

export default ChatsLayout;
