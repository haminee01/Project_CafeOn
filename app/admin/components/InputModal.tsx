"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import Button from "@/components/common/Button";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  placeholder: string;
  label: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder,
  label,
  confirmText = "확인",
  cancelText = "취소",
  required = true,
  multiline = false,
  rows = 4
}: InputModalProps) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (!required || value.trim()) {
      onConfirm(value);
      setValue("");
      onClose();
    }
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              rows={rows}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          )}
          {required && (
            <p className="text-xs text-gray-500 mt-1">
              필수 입력 항목입니다.
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-end">
          <Button 
            color="gray" 
            size="md"
            onClick={handleClose}
          >
            {cancelText}
          </Button>
          <Button 
            color="primary" 
            size="md"
            onClick={handleConfirm}
            disabled={required && !value.trim()}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
