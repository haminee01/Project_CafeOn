"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import { useEscapeKey } from "../../../src/hooks/useEscapeKey";
import {
  getAdminReports,
  getAdminReportDetail,
  updateAdminReport,
  deleteReview,
} from "@/lib/api";
import { deletePostMutator, deleteCommentMutator } from "@/api/community";

// 날짜 포맷 함수
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

interface Report {
  id: number;
  type: "post" | "review" | "comment";
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
  targetId?: number; // 원본 콘텐츠 ID (리뷰 ID, 게시글 ID 등)
  parentId?: number; // 상위 ID (댓글→게시글, 리뷰→카페)
  cafeId?: number; // 카페 ID (리뷰인 경우)
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("unprocessed");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [deleteContent, setDeleteContent] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showDeleteConfirmModal) {
      setShowDeleteConfirmModal(false);
    }
  });

  // API에서 신고 목록 조회
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const status = activeTab === "unprocessed" ? "PENDING" : "RESOLVED";
        const response = await getAdminReports(status);
        const reportsData = response?.data || [];

        // API 응답을 프론트엔드 형식으로 변환
        const transformedReports = reportsData.map((r: any) => {
          // targetType 매핑 (POST, COMMENT, REVIEW)
          let type: "post" | "review" | "comment" = "review";
          if (r.targetType === "POST") {
            type = "post";
          } else if (r.targetType === "COMMENT") {
            type = "comment";
          } else if (r.targetType === "REVIEW") {
            type = "review";
          }

          return {
            id: r.reportId || r.id,
            type,
            content: r.content || "",
            status: r.status === "PENDING" ? "unprocessed" : "processed",
            date: formatDate(r.createdAt || ""),
            reporter: r.reporterNickname || "",
            reportedUser: r.reportedNickname || "",
            reason: r.content || "",
            targetId: r.targetId, // 원본 콘텐츠 ID
            cafeId: type === "review" ? r.targetId : undefined, // 리뷰인 경우 카페 ID
          };
        });

        setReports(transformedReports);
      } catch (error) {
        console.error("신고 목록 조회 실패:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [activeTab]);

  const filteredReports = reports.filter((report) =>
    activeTab === "unprocessed"
      ? report.status === "unprocessed"
      : report.status === "processed"
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = async (report: Report) => {
    try {
      // 상세 정보 조회
      const detail = await getAdminReportDetail(report.id);
      const detailData = detail?.data;

      if (detailData) {
        const enrichedReport: Report = {
          ...report,
          targetId: detailData.targetId, // 상세에서 targetId 가져오기
          parentId: detailData.parentId, // 상위 ID 가져오기 (댓글의 경우 postId, 리뷰의 경우 cafeId)
          originalTitle: detailData.target?.title,
          originalContent:
            detailData.target?.body || detailData.target?.content,
          originalImages: detailData.target?.imageUrls || [],
          adminComment: detailData.adminNote,
          processedBy: detailData.handledBy,
          processedDate: formatDate(detailData.handledAt || ""),
        };
        setSelectedReport(enrichedReport);
      } else {
        setSelectedReport(report);
      }
      setShowDetailModal(true);
    } catch (error) {
      console.error("신고 상세 조회 실패:", error);
      // 실패 시 기본 정보만 표시
      setSelectedReport(report);
      setShowDetailModal(true);
    }
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

  const processReport = async () => {
    if (!selectedReport) return;

    try {
      // 삭제 옵션이 체크되어 있으면 실제 콘텐츠 삭제
      if (deleteContent) {
        if (selectedReport.type === "review" && selectedReport.targetId) {
          // 리뷰 삭제
          await deleteReview(selectedReport.targetId.toString());
        } else if (
          selectedReport.type === "comment" &&
          selectedReport.targetId &&
          selectedReport.parentId
        ) {
          // 댓글 삭제 - postId가 필요하므로 신고 상세에서 가져온 parentId 사용
          await deleteCommentMutator(selectedReport.parentId, selectedReport.targetId);
        } else if (selectedReport.type === "post" && selectedReport.targetId) {
          // 게시글 삭제
          await deletePostMutator(selectedReport.targetId);
        }
      }

      // 신고 처리 API 호출
      const status = deleteContent ? "RESOLVED" : "REJECTED";
      await updateAdminReport(selectedReport.id, { status });

      // 성공 시 목록에서 제거
      setReports((prevReports) =>
        prevReports.filter((r) => r.id !== selectedReport.id)
      );

      setShowProcessModal(false);
      setShowDeleteConfirmModal(false);
      setShowDetailModal(false);
      setSelectedReport(null);
      setAdminComment("");
      setDeleteContent(false);
    } catch (error) {
      console.error("신고 처리 실패:", error);
      // 에러 발생해도 모달은 닫기
      setShowProcessModal(false);
      setShowDeleteConfirmModal(false);
    }
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
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">신고 내역을 불러오는 중...</p>
        </div>
      ) : (
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
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.type === "post"
                          ? "bg-blue-100 text-blue-800"
                          : report.type === "comment"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {report.type === "post"
                        ? "게시글신고"
                        : report.type === "comment"
                        ? "댓글신고"
                        : "리뷰신고"}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === "unprocessed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
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
      )}

      {/* 페이지네이션 */}
      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}

      {/* 신고 상세보기 모달 */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                신고 내역 상세보기
              </h3>
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
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedReport.type === "post"
                          ? "bg-blue-100 text-blue-800"
                          : selectedReport.type === "comment"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedReport.type === "post"
                        ? "게시글신고"
                        : selectedReport.type === "comment"
                        ? "댓글신고"
                        : "리뷰신고"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고자:</span>
                    <span className="ml-2 font-medium">
                      {selectedReport.reporter}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고된 사용자:</span>
                    <span className="ml-2 font-medium">
                      {selectedReport.reportedUser}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고일:</span>
                    <span className="ml-2 font-medium">
                      {selectedReport.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">신고 사유:</span>
                    <span className="ml-2 font-medium">
                      {selectedReport.reason}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">처리 상태:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedReport.status === "unprocessed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedReport.status === "unprocessed"
                        ? "미처리"
                        : "처리완료"}
                    </span>
                  </div>
                  {selectedReport.processedDate && (
                    <div>
                      <span className="text-gray-600">처리일:</span>
                      <span className="ml-2 font-medium">
                        {selectedReport.processedDate}
                      </span>
                    </div>
                  )}
                  {selectedReport.processedBy && (
                    <div>
                      <span className="text-gray-600">처리자:</span>
                      <span className="ml-2 font-medium">
                        {selectedReport.processedBy}
                      </span>
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
                  {selectedReport.type === "post"
                    ? "원본 게시글"
                    : selectedReport.type === "comment"
                    ? "원본 댓글"
                    : "원본 리뷰"}
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {selectedReport.originalTitle && (
                    <h5 className="font-medium text-gray-900 mb-2">
                      {selectedReport.originalTitle}
                    </h5>
                  )}
                  <p className="text-gray-900 whitespace-pre-wrap mb-4">
                    {selectedReport.originalContent}
                  </p>

                  {/* 첨부 이미지 */}
                  {selectedReport.originalImages &&
                    selectedReport.originalImages.length > 0 && (
                      <div className="mt-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">
                          첨부 이미지
                        </h6>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedReport.originalImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`첨부 이미지 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  // 이미지 확대 모달 또는 새 탭에서 열기
                                  window.open(image, "_blank");
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    관리자 코멘트
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedReport.adminComment}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-between items-center gap-3 mt-6">
              <div className="flex gap-3">
                {selectedReport.type === "comment" && selectedReport.targetId && (
                  <Button
                    color="secondary"
                    size="md"
                    onClick={() => {
                      // 댓글의 경우 targetId가 commentId이므로,
                      // 백엔드에서 신고 상세 API에 postId를 추가로 반환해야 함
                      // 현재는 댓글 ID만 있으므로 경고 표시
                      alert(
                        "댓글 보기 기능은 아직 준비되지 않았습니다. 백엔드 API 수정이 필요합니다."
                      );
                    }}
                  >
                    원본 댓글 보기
                  </Button>
                )}
                {selectedReport.type === "post" && selectedReport.targetId && (
                  <Button
                    color="secondary"
                    size="md"
                    onClick={() => {
                      router.push(`/community/posts/${selectedReport.targetId}`);
                    }}
                  >
                    원본 게시글 보기
                  </Button>
                )}
                {selectedReport.type === "review" && selectedReport.targetId && (
                  <Button
                    color="secondary"
                    size="md"
                    onClick={() => {
                      router.push(`/cafes/${selectedReport.targetId}`);
                    }}
                  >
                    원본 리뷰 보기
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button color="gray" size="md" onClick={handleCloseModal}>
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
                <span className="font-medium">신고 유형:</span>{" "}
                {selectedReport.type === "post" ? "게시글신고" : "리뷰신고"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">신고 사유:</span>{" "}
                {selectedReport.reason}
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
                <label
                  htmlFor="deleteContent"
                  className="ml-2 text-sm text-gray-700"
                >
                  {selectedReport.type === "post" ? "게시글" : "리뷰"} 삭제
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {selectedReport.type === "post" ? "게시글" : "리뷰"}을 삭제하면
                복구할 수 없습니다.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button color="gray" size="md" onClick={handleProcessCancel}>
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
              {selectedReport.type === "post"
                ? "게시글"
                : selectedReport.type === "comment"
                ? "댓글"
                : "리뷰"}{" "}
              삭제 확인
            </h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-red-600">
                  {selectedReport.type === "post" ? "게시글" : "리뷰"}
                </span>
                을 삭제하시겠습니까?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ 삭제된 {selectedReport.type === "post" ? "게시글" : "리뷰"}
                  은 복구할 수 없습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button color="gray" size="md" onClick={handleDeleteCancel}>
                취소
              </Button>
              <Button color="warning" size="md" onClick={handleDeleteConfirm}>
                삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
