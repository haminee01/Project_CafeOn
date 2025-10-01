"use client";

import React, { useState, useRef } from "react";
import Button from "@/components/common/Button";

const demoKeywords = [
  "#데이트",
  "#우중카페",
  "#카공",
  "#조용한",
  "#애견동반",
  "#테라스",
  "#디저트",
  "#스터디",
  "#24시간",
];

interface KeywordModalProps {
  currentKeywords: string[];
  onSave: (newKeywords: string[]) => void;
  onClose: () => void;
}

const KeywordModal: React.FC<KeywordModalProps> = ({
  currentKeywords,
  onSave,
  onClose,
}) => {
  const [selectedKeywords, setSelectedKeywords] =
    useState<string[]>(currentKeywords);
  const maxKeywords = 5;

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
    } else {
      if (selectedKeywords.length < maxKeywords) {
        setSelectedKeywords([...selectedKeywords, keyword]);
      } else {
        alert(`최대 ${maxKeywords}개까지만 선택할 수 있습니다.`);
      }
    }
  };

  const handleSave = () => {
    onSave(selectedKeywords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-full overflow-y-auto bg-gray-600 bg-opacity-50 w-full">
      <div className="relative p-8 w-96 max-w-sm mx-auto bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">선호 키워드 변경</h2>
        <p className="text-sm text-gray-500 mb-4">
          최대 {maxKeywords}개까지 선택할 수 있습니다.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {demoKeywords.map((keyword) => (
            <span
              key={keyword}
              onClick={() => handleKeywordClick(keyword)}
              className={`
                px-3 py-1 rounded-full cursor-pointer transition-colors duration-200
                ${
                  selectedKeywords.includes(keyword)
                    ? "bg-[#C19B6C] text-white font-semibold"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
              `}
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} size="sm" color="gray">
            취소
          </Button>
          <Button onClick={handleSave} size="sm" color="primary">
            저장
          </Button>
        </div>
      </div>
    </div>
  );
};

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
    name: "김이름",
    email: "test@test.com",
    keywords: "#데이트 #우중카페 #카공",
    imageUrl: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // useRef 훅을 사용하여 숨겨진 input 요소에 접근
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 프로필 사진 변경 버튼 클릭 핸들러
  const handleProfileImageChange = () => {
    // 숨겨진 input 태그 클릭
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 호출되는 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // FileReader를 사용하여 파일 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({
          ...profile,
          imageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 선호 키워드 모달 핸들러
  const handleOpenKeywordModal = () => setIsKeywordModalOpen(true);
  const handleCloseKeywordModal = () => setIsKeywordModalOpen(false);
  const handleSaveKeywords = (newKeywords: string[]) => {
    const newKeywordsString = newKeywords.join(" ");
    setProfile({ ...profile, keywords: newKeywordsString });
  };

  // 회원 탈퇴 모달 핸들러
  const handleOpenWithdrawalModal = () => setIsWithdrawalModalOpen(true);
  const handleCancelWithdrawal = () => setIsWithdrawalModalOpen(false);
  const handleConfirmWithdrawal = () => {
    alert("회원 탈퇴가 완료되었습니다.");
    setIsWithdrawalModalOpen(false);
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = () => {
    if (password && password === confirmPassword) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setPassword("");
        setConfirmPassword("");
      }, 3000);
    } else if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
    } else {
      alert("비밀번호를 입력해주세요.");
    }
  };

  const ProfileIcon = () => (
    <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-4 border-[#C19B6C] overflow-hidden">
      {profile.imageUrl ? (
        <img
          src={profile.imageUrl}
          alt="프로필 사진"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-6xl"></span>
      )}
    </div>
  );

  const KeywordBadge = ({ keyword }: { keyword: string }) => (
    <span className="inline-block bg-[#999999] text-white text-sm font-medium mr-2 px-3 py-1 rounded-full">
      {keyword}
    </span>
  );

  const isPasswordChangeEnabled =
    password.length > 0 && password === confirmPassword;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">회원정보</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex flex-col items-center p-6 bg-white border-none border-gray-100 rounded-2xl shadow-sm lg:w-1/3 min-w-[250px] max-w-sm mx-auto lg:mx-0">
          <ProfileIcon />
          <p className="mt-4 text-xl font-semibold text-gray-800">닉네임님</p>
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
                이름
              </span>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-[#999999] rounded-xl focus:border-amber-500 focus:ring-amber-500"
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
              선호 키워드 설정
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-base font-medium text-gray-700">
                키워드
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.keywords.split(" ").map((keyword, index) => (
                  <KeywordBadge key={index} keyword={keyword} />
                ))}
              </div>
            </div>
            <Button
              size="sm"
              color="primary"
              onClick={handleOpenKeywordModal}
              className="mt-2 hover:bg-[#C19B6C]"
            >
              선호 키워드 변경
            </Button>
          </div>

          <div className="pt-4 border-t border-[#CDCDCD]">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              비밀번호 변경
            </span>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="변경할 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#999999] rounded-xl focus:border-amber-500 focus:ring-amber-500"
              />
              <input
                type="password"
                placeholder="재입력"
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

      {isKeywordModalOpen && (
        <KeywordModal
          currentKeywords={profile.keywords.split(" ")}
          onSave={handleSaveKeywords}
          onClose={handleCloseKeywordModal}
        />
      )}

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
