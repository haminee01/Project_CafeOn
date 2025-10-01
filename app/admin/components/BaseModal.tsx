"use client";

import { ReactNode } from "react";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export default function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  showCloseButton = true 
}: BaseModalProps) {
  useEscapeKey(onClose);
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 w-full mx-4 max-h-[90vh] overflow-y-auto ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
