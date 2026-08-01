import { ArrowDownWideNarrow, ArrowUpNarrowWide, X } from 'lucide-react';
import React from 'react';
import { regionLabel } from '../utils/region';

/** 정렬 기준마다 방향의 의미가 달라 라벨을 따로 준다 (최신순 오름차순 = 오래된 순) */
const ORDER_LABELS: Record<string, { desc: string; asc: string }> = {
  '최신순': { desc: '최신순', asc: '오래된순' },
};
const DEFAULT_ORDER_LABELS = { desc: '높은순', asc: '낮은순' };

interface DetailFilterPanelProps {
  onClear: () => void;
  regions: string[];
  durations: string[];
  sortOptions: string[];
  selectedRegion: string;
  selectedDuration: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onRegionChange: (val: string) => void;
  onDurationChange: (val: string) => void;
  onSortChange: (val: string) => void;
  onSortOrderChange: (val: 'asc' | 'desc') => void;
}

export const DetailFilterPanel: React.FC<DetailFilterPanelProps> = ({
  onClear,
  regions,
  durations,
  sortOptions,
  selectedRegion,
  selectedDuration,
  sortBy,
  sortOrder,
  onRegionChange,
  onDurationChange,
  onSortChange,
  onSortOrderChange
}) => {
  const orderLabels = ORDER_LABELS[sortBy] ?? DEFAULT_ORDER_LABELS;

  return (
    <div className="mb-6 bg-white rounded-xl shadow-md p-6 border border-[#e5e7eb]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a1a1a]">상세 필터</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm text-[#666666] hover:text-[#1344FF] transition-colors"
        >
          <X className="w-4 h-4" />
          초기화
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 지역 필터 */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1a] mb-2">지역</label>
          {/* 지역 수가 많아질 수 있어 스크롤 처리 */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => onRegionChange(region)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedRegion === region
                    ? 'bg-[#1344FF] text-white'
                    : 'bg-gray-50 text-[#666666] hover:bg-gray-100'
                }`}
              >
                {regionLabel(region)}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 필터 */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1a] mb-2">여행 기간</label>
          <div className="flex flex-wrap gap-2">
            {durations.map(duration => (
              <button
                key={duration}
                onClick={() => onDurationChange(duration)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedDuration === duration
                    ? 'bg-[#1344FF] text-white'
                    : 'bg-gray-50 text-[#666666] hover:bg-gray-100'
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        {/* 정렬 필터 */}
        <div>
          <label className="block text-sm font-bold text-[#1a1a1a] mb-2">정렬 기준</label>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map(option => (
              <button
                key={option}
                onClick={() => onSortChange(option)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === option
                    ? 'bg-[#1344FF] text-white'
                    : 'bg-gray-50 text-[#666666] hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* 정렬 방향 — 기준과 별개로 항상 토글할 수 있다 */}
          <div className="flex gap-2 mt-3">
            {(['desc', 'asc'] as const).map(order => {
              const Icon = order === 'desc' ? ArrowDownWideNarrow : ArrowUpNarrowWide;
              return (
                <button
                  key={order}
                  onClick={() => onSortOrderChange(order)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    sortOrder === order
                      ? 'bg-[#1344FF] text-white'
                      : 'bg-gray-50 text-[#666666] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {orderLabels[order]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
