import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "검색어를 입력하세요",
    value = "",
    onChange,
    onSearch,
    disabled = false
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(onChange) 
            {onChange(e.target.value)}
    }

    const handleSearch = () => {
        if(onSearch) {
            onSearch(value)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className="relative flex items-center">
            <div className="relative flex-1">
                <input 
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full border-2 border-primary rounded-full px-4 py-3 pr-16 placeholder-gray-400 focus:outline-none
        focus:ring-0
        focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSearch}
                    disabled={disabled || !value.trim()}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center disabled:cursor-not-allowed"
                >
                    <FaSearch className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    )
}

export default SearchBar;