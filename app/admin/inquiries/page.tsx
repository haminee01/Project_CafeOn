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
        const status = activeTab === "unprocessed" ? "PENDING" : "ANSWERED";
        const response = await getAdminInquiries({
          page: currentPage - 1,
          size: 10,
          status,
        });

        const inquiriesData =
          response?.data?.content || response?.content || [];
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
        processedDate:
          latestAnswer?.createdAt || latestAnswer?.created_at || undefined,
        processedBy:
          latestAnswer?.adminNickname ||
          latestAnswer?.admin_nickname ||
          undefined,
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
    <>
      <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">문의 내역</h1>
          <div className="text-sm text-gray-500">총 {inquiries.length}건</div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("unprocessed")}
            className={`px-6 py-3 text-base font-medium transition-colors ${
              activeTab === "unprocessed"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            미처리 내역
          </button>
          <button
            onClick={() => setActiveTab("processed")}
            className={`px-6 py-3 text-base font-medium transition-colors ${
              activeTab === "processed"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            처리 내역
          </button>
        </div>

        {/* 문의 목록 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 mt-4">문의 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  onClick={() => handleDetailClick(inquiry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/20 text-primary border border-secondary/30">
                          {inquiry.category}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            inquiry.status === "unprocessed"
                              ? "bg-warning/10 text-warning border border-warning/20"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {inquiry.status === "unprocessed"
                            ? "미처리"
                            : "처리완료"}
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold text-lg mb-2">
                        {inquiry.title}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">문의자:</span>
                          <span>{inquiry.inquirer}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">날짜:</span>
                          <span>{inquiry.date}</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">
                  {activeTab === "unprocessed"
                    ? "미처리 문의가 없습니다."
                    : "처리된 문의가 없습니다."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && inquiries.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* 문의 상세보기 모달 */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900">
                문의 상세보기
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* 문의 정보 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                  <span className="text-primary">📄</span>
                  문의 정보
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium min-w-[80px]">
                      카테고리:
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/20 text-primary border border-secondary/30">
                      {selectedInquiry.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium min-w-[80px]">
                      문의자:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {selectedInquiry.inquirer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium min-w-[80px]">
                      문의일:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {selectedInquiry.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium min-w-[80px]">
                      처리 상태:
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        selectedInquiry.status === "unprocessed"
                          ? "bg-warning/10 text-warning border border-warning/20"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {selectedInquiry.status === "unprocessed"
                        ? "미처리"
                        : "처리완료"}
                    </span>
                  </div>
                  {selectedInquiry.processedDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium min-w-[80px]">
                        처리일:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedInquiry.processedDate}
                      </span>
                    </div>
                  )}
                  {selectedInquiry.processedBy && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium min-w-[80px]">
                        처리자:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedInquiry.processedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 내용 */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <span className="text-primary">💭</span>
                  문의 내용
                </h4>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-primary/30 transition-colors">
                  <h5 className="font-semibold text-gray-900 mb-3 text-lg">
                    {selectedInquiry.title}
                  </h5>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.content}
                  </p>
                </div>
              </div>

              {/* 관리자 답변 */}
              {selectedInquiry.adminReply && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <span className="text-primary">💬</span>
                    관리자 답변
                  </h4>
                  <div className="bg-secondary/10 border-2 border-secondary/30 rounded-lg p-5">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedInquiry.adminReply}
                    </p>
                  </div>
                </div>
              )}

              {/* 답변 작성 폼 */}
              {selectedInquiry.status === "unprocessed" && (
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                    <span className="text-primary">✏️</span>
                    답변 작성
                  </h4>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      답변 내용 <span className="text-warning">*</span>
                    </label>
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="문의에 대한 답변을 입력하세요..."
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-colors"
                      rows={5}
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>ℹ️</span>
                      정확하고 친절한 답변을 작성해주세요.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button color="gray" size="md" onClick={handleReplyCancel}>
                      취소
                    </Button>
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
    </>
  );
}
