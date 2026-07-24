interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** 번호(1,2,3…) 기반 페이지네이션 — 현재 페이지 주변 최대 5개 버튼 + 이전/다음 */
export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const total = Math.max(totalPages, 1);
  const start = Math.max(0, Math.min(page - 2, total - 5));
  const end = Math.min(total, start + 5);
  const pageNumbers = Array.from({ length: end - start }, (_, i) => start + i);

  const arrowClass = (disabled: boolean) =>
    disabled
      ? 'w-7 h-7 rounded-lg text-gray-300 flex items-center justify-center text-xs cursor-not-allowed'
      : 'w-7 h-7 rounded-lg hover:bg-gray-100 text-[#666666] flex items-center justify-center text-xs transition-colors';

  return (
    <div className="flex justify-center items-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className={arrowClass(page === 0)}
        aria-label="이전 페이지"
      >
        ‹
      </button>
      {pageNumbers.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={
            p === page
              ? 'w-7 h-7 rounded-lg bg-[#1344FF] text-white flex items-center justify-center text-xs font-bold shadow-sm'
              : 'w-7 h-7 rounded-lg hover:bg-gray-100 text-[#666666] flex items-center justify-center text-xs font-medium transition-colors'
          }
        >
          {p + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= total - 1}
        className={arrowClass(page >= total - 1)}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </div>
  );
};
