"use client";

interface Report {
  id: number;
  type: "post" | "review";
  content: string;
  status: "unprocessed" | "processed";
  date: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  originalContent?: string;
  originalTitle?: string;
  originalImages?: string[];
  adminComment?: string;
  processedDate?: string;
  processedBy?: string;
}

interface ReportCardProps {
  report: Report;
  onDetailClick: (report: Report) => void;
}

export default function ReportCard({ report, onDetailClick }: ReportCardProps) {
  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onDetailClick(report)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              report.type === "post" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {report.type === "post" ? "게시글신고" : "리뷰신고"}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              report.status === "unprocessed" 
                ? "bg-red-100 text-red-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {report.status === "unprocessed" ? "미처리" : "처리완료"}
            </span>
          </div>
          <p className="text-gray-900 font-medium">{report.content}</p>
          <p className="text-sm text-gray-500 mt-1">
            신고자: {report.reporter} | 신고일: {report.date}
          </p>
        </div>
      </div>
    </div>
  );
}
