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
  const [useMockData, setUseMockData] = useState(false);

  const mockMembers = [
    { id: "1", name: "김철수", email: "kim@example.com", status: "active", penaltyCount: 0 },
    { id: "2", name: "이영희", email: "lee@example.com", status: "active", penaltyCount: 2 },
    { id: "3", name: "박민수", email: "park@example.com", status: "suspended", penaltyCount: 5 },
    { id: "4", name: "최유리", email: "choi@example.com", status: "active", penaltyCount: 0 },
    { id: "5", name: "정대현", email: "jung@example.com", status: "active", penaltyCount: 1 },
    { id: "6", name: "한지민", email: "han@example.com", status: "suspended", penaltyCount: 8 },
    { id: "7", name: "강동원", email: "kang@example.com", status: "active", penaltyCount: 0 },
    { id: "8", name: "송혜교", email: "song@example.com", status: "active", penaltyCount: 3 }
  ];

  // 회원 목록 조회
  useEffect(() => {
    fetchMembers();
  }, [activeTab, currentPage, searchTerm]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setMembers(mockMembers);
        setUseMockData(true);
        setLoading(false);
        return;
      }

      const status = activeTab === "all" ? undefined : activeTab.toUpperCase();
      const response = await getAdminMembers({
        page: currentPage - 1,
        size: 10,
        search: searchTerm,
        status
      });

      // API 응답 구조에 따라 조정
      const memberList = response?.data?.content || response?.content || [];
      setMembers(memberList);
      setUseMockData(false);
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
      setMembers(mockMembers);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // 모달 상태
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showSuspensionConfirmModal, setShowSuspensionConfirmModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [penaltyReason, setPenaltyReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");

  // ESC 키 이벤트 처리
  useEscapeKey(() => {
    if (showSuspensionConfirmModal) {
      setShowSuspensionConfirmModal(false);
    }
  });

  const filteredMembers = members.filter(member => {
    const matchesTab = activeTab === "all" || member.status === activeTab;
    const matchesSearch = searchTerm.trim() === "" || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

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
        if (!useMockData) {
          await addAdminPenalty(selectedMember.id, {
            reason: penaltyReason,
            reason_code: "DISCOMFORT"
          });
        }
        
        setMembers(prevMembers => 
          prevMembers.map(member => 
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
        if (!useMockData) {
          await suspendAdminUser(selectedMember.id, {
            duration: "7d",
            reason: suspensionReason
          });
        }
        
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member.id === selectedMember.id 
              ? { ...member, status: member.status === "active" ? "suspended" : "active" }
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
        if (!useMockData) {
          // 정지 해제는 suspend API로 status를 변경
          await suspendAdminUser(selectedMember.id, {
            duration: "0d",
            reason: "정지 해제"
          });
        }
        
        setMembers(prevMembers => 
          prevMembers.map(member => 
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
    setSelectedMember(null);
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
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "all"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          전체 회원
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-base font-medium ${
            activeTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          정상 회원
        </button>
        <button
          onClick={() => setActiveTab("suspended")}
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
          총 {filteredMembers.length}명 회원
        </div>


      {/* 회원 목록 */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
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
                  페널티: {member.penaltyCount}회 | 
                  상태: {member.status === "active" ? "정상" : "정지"}
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
              <Button 
                color="gray" 
                size="md"
                onClick={handlePenaltyCancel}
              >
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
              <span className="font-medium">"{selectedMember?.name}"</span> 회원의 정지를 해제하시겠습니까?
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
              <Button 
                color="gray" 
                size="md"
                onClick={handleSuspensionCancel}
              >
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