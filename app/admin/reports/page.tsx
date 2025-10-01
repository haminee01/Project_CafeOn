"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import { useEscapeKey } from "../../../src/hooks/useEscapeKey";

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

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("unprocessed");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [deleteContent, setDeleteContent] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showDeleteConfirmModal) {
      setShowDeleteConfirmModal(false);
    }
  });

  const reports: Report[] = [
    { 
      id: 1, 
      type: "review",
      content: "부적절한 리뷰 내용입니다.", 
      status: "unprocessed", 
      date: "2024.01.01",
      reporter: "신고자1",
      reportedUser: "리뷰작성자1",
      reason: "욕설 및 비방",
      originalContent: "여기 맛있네요.... 정말 맛있어요! 강력 추천합니다.",
      originalImages: ["/api/placeholder/400/300", "/api/placeholder/400/300"]
    },
    { 
      id: 2, 
      type: "post",
      content: "스팸성 게시글입니다.", 
      status: "unprocessed", 
      date: "2024.01.02",
      reporter: "신고자2",
      reportedUser: "게시글작성자1",
      reason: "스팸",
      originalTitle: "카페 추천해요",
      originalContent: "어쩌구 저쩌구 내용입니다...",
      originalImages: ["/api/placeholder/400/300"]
    },
    { 
      id: 3, 
      type: "review",
      content: "허위 정보가 포함된 리뷰입니다.", 
      status: "processed", 
      date: "2024.01.03",
      reporter: "신고자3",
      reportedUser: "리뷰작성자2",
      reason: "허위정보",
      originalContent: "어쩌구 저쩌구 리뷰 내용...",
      adminComment: "신고 내용을 검토한 결과, 허위 정보가 포함되어 있음을 확인했습니다. 해당 리뷰를 삭제 처리하였습니다.",
      processedDate: "2024.01.03",
      processedBy: "관리자1"
    },
    { 
      id: 4, 
      type: "post",
      content: "부적절한 게시글입니다.", 
      status: "unprocessed", 
      date: "2024.01.04",
      reporter: "신고자4",
      reportedUser: "게시글작성자2",
      reason: "음란물",
      originalTitle: "카페 후기",
      originalContent: "어쩌구 저쩌구 게시글 내용...",
      originalImages: ["/api/placeholder/400/300", "/api/placeholder/400/300", "/api/placeholder/400/300"]
    },
    { 
      id: 5, 
      type: "review",
      content: "중복 리뷰입니다.", 
      status: "processed", 
      date: "2024.01.05",
      reporter: "신고자5",
      reportedUser: "리뷰작성자3",
      reason: "중복게시",
      originalContent: "어쩌구 저쩌구 중복 리뷰...",
      originalImages: ["/api/placeholder/400/300"],
      adminComment: "동일한 사용자가 같은 카페에 중복으로 작성한 리뷰를 확인했습니다. 중복 리뷰를 삭제하고 경고 조치를 취했습니다.",
      processedDate: "2024.01.05",
      processedBy: "관리자2"
    }
  ];

  const filteredReports = reports.filter(report => 
    activeTab === "unprocessed" ? report.status === "unprocessed" : report.status === "processed"
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
    setAdminComment("");
    setDeleteContent(false);
  };

  const handleProcessClick = () => {
    setShowProcessModal(true);
  };

  const handleProcessConfirm = () => {
    if (selectedReport && adminComment.trim()) {
      if (deleteContent) {
        setShowDeleteConfirmModal(true);
      } else {
        processReport();
      }
    }
  };

  const processReport = () => {
    // 실제로는 API 호출로 신고 처리
    const action = deleteContent ? "삭제 처리" : "처리";
    alert(`신고 처리가 완료되었습니다. (${action})`);
    setShowProcessModal(false);
    setShowDeleteConfirmModal(false);
    setShowDetailModal(false);
    setSelectedReport(null);
    setAdminComment("");
    setDeleteContent(false);
  };

  const handleProcessCancel = () => {
    setShowProcessModal(false);
    setAdminComment("");
    setDeleteContent(false);
  };

  const handleDeleteConfirm = () => {
    processReport();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">신고 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("unprocessed")}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "unprocessed"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          미처리 내역
        </button>
        <button
          onClick={() => setActiveTab("processed")}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "processed"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          처리 내역
        </button>
      </div>

      {/* 신고 목록 */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div 
            key={report.id} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDetailClick(report)}
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
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-8"
      />

      {/* 신고 상세보기 모달 */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">신고 내역 상세보기</h3>
              <button
                onClick={handleCloseModal}
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
                      selectedReport.type === "post" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {selectedReport.type === "post" ? "게시글신고" : "리뷰신고"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고자:</span>
                    <span className="ml-2 font-medium">{selectedReport.reporter}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고된 사용자:</span>
                    <span className="ml-2 font-medium">{selectedReport.reportedUser}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고일:</span>
                    <span className="ml-2 font-medium">{selectedReport.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고 사유:</span>
                    <span className="ml-2 font-medium">{selectedReport.reason}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">처리 상태:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedReport.status === "unprocessed" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedReport.status === "unprocessed" ? "미처리" : "처리완료"}
                    </span>
                  </div>
                  {selectedReport.processedDate && (
                    <div>
                      <span className="text-gray-600">처리일:</span>
                      <span className="ml-2 font-medium">{selectedReport.processedDate}</span>
                    </div>
                  )}
                  {selectedReport.processedBy && (
                    <div>
                      <span className="text-gray-600">처리자:</span>
                      <span className="ml-2 font-medium">{selectedReport.processedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 신고 내용 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">신고 내용</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-gray-900">{selectedReport.content}</p>
                </div>
              </div>

              {/* 원본 내용 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {selectedReport.type === "post" ? "원본 게시글" : "원본 리뷰"}
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {selectedReport.originalTitle && (
                    <h5 className="font-medium text-gray-900 mb-2">{selectedReport.originalTitle}</h5>
                  )}
                  <p className="text-gray-900 whitespace-pre-wrap mb-4">{selectedReport.originalContent}</p>
                  
                  {/* 첨부 이미지 */}
                  {selectedReport.originalImages && selectedReport.originalImages.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">첨부 이미지</h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedReport.originalImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`첨부 이미지 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                // 이미지 확대 모달 또는 새 탭에서 열기
                                window.open(image, '_blank');
                              }}
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
              {selectedReport.adminComment && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">관리자 코멘트</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.adminComment}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                color="gray" 
                size="md"
                onClick={handleCloseModal}
              >
                닫기
              </Button>
              {selectedReport.status === "unprocessed" && (
                <Button 
                  color="primary" 
                  size="md"
                  onClick={handleProcessClick}
                >
                  처리하기
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 신고 처리 모달 */}
      {showProcessModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              신고 처리
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">신고 유형:</span> {selectedReport.type === "post" ? "게시글신고" : "리뷰신고"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">신고 사유:</span> {selectedReport.reason}
              </p>
            </div>
            <div className="mb-6">
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
                  {selectedReport.type === "post" ? "게시글" : "리뷰"} 삭제
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {selectedReport.type === "post" ? "게시글" : "리뷰"}을 삭제하면 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                color="gray" 
                size="md"
                onClick={handleProcessCancel}
              >
                취소
              </Button>
              <Button 
                color="primary" 
                size="md"
                onClick={handleProcessConfirm}
                disabled={!adminComment.trim()}
              >
                처리완료
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirmModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedReport.type === "post" ? "게시글" : "리뷰"} 삭제 확인
            </h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-red-600">
                  {selectedReport.type === "post" ? "게시글" : "리뷰"}
                </span>을 삭제하시겠습니까?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ 삭제된 {selectedReport.type === "post" ? "게시글" : "리뷰"}은 복구할 수 없습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                color="gray" 
                size="md"
                onClick={handleDeleteCancel}
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
    </div>
  );
}