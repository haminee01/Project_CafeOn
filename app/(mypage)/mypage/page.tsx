"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  deleteUser,
  changePassword,
} from "@/lib/api";
import { FaUser } from "react-icons/fa";

const WithdrawalModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-full overflow-y-auto bg-gray-600 bg-opacity-50 w-full">
      <div className="relative p-8 w-80 max-w-sm mx-auto bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">정말로 탈퇴하시겠습니까?</h2>
        <p className="text-gray-700 mb-6">탈퇴하면 모든 정보가 삭제됩니다.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onCancel} size="sm" color="gray">
            취소
          </Button>
          <Button onClick={onConfirm} size="sm" color="warning">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
};

const PasswordAlert = () => (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#999999] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeInOut">
    비밀번호가 변경되었습니다.
  </div>
);

export default function MypageMainPage() {
  const [profile, setProfile] = useState({
    nickname: "",
    name: "",
    email: "",
    profileImageUrl: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useRef 훅을 사용하여 숨겨진 input 요소에 접근
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 페이지 로드 시 회원 정보 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        const userData = response.data;
        setProfile({
          nickname: userData.nickname || "",
          name: userData.name || "",
          email: userData.email || "",
          profileImageUrl: userData.profileImageUrl || "",
        });
      } catch (error) {
        console.error("회원 정보 조회 실패:", error);
        alert(
          error instanceof Error
            ? error.message
            : "회원 정보를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 닉네임 저장 핸들러
  const handleSaveNickname = async () => {
    if (!profile.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      await updateUserProfile(profile.nickname);
      alert("회원정보가 수정되었습니다.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "회원 정보 수정에 실패했습니다."
      );
    }
  };

  // 프로필 사진 변경 버튼 클릭 핸들러
  const handleProfileImageChange = () => {
    // 숨겨진 input 태그 클릭
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 호출되는 핸들러
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await updateProfileImage(file);
        const newImageUrl = response.data.profileImageUrl;
        setProfile({
          ...profile,
          profileImageUrl: newImageUrl,
        });
        alert("프로필 이미지가 변경되었습니다.");
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "프로필 이미지 변경에 실패했습니다."
        );
      }
    }
  };

  // 회원 탈퇴 모달 핸들러
  const handleOpenWithdrawalModal = () => setIsWithdrawalModalOpen(true);
  const handleCancelWithdrawal = () => setIsWithdrawalModalOpen(false);
  const handleConfirmWithdrawal = async () => {
    try {
      await deleteUser();
      alert("회원탈퇴가 완료되었습니다.");
      // 로컬 스토리지 정리 및 로그인 페이지로 이동
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다."
      );
    } finally {
      setIsWithdrawalModalOpen(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    // 입력값 검증
    if (!oldPassword) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (!newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (oldPassword === newPassword) {
      alert("현재 비밀번호와 새 비밀번호가 같습니다.");
      return;
    }

    try {
      await changePassword({
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      // 성공 시 알림 표시
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 3000);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다."
      );
    }
  };

  const ProfileIcon = () => (
    <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-4 border-[#C19B6C] overflow-hidden">
      {profile.profileImageUrl ? (
        <img
          src={profile.profileImageUrl}
          alt="프로필 사진"
          className="w-full h-full object-cover"
        />
      ) : (
        <FaUser className="w-16 h-16 text-gray-400" />
      )}
    </div>
  );

  const isPasswordChangeEnabled =
    oldPassword.length > 0 &&
    newPassword.length > 0 &&
    newPassword === confirmPassword;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">회원정보</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex flex-col items-center p-6 bg-white border-none border-gray-100 rounded-2xl shadow-sm lg:w-1/3 min-w-[250px] max-w-sm mx-auto lg:mx-0">
          <ProfileIcon />
          <p className="mt-4 text-xl font-semibold text-gray-800">
            {profile.nickname || "닉네임 없음"}
          </p>
          <button
            className="mt-3 text-sm text-gray-500 hover:text-[#C19B6C] transition-colors"
            onClick={handleProfileImageChange}
          >
            프로필 사진 변경
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex-1 space-y-8 p-0">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">
                닉네임
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={(e) =>
                    setProfile({ ...profile, nickname: e.target.value })
                  }
                  className="flex-1 px-4 py-3 border border-[#999999] rounded-xl focus:border-amber-500 focus:ring-amber-500"
                />
                <Button
                  size="md"
                  color="primary"
                  onClick={handleSaveNickname}
                  className="hover:bg-[#6E4213]"
                >
                  저장
                </Button>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">
                이름
              </span>
              <input
                type="text"
                value={profile.name}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl cursor-not-allowed"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">
                이메일
              </span>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl cursor-not-allowed"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-[#CDCDCD]">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              비밀번호 변경
            </span>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#999999] rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#999999] rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#999999] rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                size="md"
                color="primary"
                onClick={handleChangePassword}
                className={`mt-2 ${
                  isPasswordChangeEnabled
                    ? "hover:bg-[#6E4213]"
                    : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!isPasswordChangeEnabled}
              >
                변경하기
              </Button>
            </div>
          </div>

          <div className="pt-8 text-right">
            <button
              onClick={handleOpenWithdrawalModal}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors underline"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {isWithdrawalModalOpen && (
        <WithdrawalModal
          onConfirm={handleConfirmWithdrawal}
          onCancel={handleCancelWithdrawal}
        />
      )}

      {showAlert && <PasswordAlert />}
    </div>
  );
}
