import React from 'react';

/**
 * 목록 로딩 자리표시자.
 * "불러오는 중..." 한 줄만 띄우면 로딩이 끝나는 순간 레이아웃이 통째로 튀어서
 * 사용자가 스크롤 위치를 잃는다 — 실제 카드와 같은 골격을 미리 잡아둔다.
 */
export const PostCardSkeleton: React.FC<{ viewMode: 'grid' | 'list'; count?: number }> = ({
  viewMode,
  count = 4,
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-[#ececf0] overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 sm:px-6 sm:py-5 border-b border-[#f0f1f4] last:border-b-0 animate-pulse">
            <div className="w-[72px] h-[72px] sm:w-24 sm:h-24 shrink-0 rounded-xl bg-[#eef0f3]" />
            <div className="flex-1 min-w-0 space-y-2 py-1">
              <div className="h-3 w-24 rounded bg-[#eef0f3]" />
              <div className="h-4 w-2/3 rounded bg-[#eef0f3]" />
              <div className="h-3 w-1/2 rounded bg-[#f3f4f6]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#ececf0] overflow-hidden animate-pulse">
          <div className="aspect-[16/10] bg-[#eef0f3]" />
          <div className="p-4 space-y-2.5">
            <div className="h-4 w-4/5 rounded bg-[#eef0f3]" />
            <div className="h-3 w-full rounded bg-[#f3f4f6]" />
            <div className="h-3 w-1/3 rounded bg-[#f3f4f6]" />
            <div className="pt-3 border-t border-[#f0f1f4] flex gap-3">
              <div className="h-3 w-8 rounded bg-[#f3f4f6]" />
              <div className="h-3 w-8 rounded bg-[#f3f4f6]" />
              <div className="h-3 w-8 rounded bg-[#f3f4f6]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
