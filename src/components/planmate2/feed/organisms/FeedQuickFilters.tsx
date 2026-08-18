import { X } from 'lucide-react';
import React from 'react';

interface FeedQuickFiltersProps {
  /** 지금 걸려 있는 필터 — 칩 하나당 해제 버튼을 준다 */
  activeChips: { key: string; label: string; onRemove: () => void }[];
  onClearAll: () => void;
}

/**
 * 목록 바로 위에 "지금 무슨 필터가 걸렸는지"만 둔다. 지역·정렬 선택은 상세 필터 패널이 담당한다.
 * 걸린 필터가 없으면 아무것도 그리지 않는다 — 빈 줄이 남으면 목록이 그만큼 아래로 밀린다.
 */
export const FeedQuickFilters: React.FC<FeedQuickFiltersProps> = ({
  activeChips,
  onClearAll,
}) => {
  if (activeChips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {activeChips.map(chip => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef2ff] text-[#1344FF] text-[12px] font-bold hover:bg-[#e0e7ff] transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-[12px] text-[#9aa0ab] hover:text-[#1344FF] underline underline-offset-2"
      >
        전체 해제
      </button>
    </div>
  );
};
