"use client";

import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import { useToastContext } from "@/components/common/ToastProvider";
import {
  getAdminInquiries,
  getAdminInquiryDetail,
  getAdminInquiryAnswers,
  createAdminInquiryAnswer,
} from "@/lib/api";

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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToastContext();

  // 문의 목록 조회
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const status =
          activeTab === "unprocessed" ? "PENDING" : "ANSWERED";
        const response = await getAdminInquiries({
          page: currentPage - 1,
          size: 10,
          status,
        });

        const inquiriesData = response?.data?.content || response?.content || [];
        const formattedInquiries = inquiriesData.map((inq: any) => ({
          id: inq.id || inq.questionId,
          title: inq.title || "",
          inquirer: inq.authorNickname || inq.author_nickname || "",
          date: inq.createdAt || inq.created_at || "",
          status:
            inq.status === "PENDING" || inq.status === "ANSWERED"
              ? inq.status === "PENDING"
                ? "unprocessed"
                : "processed"
              : "unprocessed",
          content: inq.content || "",
          category: inq.category || "기타",
        }));

        setInquiries(formattedInquiries);

        const totalElements =
          response?.data?.totalElements || response?.totalElements || 0;
        setTotalPages(
          Math.ceil(totalElements / 10) || Math.ceil(inquiriesData.length / 10)
        );
      } catch (error: any) {
        console.error("문의 목록 조회 실패:", error);
        setInquiries([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [activeTab, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = async (inquiry: Inquiry) => {
    try {
      // 문의 상세 정보 및 답변 목록 조회
      const [detail, answers] = await Promise.all([
        getAdminInquiryDetail(inquiry.id),
        getAdminInquiryAnswers(inquiry.id),
      ]);

      const detailData = detail?.data || detail;
      const answersData = answers?.data || answers || [];

      // 가장 최신 답변을 관리자 답변으로 표시
      const latestAnswer =
        Array.isArray(answersData) && answersData.length > 0
          ? answersData[answersData.length - 1]
          : null;

      setSelectedInquiry({
        ...inquiry,
        content: detailData?.content || inquiry.content,
        adminReply: latestAnswer?.content || undefined,
        processedDate: latestAnswer?.createdAt || latestAnswer?.created_at || undefined,
        processedBy: latestAnswer?.adminNickname || latestAnswer?.admin_nickname || undefined,
      });
      setShowDetailModal(true);
    } catch (error: any) {
      console.error("문의 상세 조회 실패:", error);
      // 상세 조회 실패 시 기본 정보만 표시
      setSelectedInquiry(inquiry);
      setShowDetailModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedInquiry(null);
    setAdminReply("");
  };

  const handleReplyConfirm = async () => {
    if (selectedInquiry && adminReply.trim()) {
      try {
        await createAdminInquiryAnswer(selectedInquiry.id, adminReply);
        showToast("답변이 등록되었습니다.", "success");
        setShowDetailModal(false);
        setSelectedInquiry(null);
        setAdminReply("");
        // 목록 새로고침을 위해 페이지 재조회
        setCurrentPage(1);
      } catch (error: any) {
        console.error("답변 작성 실패:", error);
        showToast(error.message || "답변 작성에 실패했습니다.", "error");
      }
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
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">문의 목록을 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.length > 0 ? (
            inquiries.map((inquiry) => (
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
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      inquiry.status === "unprocessed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
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
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {activeTab === "unprocessed" ? "미처리 문의가 없습니다." : "처리된 문의가 없습니다."}
              </p>
            </div>
          )}
        </div>
      )}

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
              <h3 className="text-xl font-semibold text-gray-900">
                문의 상세보기
              </h3>
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
                    <span className="ml-2 font-medium">
                      {selectedInquiry.inquirer}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">문의일:</span>
                    <span className="ml-2 font-medium">
                      {selectedInquiry.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">처리 상태:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedInquiry.status === "unprocessed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedInquiry.status === "unprocessed"
                        ? "미처리"
                        : "처리완료"}
                    </span>
                  </div>
                  {selectedInquiry.processedDate && (
                    <div>
                      <span className="text-gray-600">처리일:</span>
                      <span className="ml-2 font-medium">
                        {selectedInquiry.processedDate}
                      </span>
                    </div>
                  )}
                  {selectedInquiry.processedBy && (
                    <div>
                      <span className="text-gray-600">처리자:</span>
                      <span className="ml-2 font-medium">
                        {selectedInquiry.processedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 내용 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">문의 내용</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {selectedInquiry.title}
                  </h5>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedInquiry.content}
                  </p>
                </div>
              </div>

              {/* 관리자 답변 */}
              {selectedInquiry.adminReply && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    관리자 답변
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedInquiry.adminReply}
                    </p>
                  </div>
                </div>
              )}

              {/* 답변 작성 폼 */}
              {selectedInquiry.status === "unprocessed" && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    답변 작성
                  </h4>
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
