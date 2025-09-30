"use client";

import { useState } from "react";

interface SaveModalProps {
  onClose: () => void;
  cafe: {
    name: string;
    address: string;
  };
}

export default function SaveModal({ onClose, cafe }: SaveModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    {
      id: "my-space",
      name: "나만의 아지트",
      description: "혼자만의 시간을 보내고 싶은 곳",
      icon: "🏠"
    },
    {
      id: "work-friendly",
      name: "작업하기 좋은",
      description: "공부나 업무에 집중할 수 있는 곳",
      icon: "💻"
    },
    {
      id: "atmosphere",
      name: "분위기",
      description: "특별한 분위기를 느끼고 싶을 때",
      icon: "✨"
    },
    {
      id: "food-quality",
      name: "커피, 디저트 맛집",
      description: "맛있는 음료와 디저트를 원할 때",
      icon: "☕"
    },
    {
      id: "wishlist",
      name: "방문예정, 찜",
      description: "나중에 꼭 가보고 싶은 곳",
      icon: "❤️"
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = () => {
    console.log('저장된 카테고리:', selectedCategories);
    console.log('카페:', cafe);
    // 실제 구현에서는 API 호출로 저장
    alert(`${selectedCategories.length}개 카테고리에 저장되었습니다!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-900">카페 저장하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        
          <h3 className="font-semibold text-gray-900 mb-2">{cafe.name}</h3>
          
        

        <div className="space-y-3 mb-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCategories.includes(category.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedCategories.includes(category.id)
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {selectedCategories.includes(category.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={selectedCategories.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedCategories.length > 0
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            저장하기 ({selectedCategories.length})
          </button>
        </div>
      </div>
    </div>
  );
}
