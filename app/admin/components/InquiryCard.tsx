"use client";

interface Inquiry {
  id: number;
  title: string;
  inquirer: string;
  date: string;
  status: "unprocessed" | "processed";
  content: string;
  category: string;
  adminReply?: string;
  processedDate?: string;
  processedBy?: string;
}

interface InquiryCardProps {
  inquiry: Inquiry;
  onDetailClick: (inquiry: Inquiry) => void;
}

export default function InquiryCard({ inquiry, onDetailClick }: InquiryCardProps) {
  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onDetailClick(inquiry)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {inquiry.category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              inquiry.status === "unprocessed" 
                ? "bg-red-100 text-red-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {inquiry.status === "unprocessed" ? "미처리" : "처리완료"}
            </span>
          </div>
          <p className="text-gray-900 font-medium">{inquiry.title}</p>
          <p className="text-sm text-gray-500 mt-1">
            문의자: {inquiry.inquirer} | 날짜: {inquiry.date}
          </p>
        </div>
      </div>
    </div>
  );
}
