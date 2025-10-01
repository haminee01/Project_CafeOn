"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";

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

interface InquiryDetailModalProps {
  isOpen: boolean;
  inquiry: Inquiry | null;
  onClose: () => void;
  onReply: (reply: string) => void;
}

export default function InquiryDetailModal({ 
  isOpen, 
  inquiry, 
  onClose, 
  onReply 
}: InquiryDetailModalProps) {
  useEscapeKey(onClose);
  const [adminReply, setAdminReply] = useState("");

  if (!isOpen || !inquiry) return null;

  const handleReply = () => {
    if (adminReply.trim()) {
      onReply(adminReply);
      setAdminReply("");
      onClose();
    }
  };

  const handleClose = () => {
    setAdminReply("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">문의 상세보기</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* 문의 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">문의 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">카테고리:</span>
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {inquiry.category}
                </span>
              </div>
              <div>
                <span className="text-gray-600">문의자:</span>
                <span className="ml-2 font-medium">{inquiry.inquirer}</span>
              </div>
              <div>
                <span className="text-gray-600">문의일:</span>
                <span className="ml-2 font-medium">{inquiry.date}</span>
              </div>
              <div>
                <span className="text-gray-600">처리 상태:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  inquiry.status === "unprocessed" 
                    ? "bg-red-100 text-red-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {inquiry.status === "unprocessed" ? "미처리" : "처리완료"}
                </span>
              </div>
              {inquiry.processedDate && (
                <div>
                  <span className="text-gray-600">처리일:</span>
                  <span className="ml-2 font-medium">{inquiry.processedDate}</span>
                </div>
              )}
              {inquiry.processedBy && (
                <div>
                  <span className="text-gray-600">처리자:</span>
                  <span className="ml-2 font-medium">{inquiry.processedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* 문의 내용 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">문의 내용</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">{inquiry.title}</h5>
              <p className="text-gray-900 whitespace-pre-wrap">{inquiry.content}</p>
            </div>
          </div>

          {/* 관리자 답변 */}
          {inquiry.adminReply && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">관리자 답변</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{inquiry.adminReply}</p>
              </div>
            </div>
          )}

          {/* 답변 작성 폼 */}
          {inquiry.status === "unprocessed" && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">답변 작성</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답변 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="문의에 대한 답변을 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  정확하고 친절한 답변을 작성해주세요.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  color="primary" 
                  size="md"
                  onClick={handleReply}
                  disabled={!adminReply.trim()}
                >
                  답변 등록
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            color="gray" 
            size="md"
            onClick={handleClose}
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
