// src/components/notices/NoticeItem.tsx

interface NoticeItemProps {
  title: string;
  count: number;
}

const NoticeItem: React.FC<NoticeItemProps> = ({ title, count }) => {
  return (
    // 항목 클릭 시 상세 페이지로 이동하는 링크 역할
    <div className="py-4 border-b border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center text-lg font-medium text-gray-800">
        <span className="hover:text-amber-600 transition-colors">{title}</span>
        <span className="text-sm text-gray-500 ml-4">({count})</span>
      </div>
    </div>
  );
};

export default NoticeItem;
