import { LayoutGrid, Map as MapIcon } from 'lucide-react';
import React from 'react';

interface ViewToggleProps {
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex bg-[#f3f4f6] p-1 rounded-xl w-fit">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          viewMode === 'grid'
            ? 'bg-white text-[#1344FF] shadow-sm'
            : 'text-[#666666] hover:text-[#1a1a1a]'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        그리드 보기
      </button>
      <button
        onClick={() => onViewModeChange('map')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          viewMode === 'map'
            ? 'bg-white text-[#1344FF] shadow-sm'
            : 'text-[#666666] hover:text-[#1a1a1a]'
        }`}
      >
        <MapIcon className="w-4 h-4" />
        지도 보기
      </button>
    </div>
  );
};
