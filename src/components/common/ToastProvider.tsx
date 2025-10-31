"use client";

import { createContext, useContext, ReactNode } from "react";
import { useToast } from "./Toast";

interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "info" | "delete",
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const { showToast, ToastContainer } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
