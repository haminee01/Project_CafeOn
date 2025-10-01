"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";

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

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState("unprocessed");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminReply, setAdminReply] = useState("");

  const inquiries: Inquiry[] = [
    { 
      id: 1, 
      title: "카페 등록 문의", 
      inquirer: "user1", 
      date: "2024.01.01", 
      status: "unprocessed",
      content: "안녕하세요. 새로운 카페를 등록하고 싶은데 어떻게 해야 하나요? 등록 절차와 필요한 서류가 궁금합니다.",
      category: "카페 등록"
    },
    { 
      id: 2, 
      title: "리뷰 삭제 요청", 
      inquirer: "user2", 
      date: "2024.01.05", 
      status: "processed",
      content: "제가 작성한 리뷰가 부적절하게 삭제되었습니다. 복구가 가능한지 문의드립니다.",
      category: "리뷰 관리",
      adminReply: "리뷰 삭제 사유를 확인한 결과, 커뮤니티 가이드라인 위반으로 삭제되었습니다. 복구는 어려우며, 앞으로 가이드라인을 준수해 주시기 바랍니다.",
      processedDate: "2024.01.05",
      processedBy: "관리자1"
    },
    { 
      id: 3, 
      title: "계정 정지 해제 문의", 
      inquirer: "user3", 
      date: "2024.01.10", 
      status: "unprocessed",
      content: "계정이 정지되었는데 해제 방법을 알려주세요. 언제부터 정지되었는지도 모르겠습니다.",
      category: "계정 관리"
    },
    { 
      id: 4, 
      title: "광고 제휴 문의", 
      inquirer: "user4", 
      date: "2024.01.15", 
      status: "processed",
      content: "카페 사장입니다. 광고 제휴에 관심이 있습니다. 문의드립니다.",
      category: "제휴 문의",
      adminReply: "광고 제휴 문의 감사합니다. 담당자가 연락드릴 예정입니다. 1-2일 내에 연락드리겠습니다.",
      processedDate: "2024.01.15",
      processedBy: "관리자2"
    },
    { 
      id: 5, 
      title: "버그 리포트", 
      inquirer: "user5", 
      date: "2024.01.20", 
      status: "unprocessed",
      content: "앱에서 로그인이 안 되는 문제가 있습니다. 계속 로그인 화면으로 돌아갑니다.",
      category: "기술 문의"
    },
    { 
      id: 6, 
      title: "개선 사항 제안", 
      inquirer: "user6", 
      date: "2024.01.25", 
      status: "processed",
      content: "리뷰 작성 시 사진을 여러 장 첨부할 수 있으면 좋겠습니다.",
      category: "기능 제안",
      adminReply: "좋은 제안 감사합니다. 개발팀에 전달하여 검토하겠습니다. 향후 업데이트에서 반영될 수 있습니다.",
      processedDate: "2024.01.25",
      processedBy: "관리자1"
    },
    { 
      id: 7, 
      title: "개인 정보 변경 요청", 
      inquirer: "user7", 
      date: "2024.01.28", 
      status: "unprocessed",
      content: "이메일 주소를 변경하고 싶습니다. 어떻게 해야 하나요?",
      category: "계정 관리"
    },
    { 
      id: 8, 
      title: "기타 문의", 
      inquirer: "user8", 
      date: "2024.02.01", 
      status: "processed",
      content: "앱 사용법에 대해 궁금한 점이 있습니다.",
      category: "기타",
      adminReply: "앱 사용법에 대한 자세한 내용은 도움말 섹션을 참고해 주세요. 추가 문의사항이 있으시면 언제든 연락주세요.",
      processedDate: "2024.02.01",
      processedBy: "관리자2"
    }
  ];

  const filteredInquiries = inquiries.filter(inquiry => 
    activeTab === "unprocessed" ? inquiry.status === "unprocessed" : inquiry.status === "processed"
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedInquiry(null);
    setAdminReply("");
  };

  const handleReplyConfirm = () => {
    if (selectedInquiry && adminReply.trim()) {
      // 실제로는 API 호출로 답변 처리
      alert("답변이 등록되었습니다.");
      setShowDetailModal(false);
      setSelectedInquiry(null);
      setAdminReply("");
    }
  };

  const handleReplyCancel = () => {
    setAdminReply("");
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">문의 내역</h1>
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

      {/* 문의 목록 */}
      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => (
          <div 
            key={inquiry.id} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDetailClick(inquiry)}
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
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-8"
      />

      {/* 문의 상세보기 모달 */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">문의 상세보기</h3>
              <button
                onClick={handleCloseModal}
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
                      {selectedInquiry.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">문의자:</span>
                    <span className="ml-2 font-medium">{selectedInquiry.inquirer}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">문의일:</span>
                    <span className="ml-2 font-medium">{selectedInquiry.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">처리 상태:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedInquiry.status === "unprocessed" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedInquiry.status === "unprocessed" ? "미처리" : "처리완료"}
                    </span>
                  </div>
                  {selectedInquiry.processedDate && (
                    <div>
                      <span className="text-gray-600">처리일:</span>
                      <span className="ml-2 font-medium">{selectedInquiry.processedDate}</span>
                    </div>
                  )}
                  {selectedInquiry.processedBy && (
                    <div>
                      <span className="text-gray-600">처리자:</span>
                      <span className="ml-2 font-medium">{selectedInquiry.processedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 내용 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">문의 내용</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{selectedInquiry.title}</h5>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.content}</p>
                </div>
              </div>

              {/* 관리자 답변 */}
              {selectedInquiry.adminReply && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">관리자 답변</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.adminReply}</p>
                  </div>
                </div>
              )}

              {/* 답변 작성 폼 */}
              {selectedInquiry.status === "unprocessed" && (
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
                      onClick={handleReplyConfirm}
                      disabled={!adminReply.trim()}
                    >
                      답변 등록
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}