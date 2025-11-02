"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import { useEscapeKey } from "../../../src/hooks/useEscapeKey";
import { getAdminMembers, addAdminPenalty, suspendAdminUser } from "@/lib/api";

interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  penaltyCount: number;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // 회원 목록 조회
  useEffect(() => {
    fetchMembers();
  }, [activeTab, currentPage, searchTerm]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // 백엔드가 기대하는 status 값: "normal", "suspended", 또는 undefined (all)
      const status = activeTab === "all" ? undefined : activeTab === "active" ? "normal" : activeTab;
      const response = await getAdminMembers({
        page: currentPage - 1,
        size: 10,
        search: searchTerm,
        status,
      });

      // API 응답 구조에 따라 조정
      // Spring Data Page 구조: { content: [...], totalPages: N, totalElements: M, ... }
      const pageData = response?.data || response;
      const memberList = pageData?.content || [];
      const totalPagesCount = pageData?.totalPages || 1;
      
      setMembers(memberList);
      setTotalPages(totalPagesCount);
      
      console.log("API 응답:", {
        members: memberList.length,
        totalPages: totalPagesCount,
        currentPage,
        response
      });
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 모달 상태
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showSuspensionConfirmModal, setShowSuspensionConfirmModal] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [penaltyReason, setPenaltyReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showSuspensionConfirmModal) {
      setShowSuspensionConfirmModal(false);
    }
  });


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 페널티 모달 관련 함수들
  const handlePenaltyClick = (member: any) => {
    setSelectedMember(member);
    setPenaltyReason("");
    setShowPenaltyModal(true);
  };

  const handlePenaltyConfirm = async () => {
    if (selectedMember && penaltyReason.trim()) {
      try {
        await addAdminPenalty(selectedMember.id, {
          reason: penaltyReason,
          reasonCode: "DISCOMFORT",
        });

        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === selectedMember.id
              ? { ...member, penaltyCount: member.penaltyCount + 1 }
              : member
          )
        );
        setShowPenaltyModal(false);
        setSelectedMember(null);
        setPenaltyReason("");
      } catch (error) {
        console.error("페널티 부여 실패:", error);
      }
    }
  };

  const handlePenaltyCancel = () => {
    setShowPenaltyModal(false);
    setSelectedMember(null);
    setPenaltyReason("");
  };

  // 정지 모달 관련 함수들
  const handleSuspensionClick = (member: any) => {
    setSelectedMember(member);
    setSuspensionReason("");

    // 정지 해제인 경우 확인 모달 먼저 표시
    if (member.status === "suspended") {
      setShowSuspensionConfirmModal(true);
    } else {
      setShowSuspensionModal(true);
    }
  };

  const handleSuspensionConfirm = async () => {
    if (selectedMember && suspensionReason.trim()) {
      try {
        await suspendAdminUser(selectedMember.id, {
          duration: "7d",
          reason: suspensionReason,
        });

        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  status: member.status === "active" ? "suspended" : "active",
                }
              : member
          )
        );
        setShowSuspensionModal(false);
        setSelectedMember(null);
        setSuspensionReason("");
      } catch (error) {
        console.error("회원 정지 실패:", error);
      }
    }
  };

  const handleSuspensionCancel = () => {
    setShowSuspensionModal(false);
    setSelectedMember(null);
    setSuspensionReason("");
  };

  // 정지 해제 확인 모달 관련 함수들
  const handleSuspensionConfirmClick = async () => {
    if (selectedMember) {
      try {
        // 정지 해제는 suspend API로 status를 변경
        await suspendAdminUser(selectedMember.id, {
          duration: "0d",
          reason: "정지 해제",
        });

        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === selectedMember.id
              ? { ...member, status: "active" }
              : member
          )
        );
      } catch (error) {
        console.error("정지 해제 실패:", error);
      }
    }
    setShowSuspensionConfirmModal(false);
    setShowSuspensionModal(true);
  };

  const handleSuspensionConfirmCancel = () => {
    setShowSuspensionConfirmModal(false);
    setSelectedMember(null);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "all"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          전체 회원
        </button>
        <button
          onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          정상 회원
        </button>
        <button
          onClick={() => { setActiveTab("suspended"); setCurrentPage(1); }}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "suspended"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          정지 회원
        </button>
      </div>

      {/* 검색바 */}

      <div className="w-full max-w-4/5">
        <SearchBar
          placeholder="이름, 이메일로 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="text-sm text-gray-500">
        총 {members.length}명 회원
      </div>

      {/* 회원 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">회원 데이터를 불러오는 중...</p>
        </div>
      ) : (
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/admin/members/${member.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-sm text-gray-500">
                  페널티: {member.penaltyCount}회 | 상태:{" "}
                  {member.status === "active" ? "정상" : "정지"}
                </p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  color="warning"
                  size="sm"
                  onClick={() => handlePenaltyClick(member)}
                >
                  페널티
                </Button>
                <Button
                  color={member.status === "active" ? "warning" : "gray"}
                  size="sm"
                  onClick={() => handleSuspensionClick(member)}
                >
                  {member.status === "active" ? "정지" : "정지 해제"}
                </Button>
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

      {/* 페널티 모달 */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              페널티 사유 입력
            </h3>
            <input
              type="text"
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              placeholder="페널티 사유를 입력하세요"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-6"
            />
            <div className="flex gap-3 justify-end">
              <Button color="gray" size="md" onClick={handlePenaltyCancel}>
                취소
              </Button>
              <Button
                color="primary"
                size="md"
                onClick={handlePenaltyConfirm}
                disabled={!penaltyReason.trim()}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 정지 해제 확인 모달 */}
      {showSuspensionConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              정지 해제 확인
            </h3>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">"{selectedMember?.name}"</span>{" "}
              회원의 정지를 해제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                color="gray"
                size="md"
                onClick={handleSuspensionConfirmCancel}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="md"
                onClick={handleSuspensionConfirmClick}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 정지 모달 */}
      {showSuspensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              정지 사유 입력
            </h3>
            <input
              type="text"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="정지 사유를 입력하세요"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-6"
            />
            <div className="flex gap-3 justify-end">
              <Button color="gray" size="md" onClick={handleSuspensionCancel}>
                취소
              </Button>
              <Button
                color="warning"
                size="md"
                onClick={handleSuspensionConfirm}
                disabled={!suspensionReason.trim()}
              >
                {selectedMember?.status === "active" ? "정지하기" : "정지 해제"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
