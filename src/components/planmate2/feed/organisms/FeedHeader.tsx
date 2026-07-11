import { Filter } from 'lucide-react';
import React from 'react';
import { SearchBar } from '../molecules/SearchBar';

interface FeedHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">가져가는 여행기</h1>
            <p className="text-xs text-gray-500">계획은 1초 만에, 여행은 100% 즐겁게</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <SearchBar 
          value={searchQuery} 
          onChange={onSearchChange} 
          placeholder="지역, 테마로 검색해보세요" 
        />
      </div>
    </div>
  );
};
