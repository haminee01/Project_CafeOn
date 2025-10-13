"use client";

import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import { 
  getAdminInquiries, 
  getAdminInquiryDetail, 
  getAdminInquiryAnswers, 
  createAdminInquiryAnswer 
} from "@/lib/api";

interface Inquiry {
  id: number;
  title: string;
  authorNickname: string;
  createdAt: string;
  visibility: "PUBLIC" | "PRIVATE";
  status: "PENDING" | "ANSWERED";
  content?: string;
  updatedAt?: string;
}

interface Answer {
  answerId: number;
  adminNickname: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "ANSWERED">("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  const itemsPerPage = 10;

  // Mock 데이터 (API 연동 전까지 사용)
  const mockInquiries: Inquiry[] = [
    { 
      id: 1, 
      title: "카페 등록 문의", 
      authorNickname: "user1", 
      createdAt: "2024-01-01T09:00:00", 
      status: "PENDING",
      visibility: "PUBLIC",
      content: "안녕하세요. 새로운 카페를 등록하고 싶은데 어떻게 해야 하나요?"
    },
    { 
      id: 2, 
      title: "리뷰 삭제 요청", 
      authorNickname: "user2", 
      createdAt: "2024-01-05T10:00:00", 
      status: "ANSWERED",
      visibility: "PUBLIC",
      content: "제가 작성한 리뷰가 부적절하게 삭제되었습니다."
    },
    { 
      id: 3, 
      title: "계정 정지 해제 문의", 
      authorNickname: "user3", 
      createdAt: "2024-01-10T11:00:00", 
      status: "PENDING",
      visibility: "PRIVATE",
      content: "계정이 정지되었는데 해제 방법을 알려주세요."
    },
  ];

  // 문의 목록 조회
  useEffect(() => {
    fetchInquiries();
  }, [activeTab, currentPage]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    
    // 토큰이 있는 경우 API 호출 시도
    const token = localStorage.getItem("accessToken");
    
    if (token && !useMockData) {
      try {
        const response = await getAdminInquiries({
          page: currentPage - 1,
          size: itemsPerPage,
          status: activeTab,
        });
        
        setInquiries(response.content || []);
        setTotalPages(response.totalPages || 1);
        setLoading(false);
        return;
      } catch (error: any) {
        console.error("API 호출 실패, Mock 데이터 사용:", error);
        // API 실패 시 Mock 데이터로 폴백
      }
    }
    
    // Mock 데이터 사용
    const filtered = mockInquiries.filter(inq => inq.status === activeTab);
    setInquiries(filtered);
    setTotalPages(1);
    setLoading(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = async (inquiry: Inquiry) => {
    const token = localStorage.getItem("accessToken");
    
    if (token && !useMockData) {
      try {
        // 문의 상세 정보 조회
        const detailData = await getAdminInquiryDetail(inquiry.id);
        setSelectedInquiry(detailData);
        
        // 답변 목록 조회
        const answersData = await getAdminInquiryAnswers(inquiry.id);
        setAnswers(answersData || []);
        
        setShowDetailModal(true);
        return;
      } catch (error) {
        console.error("문의 상세 조회 실패, Mock 데이터 사용:", error);
      }
    }
    
    // Mock 데이터 사용
    setSelectedInquiry(inquiry);
    setAnswers([]);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedInquiry(null);
    setAnswers([]);
    setAdminReply("");
  };

  const handleReplyConfirm = async () => {
    if (selectedInquiry && adminReply.trim()) {
      const token = localStorage.getItem("accessToken");
      
      if (token && !useMockData) {
        try {
          await createAdminInquiryAnswer(selectedInquiry.id, adminReply);
          alert("답변이 등록되었습니다.");
          
          // 문의 목록 새로고침
          await fetchInquiries();
          
          setShowDetailModal(false);
          setSelectedInquiry(null);
          setAnswers([]);
          setAdminReply("");
          return;
        } catch (error) {
          console.error("답변 등록 실패:", error);
          alert("답변 등록에 실패했습니다. Mock 모드에서는 답변이 저장되지 않습니다.");
        }
      } else {
        // Mock 모드
        alert("Mock 모드에서는 답변이 저장되지 않습니다. 관리자 계정으로 로그인해주세요.");
      }
      
      setShowDetailModal(false);
      setSelectedInquiry(null);
      setAnswers([]);
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
          onClick={() => {
            setActiveTab("PENDING");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "PENDING"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          미처리 내역
        </button>
        <button
          onClick={() => {
            setActiveTab("ANSWERED");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "ANSWERED"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          처리 내역
        </button>
      </div>

      {/* Mock 모드 알림 */}
      {useMockData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Mock 데이터 모드로 실행 중입니다. 관리자 계정으로 로그인하면 실제 데이터를 확인할 수 있습니다.
          </p>
        </div>
      )}

      {/* 문의 목록 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>로딩 중...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>문의 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDetailClick(inquiry)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      inquiry.visibility === "PRIVATE" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {inquiry.visibility === "PRIVATE" ? "비공개" : "공개"}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      inquiry.status === "PENDING" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {inquiry.status === "PENDING" ? "미처리" : "처리완료"}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{inquiry.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    문의자: {inquiry.authorNickname} | 날짜: {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
                    <span className="text-gray-600">공개 여부:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedInquiry.visibility === "PRIVATE" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {selectedInquiry.visibility === "PRIVATE" ? "비공개" : "공개"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">문의자:</span>
                    <span className="ml-2 font-medium">{selectedInquiry.authorNickname}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">문의일:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">처리 상태:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedInquiry.status === "PENDING" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedInquiry.status === "PENDING" ? "미처리" : "처리완료"}
                    </span>
                  </div>
                  {selectedInquiry.updatedAt && (
                    <div>
                      <span className="text-gray-600">수정일:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedInquiry.updatedAt).toLocaleDateString('ko-KR')}
                      </span>
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

              {/* 관리자 답변 목록 */}
              {answers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">관리자 답변</h4>
                  <div className="space-y-3">
                    {answers.map((answer) => (
                      <div key={answer.answerId} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {answer.adminNickname}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(answer.createdAt).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-gray-900 whitespace-pre-wrap">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 답변 작성 폼 */}
              {selectedInquiry.status === "PENDING" && (
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