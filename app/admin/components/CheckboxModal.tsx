"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import Button from "@/components/common/Button";

interface CheckboxOption {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface CheckboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  options: CheckboxOption[];
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "warning";
}

export default function CheckboxModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  options,
  confirmText = "확인",
  cancelText = "취소",
  confirmColor = "primary",
}: CheckboxModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={option.checked}
                  onChange={(e) => option.onChange(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor={option.id}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {option.description}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <Button color="gray" size="md" onClick={onClose}>
            {cancelText}
          </Button>
          <Button color={confirmColor} size="md" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
