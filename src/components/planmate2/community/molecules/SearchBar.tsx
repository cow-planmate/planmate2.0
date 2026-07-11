import { PenTool, Search } from 'lucide-react';

interface SearchBarProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onWriteClick: () => void;
}

export const SearchBar = ({ title, searchQuery, onSearchChange, onWriteClick }: SearchBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <input
          type="text"
          placeholder={`${title} 내 검색...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#1344FF] transition-colors bg-white text-sm shadow-sm"
        />
      </div>
      <button 
        onClick={onWriteClick}
        className="px-5 py-2 bg-[#1344FF] text-white rounded-lg hover:bg-[#0d34cc] transition-all shadow-sm font-medium text-sm flex items-center justify-center gap-2"
      >
        <PenTool className="w-4 h-4" />
        글쓰기
      </button>
    </div>
  );
};
