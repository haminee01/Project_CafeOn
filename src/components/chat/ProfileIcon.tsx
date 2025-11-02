import React from "react";

interface ProfileIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "amber";
  imageUrl?: string | null;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  className = "",
  size = "md",
  variant = "default",
  imageUrl,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const bgClasses = {
    default: "#F2EAE0",
    amber: "#F2EAE0",
  };

  const textClasses = {
    default: "text-gray-600",
    amber: "text-amber-900",
  };

  // 프로필 이미지가 있으면 이미지를 표시
  if (imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img
          src={imageUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 이미지가 없으면 기본 아이콘 표시
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
      style={{ backgroundColor: bgClasses[variant] }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="user"
        className={`${iconSizes[size]} ${textClasses[variant]}`}
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
      >
        <path
          fill="currentColor"
          d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
        />
      </svg>
    </div>
  );
};

export default ProfileIcon;
