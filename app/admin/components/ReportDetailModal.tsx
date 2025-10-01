"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";

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

interface ReportDetailModalProps {
  isOpen: boolean;
  report: Report | null;
  onClose: () => void;
  onProcess: (comment: string, deleteContent: boolean) => void;
}

export default function ReportDetailModal({ 
  isOpen, 
  report, 
  onClose, 
  onProcess 
}: ReportDetailModalProps) {
  useEscapeKey(onClose);
  const [adminComment, setAdminComment] = useState("");
  const [deleteContent, setDeleteContent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 중첩된 삭제 확인 모달에도 ESC 키 이벤트 적용
  useEscapeKey(() => {
    if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
    } else {
      onClose();
    }
  });

  if (!isOpen || !report) return null;

  const handleProcess = () => {
    if (adminComment.trim()) {
      if (deleteContent) {
        setShowDeleteConfirm(true);
      } else {
        onProcess(adminComment, false);
        handleClose();
      }
    }
  };

  const handleDeleteConfirm = () => {
    onProcess(adminComment, true);
    handleClose();
  };

  const handleClose = () => {
    setAdminComment("");
    setDeleteContent(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">신고 내역 상세보기</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* 신고 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">신고 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">신고 유형:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    report.type === "post" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {report.type === "post" ? "게시글신고" : "리뷰신고"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">신고자:</span>
                  <span className="ml-2 font-medium">{report.reporter}</span>
                </div>
                <div>
                  <span className="text-gray-600">신고된 사용자:</span>
                  <span className="ml-2 font-medium">{report.reportedUser}</span>
                </div>
                <div>
                  <span className="text-gray-600">신고일:</span>
                  <span className="ml-2 font-medium">{report.date}</span>
                </div>
                <div>
                  <span className="text-gray-600">신고 사유:</span>
                  <span className="ml-2 font-medium">{report.reason}</span>
                </div>
                <div>
                  <span className="text-gray-600">처리 상태:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === "unprocessed" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {report.status === "unprocessed" ? "미처리" : "처리완료"}
                  </span>
                </div>
                {report.processedDate && (
                  <div>
                    <span className="text-gray-600">처리일:</span>
                    <span className="ml-2 font-medium">{report.processedDate}</span>
                  </div>
                )}
                {report.processedBy && (
                  <div>
                    <span className="text-gray-600">처리자:</span>
                    <span className="ml-2 font-medium">{report.processedBy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 신고 내용 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">신고 내용</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-900">{report.content}</p>
              </div>
            </div>

            {/* 원본 내용 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {report.type === "post" ? "원본 게시글" : "원본 리뷰"}
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {report.originalTitle && (
                  <h5 className="font-medium text-gray-900 mb-2">{report.originalTitle}</h5>
                )}
                <p className="text-gray-900 whitespace-pre-wrap mb-4">{report.originalContent}</p>
                
                {/* 첨부 이미지 */}
                {report.originalImages && report.originalImages.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">첨부 이미지</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {report.originalImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`첨부 이미지 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              클릭하여 확대
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 관리자 코멘트 */}
            {report.adminComment && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">관리자 코멘트</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{report.adminComment}</p>
                </div>
              </div>
            )}

            {/* 신고 처리 폼 */}
            {report.status === "unprocessed" && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">신고 처리</h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    처리 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="신고 처리 내용을 입력하세요..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    처리 결과와 조치 내용을 상세히 기록해주세요.
                  </p>
                </div>

                {/* 삭제 옵션 */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="deleteContent"
                      checked={deleteContent}
                      onChange={(e) => setDeleteContent(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="deleteContent" className="ml-2 text-sm text-gray-700">
                      {report.type === "post" ? "게시글" : "리뷰"} 삭제
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    {report.type === "post" ? "게시글" : "리뷰"}을 삭제하면 복구할 수 없습니다.
                  </p>
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
            {report.status === "unprocessed" && (
              <Button 
                color="primary" 
                size="md"
                onClick={handleProcess}
                disabled={!adminComment.trim()}
              >
                처리하기
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {report.type === "post" ? "게시글" : "리뷰"} 삭제 확인
              </h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-red-600">
                  {report.type === "post" ? "게시글" : "리뷰"}
                </span>을 삭제하시겠습니까?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ 삭제된 {report.type === "post" ? "게시글" : "리뷰"}은 복구할 수 없습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                color="gray" 
                size="md"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
              <Button 
                color="warning" 
                size="md"
                onClick={handleDeleteConfirm}
              >
                삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
