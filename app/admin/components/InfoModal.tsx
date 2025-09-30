"use client";

import BaseModal from "./BaseModal";
import Button from "@/components/common/Button";

interface InfoItem {
  label: string;
  value: string | React.ReactNode;
  type?: "text" | "badge" | "custom";
  badgeColor?: "blue" | "green" | "red" | "gray" | "yellow";
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: InfoItem[];
  actions?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  items,
  actions,
  size = "lg"
}: InfoModalProps) {
  const getBadgeColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
      yellow: "bg-yellow-100 text-yellow-800"
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="space-y-6">
        {/* 정보 표시 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">정보</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {items.map((item, index) => (
              <div key={index}>
                <span className="text-gray-600">{item.label}:</span>
                <span className="ml-2">
                  {item.type === "badge" ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(item.badgeColor || "gray")}`}>
                      {item.value}
                    </span>
                  ) : (
                    <span className="font-medium">{item.value}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 추가 컨텐츠 */}
        {actions && (
          <div>
            {actions}
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-3 mt-6">
        <Button 
          color="gray" 
          size="md"
          onClick={onClose}
        >
          닫기
        </Button>
      </div>
    </BaseModal>
  );
}
