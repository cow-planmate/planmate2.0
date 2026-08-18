import { Search } from 'lucide-react';

interface SearchBarProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onWriteClick?: () => void;
}

export const SearchBar = ({ title, searchQuery, onSearchChange }: SearchBarProps) => {
  return (
    <div className="relative">
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7c8492]" />
        <input
          type="text"
          placeholder={`${title} 내 검색...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={`${title} 검색`}
          className="min-h-14 w-full rounded-xl border border-[#d9dce2] bg-[#fbfcfd] pl-14 pr-4 text-[15px] outline-none transition-colors placeholder:text-[#a6abb5] focus:border-[#1344FF] focus:ring-2 focus:ring-[#1344FF]/10"
        />
    </div>
  );
};
