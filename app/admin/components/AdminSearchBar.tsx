"use client";

import SearchBar from "@/components/common/SearchBar";

interface AdminSearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  resultLabel: string;
}

export default function AdminSearchBar({ 
  placeholder, 
  value, 
  onChange, 
  resultCount, 
  resultLabel 
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md">
        <SearchBar
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
      <div className="text-sm text-gray-500">
        총 {resultCount}{resultLabel}
      </div>
    </div>
  );
}
