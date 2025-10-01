"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

interface MemberCardProps {
  member: {
    id: number;
    name: string;
    email: string;
    status: "active" | "suspended";
    penaltyCount: number;
  };
  onPenalty: (member: any) => void;
  onSuspension: (member: any) => void;
}

export default function MemberCard({ member, onPenalty, onSuspension }: MemberCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/admin/members/${member.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-900 font-medium">{member.name}</p>
          <p className="text-sm text-gray-500 mt-1">{member.email}</p>
          <p className="text-sm text-gray-500">
            페널티: {member.penaltyCount}회 | 
            상태: {member.status === "active" ? "정상" : "정지"}
          </p>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            color="warning" 
            size="sm"
            onClick={(e) => handleButtonClick(e, () => onPenalty(member))}
          >
            페널티
          </Button>
          <Button 
            color={member.status === "active" ? "warning" : "secondary"} 
            size="sm"
            onClick={(e) => handleButtonClick(e, () => onSuspension(member))}
          >
            {member.status === "active" ? "정지" : "정지 해제"}
          </Button>
        </div>
      </div>
    </div>
  );
}
