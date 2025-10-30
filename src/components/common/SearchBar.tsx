import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  placeholders?: string[];
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  animatePlaceholder?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "검색어를 입력하세요",
  placeholders,
  value = "",
  onChange,
  onSearch,
  disabled = false,
  animatePlaceholder = false,
}) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(value);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholder);

  // value prop 변경 시 searchValue 동기화
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // placeholder 애니메이션 효과
  useEffect(() => {
    if (!animatePlaceholder || !placeholders || placeholders.length === 0) {
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % placeholders.length;
      setCurrentPlaceholder(placeholders[currentIndex]);
    }, 2000); // 2초마다 변경

    return () => clearInterval(interval);
  }, [animatePlaceholder, placeholders]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      // onSearch가 제공되면 페이지 이동 없이 검색만 실행
      onSearch(searchValue);
    } else {
      // onSearch가 없으면 기존 동작 (search 페이지로 이동)
      if (searchValue.trim()) {
        // 검색어가 있으면 URL 파라미터로 전달
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      } else {
        // 검색어가 없으면 파라미터 없이 search 페이지로 이동
        router.push("/search");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative flex items-center w-5/12 mx-auto mb-10">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={currentPlaceholder}
          disabled={disabled}
          className="w-full border border-primary rounded-full px-3 py-2 placeholder-gray-400 focus:outline-none
        focus:ring-0
        focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        />
        <button
          onClick={handleSearch}
          disabled={disabled}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 mr-1 bg-primary rounded-full flex items-center justify-center disabled:cursor-not-allowed"
        >
          <FaSearch className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
